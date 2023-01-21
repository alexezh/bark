import { MapEditorState, updateRect } from "../posh/mapeditorstate";
import { GridRect } from "../posh/pos";
import { animator } from "../graphics/animator";
import { makeMEvent } from "./keybinder";
import { UiLayer2, UiLayerProps } from "./uilayer";

export type MapViewerProps = UiLayerProps & {
  mapEditorState: MapEditorState;
}

export class MapBitmapViewer extends UiLayer2<MapViewerProps> {
  public selectedRect?: GridRect;
  private isViewDirty: boolean = false;
  private canvas: HTMLCanvasElement;
  private imageData?: ImageData;

  public constructor(props: MapViewerProps) {

    let div = document.createElement('div');
    // div.setAttribute('tabindex', '0');
    div.className = 'tileList';

    let canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.width = props.w;
    canvas.height = props.h;
    div.appendChild(canvas);

    super(props, div);

    this.canvas = canvas;
    this.props.mapEditorState.onChanged(this, (evt) => this.updateMap());

    this.updateMap();
    this.refresh();
  }

  private get canvasWidth(): number { return this.props.w; }
  private get canvasHeight(): number { return this.props.h; }

  private updateMap() {
    if (this.props.mapEditorState.mapBitmap !== undefined) {
      let data = this.props.mapEditorState.mapBitmap;
      this.imageData = new ImageData(data.data, data.w, data.h);
    }
    this.refresh();
  }

  public onMouseDown(htmlEvt: MouseEvent): boolean {
    let evt = makeMEvent(htmlEvt, undefined, 1.0);

    this.props.mapEditorState.update({ region: { x: evt.x, y: evt.y, w: 1, h: 1 } });

    this.refresh();

    return true;
  }

  public refresh() {
    if (this.isViewDirty) {
      return;
    }

    this.isViewDirty = true;
    let self = this;
    window.requestAnimationFrame(() => self._repaint());
  }

  private _repaint() {
    if (!(this.isViewDirty || animator.hasAnimations)) {
      return;
    }

    let ctx = this.canvas.getContext('2d')!;
    // let frameTime = performance.now();
    ctx.save();
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.drawContent(ctx);

    ctx.restore();

    this.isViewDirty = false;
  }

  private drawContent(ctx: any): void {

    if (this.imageData === undefined) {
      return;
    }

    ctx.putImageData(this.imageData, 0, 0);
  }
}