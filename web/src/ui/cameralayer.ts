import { ShowKeyBindingsDef } from "../posh/keybindcommands";
import { MapEditorState } from "../posh/mapeditorstate";
import { IGameKeyboardHandler } from "../world/avatar";
import { Sprite } from "../graphics/Sprite";
import { animator } from "../graphics/animator";
import { KeyBinder, makeMEvent } from "./keybinder";
import { UiLayer2, UiLayerProps } from "./uilayer";
import { GridPos, gridPosToPxPos, PxPos, PxSize } from "../posh/pos";
import { autoDetectRenderer, Container as PixiContainer, IRenderer as IPixiRenderer, ICanvas as IPixiCanvas, Ticker as PixiTicker } from 'pixijs';
import { CodeLoader } from "../mechanics/codeloader";
import { IAvatar } from "../world/iavatar";
import _ from "lodash";
import { IMapEditor } from "./imapeditor";
import { IGameMap } from "../world/igamemap";

/*
export type CameraState = {
  scrollX: number;
  scrollY: number;
  interactiveHuman: Human;
}
*/

export type CameraLayerProps = UiLayerProps & {
  scale: number;
  gameMap: IGameMap;
  mapEditorState: MapEditorState;
  onOpenTerminal: () => void;
  onToggleEdit: () => void;
  onToggleTile: () => void;
}

export interface ICameraControl {
  refresh(): void;
  scrollBy(pxSize: PxSize): void;
  ensureVisible(pos: GridPos): void;
}

export function addCameraShortcuts(showKeyBindingsDef: ShowKeyBindingsDef) {
  showKeyBindingsDef.addKeyBinding('T', 'Open terminal');
  showKeyBindingsDef.addKeyBinding('E', 'Enter/edit edit mode');
  showKeyBindingsDef.addKeyBinding('I', 'Show/hide tile pane');

}

// camera displays map at specific position
// while editing, camera hosts IMapEditor and forwards events to it
export class CameraLayer extends UiLayer2<CameraLayerProps> implements ICameraControl {
  private isViewDirty: boolean = false;
  private scroll: PxPos = { x: 0, y: 0 };
  private avatar?: IAvatar;
  private keyboardHandler?: IGameKeyboardHandler;

  //private get canvas() { return this.element as HTMLCanvasElement; }
  private get canvasWidth(): number { return this.props.w / this.props.scale; }
  private get canvasHeight(): number { return this.props.h / this.props.scale; }
  private mapEditor?: IMapEditor;
  private input: KeyBinder;
  private pixiRenderer: IPixiRenderer<IPixiCanvas>;
  private rootContainer: PixiContainer;
  private viewportContainer: PixiContainer;
  private editorContainer: PixiContainer;
  private ticker: PixiTicker;

  public constructor(props: CameraLayerProps) {
    let div = document.createElement('div');
    div.setAttribute('tabindex', '0');

    super(props, div);

    this.ticker = PixiTicker.shared;
    this.ticker.start();

    _.bindAll(this, [
      'onAvatarMove',
      'onSpriteMove',
      'refresh',
      '_repaint'
    ])

    animator.start(this.ticker);
    this.props.gameMap.mechanics.start(this.ticker);

    // You may use the shared ticker to render...
    this.pixiRenderer = autoDetectRenderer();
    // @ts-ignore
    this.pixiRenderer.view.style!.position = 'absolute';
    // @ts-ignore
    this.pixiRenderer.view.style!.display = 'block';

    this.pixiRenderer.resize(props.w, props.h);

    this.rootContainer = new PixiContainer();
    this.viewportContainer = new PixiContainer();
    this.editorContainer = new PixiContainer();

    this.rootContainer.addChild(this.viewportContainer);

    // @ts-ignore
    div.appendChild(this.pixiRenderer.view);

    this.input = new KeyBinder(div, this.refresh);

    // all layers
    this.props.gameMap.forEachLayer(undefined, x => {
      this.viewportContainer.addChild(x.container!);
    });

    // add editor to viewport as top layer
    this.viewportContainer.addChild(this.editorContainer);

    // in camera, we always allow entering terminal
    this.input.registerKeyUp('KeyT', () => this.props.onOpenTerminal());
    this.input.registerKeyUp('KeyE', () => this.props.onToggleEdit());
    this.input.registerKeyUp('KeyI', () => this.props.onToggleTile());

    animator.onUpdateScene = (isDirty: boolean) => this.onUpdateScene(isDirty);
    //this.props.mapEditorState.onChanged(this, () => this.onMapEditorChanged());

    this.setScrollPos({ x: 0, y: 0 });

    // start animation
    let self = this;
    this.ticker.add(self._repaint);
  }

  public setEditor(mapEditor?: IMapEditor) {
    if (this.mapEditor !== undefined) {
      this.mapEditor.detach();
      this.props.mapEditorState.update({ invalidator: null })
    }

    if (mapEditor !== undefined) {
      mapEditor.attach(this.editorContainer, this.input);
      this.props.mapEditorState.update({
        invalidator: this,
        scrollSize: { w: this.props.w / this.props.scale, h: this.props.h / this.props.scale }
      });
    }

    this.mapEditor = mapEditor;
  }

  // set avatar to be center of game
  public setAvatar(avatar: IAvatar, keyboardHandler: IGameKeyboardHandler) {
    this.avatar = avatar;
    this.keyboardHandler = keyboardHandler;

    this.avatar.attachCamera(this.onAvatarMove);
    this.avatar.skin!.attachCamera(this.onSpriteMove);

    // once we attach handler, animator will request it every frame
    // when we edit, we want to detach handler and use direct methods
    animator.onInput = () => this.keyboardHandler?.handleKeyboard(this.input);

    this.setScrollPos(this.computeScrollPos(this.avatar.skin!.pos));
  }

  public resetAvatar() {
    if (this.avatar === undefined) {
      return;
    }

    this.avatar.attachCamera(undefined);
    this.avatar.skin?.attachCamera(undefined);
    this.avatar = undefined;
    this.keyboardHandler = undefined;
    animator.onInput = undefined;
  }

  public scrollBy(pxSize: PxSize): void {
    this.setScrollPos({ x: this.scroll.x + pxSize.w, y: this.scroll.y + pxSize.h });
    this.refresh();
  }

  public ensureVisible(pos: GridPos): void {
    let px = gridPosToPxPos(pos);
    this.ensureVisiblePx(px);
  }

  public ensureVisiblePx(px: PxPos): void {
    // ideal scroll
    let scroll = this.computeScrollPos(px);
    let updated = false;
    if (px.x < this.scroll.x || px.x > this.scroll.x + this.canvasWidth) {
      updated = true;
    } else {
      scroll.x = this.scroll.x;
    }
    if (px.y < this.scroll.y || px.y > this.scroll.y + this.canvasHeight) {
      updated = true;
    } else {
      scroll.y = this.scroll.y;
    }

    if (updated) {
      this.setScrollPos(scroll);
    }
  }

  public refresh() {
    if (this.isViewDirty) {
      return;
    }

    this.isViewDirty = true;
    let self = this;
    window.requestAnimationFrame(self._repaint);
  }

  // called when position of sprive we are tracking changes
  public onSpriteMove(sprite: Sprite) {
    let scroll = this.computeScrollPos(sprite.pos);

    this.setScrollPos(scroll);

    this.refresh();
  }

  private onAvatarMove(avatar: IAvatar) {
    if (avatar !== this.avatar) {
      return;
    }

    this.ensureVisiblePx(avatar.skin!.pos);
    this.refresh();
  }

  public onToggleLayer(nid: number) {

  }

  private setScrollPos(pos: PxPos) {
    this.scroll.x = Math.round(pos.x);
    this.scroll.y = Math.round(pos.y);
    this.viewportContainer.position = { x: -this.scroll.x, y: -this.scroll.y };
    this.props.gameMap.setViewport({ x: this.scroll.x, y: this.scroll.y, w: this.props.w, h: this.props.h });
  }

  public onMouseDown(htmlEvt: MouseEvent): boolean {
    let evt = makeMEvent(htmlEvt, this.scroll, this.props.scale);
    if (this.mapEditor !== undefined) {
      if (this.mapEditor.onMouseDown(evt)) {
        this.refresh();
        return true;
      }
    }

    return false;
  }

  public onMouseUp(htmlEvt: MouseEvent): boolean {
    let evt = makeMEvent(htmlEvt, this.scroll, this.props.scale);
    if (this.mapEditor !== undefined) {
      if (this.mapEditor.onMouseUp(evt)) {
        this.refresh();
        return true;
      }
    }

    return false;
  }

  public onMouseMove(htmlEvt: MouseEvent): boolean {
    let evt = makeMEvent(htmlEvt, this.scroll, this.props.scale);
    if (this.mapEditor !== undefined) {
      if (this.mapEditor.onMouseMove(evt)) {
        this.refresh();
        return true;
      }
    }

    return false;
  }

  public onWheel(evt: WheelEvent): boolean {
    return false;
  }

  private computeScrollPos(centerPos: PxPos): PxPos {
    return {
      x: Math.round(centerPos.x - this.canvasWidth / 2),
      y: Math.round(centerPos.y - this.canvasHeight / 2)
    }
  }

  private onUpdateScene(isDirty: boolean) {
    if (isDirty) {
      this.refresh();
    }
  }

  // repaint screen based on current scrolling position
  private _repaint() {
    if (!(this.isViewDirty || animator.hasAnimations)) {
      //console.log("Schedule: ");
      //this._scheduleFrame();
      return;
    }

    let start = performance.now();
    this.pixiRenderer.render(this.rootContainer);
    let end = performance.now();

    this.isViewDirty = false;
  }
}
