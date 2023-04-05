import { Vector3 } from "three";
import { WireDict, wireGetDict, wireGetObject, wireSetDictBackground, wireSetObjectBackground } from "../lib/fetchadapter";
import { FileMapBlock, FileMapBlockDef, IVoxelLevelFile, MapBlockCoord, WireCamera, WireLevelInfo } from "../ui/ivoxelmap";
import { BlockPos3, BlockSize3, WorldSize3 } from "../voxel/pos3";
import { VoxelModel } from "../voxel/voxelmodel";
import { modelCache } from "../voxel/voxelmodelcache";

export class VoxelLevelFile implements IVoxelLevelFile {
  private _cameraPosition: Vector3 = new Vector3();
  private _cameraLookAt: Vector3 = new Vector3();
  private _mapSize: WorldSize3 = { sx: 0, sy: 0, sz: 0 };
  private _zStride: number = 0;
  private _yStride: number = 0;
  private _blocks: Map<number, FileMapBlock> = new Map<number, FileMapBlock>();
  private _url: string;
  private onChangeCamera: (() => void) | undefined;
  private onChangeBlock: ((blocks: FileMapBlock[]) => void) | undefined;

  public get blocks(): ReadonlyMap<number, FileMapBlock> { return this._blocks; };

  public constructor(url: string) {
    this._url = url;
  }
  public async load(isTest: boolean): Promise<void> {

    if (!isTest) {
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

      let fields = await wireGetDict(this._url + '/blocks', undefined);
      if (fields !== undefined) {
        for (let field of fields) {
          let fb = JSON.parse(field.value) as FileMapBlock;
          this._blocks.set(parseInt(field.field), fb);
        }
      }
    } else {
      this._mapSize = { sx: 20, sy: 1, sz: 20 };
      this._zStride = this._mapSize.sx * this._mapSize.sy;
      this._yStride = this._mapSize.sx;

      let ground = await modelCache.getVoxelModel('./assets/vox/ground.vox');
      for (let x = 0; x < this._mapSize.sx; x++) {
        for (let z = 0; z < this._mapSize.sz; z++) {
          let key = this.getBlockKey(x, 0, z);
          this._blocks.set(key, { x: x, y: 0, z: z, blockId: ground.id });
        }
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
  get mapSize(): BlockSize3 {
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

  deleteBlock(block: MapBlockCoord) {
    let pos = block.mapPos;
    let key = this.getBlockKey(pos.x, pos.y, pos.z);

    this._blocks.delete(key)

    if (this.onChangeBlock !== undefined) {
      let fb: FileMapBlock = {
        blockId: 0,
        x: pos.x,
        y: pos.y,
        z: pos.z
      }
      this.onChangeBlock([fb]);
    }
  }

  addBlock(pos: BlockPos3, block: VoxelModel) {
    let fb: FileMapBlock = {
      blockId: block.id,
      x: pos.x,
      y: pos.y,
      z: pos.z
    }

    let key = this.getBlockKey(pos.x, pos.y, pos.z);
    this._blocks.set(key, fb);

    if (this.onChangeBlock !== undefined) {
      this.onChangeBlock([fb]);
    }

    let fields: WireDict[] = [];
    fields.push({ field: key.toString(), value: JSON.stringify(fb) });
    wireSetDictBackground(this._url + '/blocks', fields);
  }

  private getBlockKey(x: number, y: number, z: number): number {
    return z * this._zStride + y * this._yStride + x;
  }
}