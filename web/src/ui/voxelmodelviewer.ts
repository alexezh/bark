import { MapEditorState, updateRect } from "./mapeditorstate";
import { KeyBinder, makeMEvent } from "./keybinder";
import { GameColors } from "../lib/gamecolors";
import { UiLayer2, UiLayerProps } from "./uilayer";
import { GridRect, gridRectToPxRect, PxSize } from "../lib/pos";
import _ from "lodash";

export type TilesetListProps = UiLayerProps & {
  mapEditorState: MapEditorState;
  scale: number;
  scrollY?: number;
}

/*
export class TilesetList extends UiLayer2<TilesetListProps> {
  public selectedRect?: GridRect;
  private isViewDirty: boolean = false;
  private keyBinder: KeyBinder;
  private canvas: HTMLCanvasElement;
  private tileSheetImage?: HTMLImageElement;
  private pxSize: PxSize = { w: 0, h: 0 };

  public constructor(props: TilesetListProps) {

    let div = document.createElement('div');
    div.setAttribute('tabindex', '0');
    div.className = 'tileList';

    let canvas = document.createElement('canvas') as HTMLCanvasElement;
    div.appendChild(canvas);

    super(props, div);

    _.bindAll(this, ["_repaint"]);

    this.canvas = canvas;
    this.props.scrollY = (this.props.scrollY !== undefined) ? this.props.scrollY : 0;

    this.keyBinder = new KeyBinder(div, () => { });
    this.keyBinder.registerKeyUp('KeyC', () => this.onCopyRegion());

    this.props.mapEditorState.onChanged(this, (evt) => this.onUpdate());
    this.onUpdate();
  }

  private get canvasWidth(): number { return this.props.w / this.props.scale; }
  private get canvasHeight(): number { return this.props.h / this.props.scale; }

  public refresh(force: boolean = false) {
    if (this.isViewDirty && (!force)) {
      return;
    }

    this.isViewDirty = true;
    let self = this;
    window.requestAnimationFrame(() => self._repaint());
  }

  public onMouseDown(htmlEvt: MouseEvent): boolean {
    if (this.tileSheet === undefined) {
      return false;
    }

    let evt = makeMEvent(htmlEvt, undefined, this.props.scale);
    let tileX = Math.floor(evt.x / this.tileSheet.props.cellWidth);
    let tileY = Math.floor((this.props.scrollY! + evt.y) / this.tileSheet.props.cellWidth);

    if (this.selectedRect === undefined || evt.shiftKey == false) {
      this.selectedRect = { x: tileX, y: tileY, w: 1, h: 1 };
    }
    else {
      this.selectedRect = updateRect(this.selectedRect, tileX, tileY);
    }

    // this.props.onSelect(tileBlockFromAtlas(this.selectedBlock, this.props.atlas));
    this.refresh();

    return true;
  }

  public onCopyRegion() {
    if (this.tileSheet === undefined || this.selectedRect === undefined) {
      return;
    }

    let buffer = this.tileSheet.getRegion(this.selectedRect);
    this.props.mapEditorState.update({ tileClipboard: buffer });
  }

  public onWheel(evt: WheelEvent): boolean {
    if (this.tileSheet === undefined) {
      return false;
    }

    this.props.scrollY! += -(evt as any).wheelDeltaY;
    if (this.props.scrollY! < 0) {
      this.props.scrollY = 0;
    }
    let pxHeight = this.tileSheet.props.gridHeight * this.tileSheet.props.cellHeight;
    if (this.props.scrollY! + this.props.h > pxHeight) {
      this.props.scrollY = pxHeight - this.props.h;
    }
    this.refresh();
    return true;
  }

  private onUpdate() {
    if (this._compositor === undefined) {
      return;
    }

    
    if (this.tileSheet === this.props.mapEditorState.tileListSheet) {
      console.log("same spritesheet, ignore")
      return;
    }

    this.tileSheet = this.props.mapEditorState.tileListSheet;

    if (this.tileSheet !== undefined) {
      let fullSize = this._compositor!.size;

      this.pxSize.w = this.tileSheet.props.gridWidth * this.tileSheet.props.cellWidth;
      this.pxSize.h = this.tileSheet.props.gridHeight * this.tileSheet.props.cellHeight;
      let w = this.pxSize.w * this.props.scale;

      console.log("load image " + this.tileSheet.props.url);

      this.tileSheetImage = new Image();
      this.tileSheetImage.addEventListener('load', () => {
        this.refresh(true)
        console.log("image loaded")
      });
      //this.image.addEventListener('error', () => console.log('cannot load image'));
      this.tileSheetImage.src = this.tileSheet.props.url;

      this.canvas.width = w;
      this.canvas.height = this._compositor!.size.h;

      this.props.x = fullSize.w - w;
      this.props.w = w;
      this.updateElementSize();

    }

    this.refresh();
  }

  private _repaint() {
    console.log('draw list')
    let ctx = this.canvas.getContext('2d')!;
    // let frameTime = performance.now();
    ctx.save();
    ctx.scale(this.props.scale, this.props.scale);
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.drawContent(ctx);

    ctx.restore();

    this.isViewDirty = false;
  }

  private drawContent(ctx: any): void {
    if (this.tileSheet === undefined) {
      return;
    }

    ctx.save();

    ctx.drawImage(this.tileSheetImage,
      0, this.props.scrollY!, this.pxSize.w, this.props.h,
      0, 0, this.pxSize.w, this.props.h);

    ctx.strokeStyle = GameColors.tileBlock;

    if (this.selectedRect !== undefined) {
      let szSelected = gridRectToPxRect(this.selectedRect);
      ctx.lineWidth = 2;
      ctx.strokeRect(
        szSelected.x, szSelected.y - this.props.scrollY!,
        szSelected.w, szSelected.h);
    }
    ctx.restore();
  }
}
*/