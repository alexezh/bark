import { UiLayerProps } from "./uilayer";
import { GameMap } from "../world/gamemap";
import { KeyBinder, MEvent } from "./keybinder";
import { CutRegionDef, CopyRegionDef, FillRegionDef, FillRegionParams, PasteRegionDef } from "../posh/regioncommands";
import { IRepl } from "../posh/repl";
import { MapEditorState, updateRect } from "../posh/mapeditorstate";
import { ShowKeyBindingsDef } from "../posh/keybindcommands";
import { GridPos, GridRect, gridRectToPxRect, pxRectToGridRect } from "../posh/pos";
import { Container as PixiContainer, Graphics as PixiGraphics } from 'pixijs';
import { GameColors } from "./gamecolors";
import { IMapEditor } from "./imapeditor";
import { CoordinateParams } from "../posh/genericeditorfuncdef";

export type MapEditorProps = UiLayerProps & {
  world: GameMap;
  mapEditorState: MapEditorState;
  repl: IRepl;
}

export function addEditorShortcuts(showKeyBindingsDef: ShowKeyBindingsDef) {
  let editor = 'Editor'

  // we can late bind later... pass name and bind object
  showKeyBindingsDef.addKeyBinding('C', 'Copy block of tiles to buffer');
  showKeyBindingsDef.addKeyBinding('V', 'Paste block of tiles from buffer');
  showKeyBindingsDef.addKeyBinding('X', 'Clear block from layer');
  showKeyBindingsDef.addKeyBinding('L', 'Fill block of tiles from buffer');

  showKeyBindingsDef.addKeyBinding('A', 'Move camera up');
  showKeyBindingsDef.addKeyBinding('S', 'Move camera down');
  showKeyBindingsDef.addKeyBinding('D', 'Move camera right');
  showKeyBindingsDef.addKeyBinding('W', 'Move camera left');
}

export class MapEditor implements IMapEditor {
  private props: MapEditorProps;
  private isMouseDown: boolean = false;
  private lastEditedPos: GridPos | undefined = undefined;
  private input?: KeyBinder;
  private container?: PixiContainer;
  private selection?: PixiGraphics;

  public constructor(props: MapEditorProps) {
    this.props = props;
    this.props.mapEditorState.selectLayer("ground");
    this.props.mapEditorState.onChanged(this, (evt) => this.onStateChanged())
  }

  public attach(editorContainer: PixiContainer, input: KeyBinder): void {
    this.input = input;
    this.container = editorContainer;

    input.registerKeyUp('KeyC', () => this.onCopyRegion());
    input.registerKeyUp('KeyV', () => this.onPasteRegion());
    input.registerKeyUp('KeyX', () => this.onClearRegion());
    input.registerKeyUp('KeyL', () => this.onFillRegion());

    input.registerKeyUp('KeyA', () => this.onScroll(-1, 0));
    input.registerKeyUp('KeyS', () => this.onScroll(0, 1));
    input.registerKeyUp('KeyD', () => this.onScroll(1, 0));
    input.registerKeyUp('KeyW', () => this.onScroll(0, -1));
  }

  public detach(): void {
    this.input = undefined;
    if (this.selection !== undefined) {
      this.container?.removeChild(this.selection);
      this.selection.destroy();
      this.selection = undefined;
      this.container = undefined;
    }
  }

  private onStateChanged() {
    let region = this.props.mapEditorState.region
    if (region === undefined) {
      return;
    }

    this.updateSelection();
    this.props.mapEditorState.cameraControl?.ensureVisible(region);
  }

  private getGridPos(pxX: number, pxY: number): GridPos {
    let x = Math.floor(pxX / this.props.world.props.cellWidth);
    let y = Math.floor(pxY / this.props.world.props.cellHeight);
    return {
      x: x,
      y: y
    }
  }

  private updateSelection(): void {
    let region = this.props.mapEditorState.region;

    if (this.selection !== undefined) {
      this.container!.removeChild(this.selection);
      this.selection.destroy();
      this.selection = undefined;
    }

    if (region === undefined || this.container === undefined) {
      return;
    }

    let obj = new PixiGraphics();
    obj.lineStyle(2, GameColors.regionN);

    let pxRegion = gridRectToPxRect(region);
    obj.drawRect(pxRegion.x, pxRegion.y, pxRegion.w, pxRegion.h);

    // Add it to the stage to render
    this.selection = obj;
    this.container!.addChild(obj);
  }

  public onCopyRegion(): void {
    let region = this.props.mapEditorState.region;
    if (region === undefined) {
      return;
    }

    this.props.repl.evalFunc<CoordinateParams>(CopyRegionDef.funcName, { x: region.x, y: region.y, w: region.w, h: region.h });
  }

  public onPasteRegion(): void {
    let region = this.props.mapEditorState.region;
    let tileBuffer = this.props.mapEditorState.tileClipboard;
    if (region === undefined || tileBuffer == undefined) {
      return;
    }

    this.props.repl.evalFunc<CoordinateParams>(PasteRegionDef.funcName, { x: region.x, y: region.y, w: region.w, h: region.h });
  }

  public onClearRegion(): void {
    let region = this.props.mapEditorState.region;
    if (region === undefined) {
      return;
    }

    this.props.repl?.evalFunc<CoordinateParams>(CutRegionDef.funcName, { x: region.x, y: region.y, w: region.w, h: region.h });
  }

  public onFillRegion(): void {
    let region = this.props.mapEditorState.region;
    let tileBuffer = this.props.mapEditorState.tileClipboard;
    if (region === undefined || tileBuffer == undefined) {
      return;
    }

    let tile = tileBuffer.tiles[0];
    this.props.repl?.evalFunc<FillRegionParams>(FillRegionDef.funcName, { x: region.x, y: region.y, w: region.w, h: region.h, tile: tile });
  }

  public onScroll(x: number, y: number): void {
    let cameraSize = this.props.mapEditorState.cameraSize!;
    this.props.mapEditorState.cameraControl?.scrollBy({ w: x * cameraSize.w / 2, h: y * cameraSize.h / 2 });
  }

  public onMouseDown(evt: MEvent): boolean {
    this.isMouseDown = true;
    let gridPos = this.getGridPos(evt.x, evt.y);

    if (this.lastEditedPos !== undefined && this.lastEditedPos.x === gridPos.x && this.lastEditedPos.y === gridPos.y) {
      return false;
    }

    let region: GridRect;
    if (this.props.mapEditorState.region !== undefined && evt.shiftKey) {
      region = updateRect(this.props.mapEditorState.region, gridPos.x, gridPos.y);
      this.lastEditedPos = gridPos;
    } else {
      region = { x: gridPos.x, y: gridPos.y, w: 1, h: 1 };
      this.lastEditedPos = gridPos;
    }
    this.props.mapEditorState.update({ region: region });

    // return this.applyBlock(evt.x, evt.y, evt.shiftKey);
    return true;
  }

  public onMouseUp(evt: MEvent): boolean {
    this.isMouseDown = false;
    return false;
  }

  public onMouseMove(evt: MEvent): boolean {
    /*   
       if (this.isMouseDown && evt.shiftKey && this.lastEditedPos !== undefined) {
         if (this.props.mapEditorState.currentBlock === undefined) {
           return false;
         }
   
         let gridPos = this.getGridPos(evt.x, evt.y);
         this.props.tt?.evalAst(FillRegionDef.createAst(gridPos, this.props.mapEditorState.currentBlock));
         this.lastEditedPos = gridPos;
       }
   */
    return false;
  }
}

