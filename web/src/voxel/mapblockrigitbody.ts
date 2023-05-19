import { Vector3 } from "three";
import { IRigitBody, RigitBodyKind } from "./voxelmeshmodel";
import { MapBlock, MapBlockCoord } from "../ui/ivoxelmap";
import { WorldCoord3 } from "./pos3";

export class MapBlockRigitBody implements IRigitBody, IDigBlock {
  public readonly mapBlock: MapBlockCoord;
  private _pos: Vector3;

  public constructor(mapBlock: MapBlockCoord, pos: WorldCoord3) {
    this.mapBlock = mapBlock;
    this._pos = new Vector3(pos.x, pos.y, pos.z);
  }

  get id(): number { return 0; }
  get inactive(): boolean { return false }
  get kind(): RigitBodyKind { return RigitBodyKind.block; }
  get owner(): any { return undefined }
  get speed(): Vector3 { return new Vector3(0, 0, 0); }
  get position(): Vector3 { return this._pos; }
  get size(): Vector3 { return this.mapBlock!.model!.size; }

  public get x(): number { return this._pos.x };
  public get y(): number { return this._pos.y };
  public get z(): number { return this._pos.z };

  setSpeed(speed: Vector3): void {
  }
  onMove(pos: Vector3): void {
  }
}

export class MapBoundaryRigitBody implements IRigitBody, IDigBoundary {
  private _size: Vector3;
  private _pos: Vector3;

  public constructor(pos: Vector3, size: Vector3) {
    this._pos = pos;
    this._size = size;
  }
  get id(): number { return 0; }
  get inactive(): boolean { return false }
  get kind(): RigitBodyKind { return RigitBodyKind.boundary; }
  get owner(): any { return undefined }
  get speed(): Vector3 { return new Vector3(0, 0, 0); }
  get position(): Vector3 { return this._pos; }
  get size(): Vector3 { return this._size; }

  public get x(): number { return this._pos.x };
  public get y(): number { return this._pos.y };
  public get z(): number { return this._pos.z };

  setSpeed(speed: Vector3): void {
  }
  onMove(pos: Vector3): void {
  }
}