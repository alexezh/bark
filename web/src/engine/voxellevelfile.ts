import { Vector3 } from "three";
import { wireGetArrayRange, wireGetObject, wireSetObjectBackground } from "../lib/fetchadapter";
import { FileMapBlock, FileMapBlockDef, IVoxelLevelFile, WireCamera, WireLevelInfo } from "../ui/ivoxelmap";
import { MapSize3, WorldSize3 } from "../voxel/pos3";

export class VoxelLevelFile implements IVoxelLevelFile {
  private _cameraPosition: Vector3 = new Vector3();
  private _cameraLookAt: Vector3 = new Vector3();
  private _mapSize: WorldSize3 = { sx: 0, sy: 0, sz: 0 };
  private _zStride: number = 0;
  private _yStride: number = 0;
  private _blockDefs: Map<number, FileMapBlockDef> = new Map<number, FileMapBlockDef>;
  private _blocks: Map<number, FileMapBlock> = new Map<number, FileMapBlock>();
  private _url: string;
  private onChangeCamera: (() => void) | undefined;
  private onChangeBlock: ((blocks: FileMapBlock[]) => void) | undefined;

  public get blocks(): ReadonlyMap<number, FileMapBlock> { return this._blocks; };
  public constructor(url: string) {
    this._url = url;
  }
  public async load(): Promise<void> {
    let wi = await wireGetObject<WireLevelInfo>(this._url + '/info');
    if (wi !== undefined) {
      this._mapSize = {
        sx: wi.xMap, sy: wi.yMap, sz: wi.zMap
      }
    }
    this._zStride = this._mapSize.sx * this._mapSize.sy;
    this._yStride = this._mapSize.sx;

    let wc = await wireGetObject<WireCamera>(this._url + '/camera');
    if (wc !== undefined) {
      this._cameraPosition = new Vector3(wc.xPos, wc.yPos, wc.zPos);
      this._cameraLookAt = new Vector3(wc.xLook, wc.yLook, wc.zLook);
    }

    let defs = await wireGetArrayRange<FileMapBlockDef>(this._url + '/blockDefs', 0, -1);
    if (defs !== undefined) {
      for (let def of defs) {
        this._blockDefs.set(def.blockId, def);
      }
    }

    let blocks = await wireGetArrayRange<FileMapBlock>(this._url + '/blocks', 0, -1);
    if (blocks !== undefined) {
      for (let b of blocks) {
        this._blocks.set(this.getBlockKey(b.x, b.y, b.z), b);
      }
    }
  }

  get cameraPosition(): Vector3 {
    return this._cameraPosition;
  }

  set cameraPosition(value: Vector3) {
    this._cameraPosition = value;
    wireSetObjectBackground<WireCamera>('camera', {
      xPos: this._cameraPosition.x,
      yPos: this._cameraPosition.y,
      zPos: this._cameraPosition.z,
      xLook: this._cameraLookAt.x,
      yLook: this._cameraLookAt.y,
      zLook: this._cameraLookAt.z,
    });
  }
  get mapSize(): MapSize3 {
    return this._mapSize;
  }
  get blockCount(): number {
    return this._blocks.size;
  }
  registerOnChangeCamera(func: () => void) {
    this.onChangeCamera = func;
  }
  registerOnChangeBlock(func: (blocks: FileMapBlock[]) => void) {
    this.onChangeBlock = func;
  }
  getBlockDef(blockId: number): FileMapBlockDef | undefined {
    let def = this._blockDefs.get(blockId);
    return def;
  }

  private getBlockKey(x: number, y: number, z: number): number {
    return z * this._zStride + y * this._yStride + x;
  }
}