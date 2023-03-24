import { idText } from "typescript";
import AsyncEventSource from "../engine/AsyncEventSource";
import { GridRect, PxPos, PxSize } from "./pos";
import { IVoxelMap } from "../voxel/igamemap";

export type MapBitmap = {
  w: number;
  h: number;
  data: Uint8ClampedArray;
}

export function createMapBitmap(w: number, h: number): MapBitmap {
  return {
    w: w,
    h: h,
    data: new Uint8ClampedArray(w * h * 4)
  }
}

export function updateRect(rect: GridRect, xNew: number, yNew: number): GridRect {
  // expand or shrink block
  let x, y, w, h: number;
  if (xNew < rect.x) {
    x = xNew;
    w = rect.x + rect.w - xNew;
  } else {
    x = rect.x;
    w = xNew - rect.x + 1;
  }

  if (yNew < rect.y) {
    y = yNew;
    h = rect.y + rect.h - yNew;
  } else {
    y = rect.y;
    h = yNew - rect.y + 1;
  }

  return { x: x, y: y, w: w, h: h };
}

export type MapEditorChangeEvent = {
}

export type MapEditorUpdate = {
  isEditMode?: boolean;
  region?: GridRect;
  scrollSize?: PxSize;
  map?: IVoxelMap;
}

// if we change this to terminal state; things will make more sense
export class MapEditorState {
  private _isEditMode: boolean = false;
  private _region?: GridRect;
  private _currentLayer?: any;
  private _scrollSize: PxSize | undefined;
  private _world: any;
  //  private _cameraControl: ICameraControl | undefined;
  private eventSource: AsyncEventSource<MapEditorChangeEvent> = new AsyncEventSource<MapEditorChangeEvent>();

  public get isEditMode(): boolean { return this._isEditMode; }
  public get currentLayer(): any | undefined { return this._currentLayer; }
  public get region(): GridRect | undefined { return this._region; }
  public get cameraSize(): PxSize | undefined { return this._scrollSize; }
  public get world(): any | undefined { return this._world; }
  //  public get cameraControl(): ICameraControl | undefined { return this._cameraControl; }

  public get currentTileLayer(): any | undefined {
    if (this._currentLayer === undefined) {
      return undefined;
    }

    return undefined;
  }
  public static unknownLayerError: string = 'unknown layer';

  public constructor() {
  }

  public onChanged(target: any, func: (evt: MapEditorChangeEvent) => void) {
    this.eventSource.add(target, func);
  }

  //  public invalidateCamera(): void {
  //    this._cameraControl?.refresh();
  //  }

  public update(val: MapEditorUpdate) {
    if (val.isEditMode !== undefined) {
      this._isEditMode = val.isEditMode;
    }
    //if (val.tileClipboard !== undefined) {
    // this._tileClipboard = val.tileClipboard;
    // }
    if (val.region !== undefined) {
      this._region = val.region;
    }
    if (val.scrollSize !== undefined) {
      this._scrollSize = val.scrollSize;
    }

    this.eventSource.invoke({});
  }
}

export let mapEditorState: MapEditorState;

export function createMapEditorState() {
  mapEditorState = new MapEditorState();
}