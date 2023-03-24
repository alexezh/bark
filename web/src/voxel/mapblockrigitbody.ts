import { Vector3 } from "three";
import { IRigitBody, RigitBodyKind } from "./voxelmeshmodel";
import { MapBlock, MapBlockCoord } from "../ui/igamemap";
import { WorldCoord3 } from "./pos3";

export class MapBlockRigitBody implements IRigitBody {
  private mapBlock: MapBlockCoord;
  private pos: Vector3;

  public constructor(mapBlock: MapBlockCoord, pos: WorldCoord3) {
    this.mapBlock = mapBlock;
    this.pos = new Vector3(pos.x, pos.y, pos.z);
  }

  get id(): number { return 0; }
  get inactive(): boolean { return false }
  get kind(): RigitBodyKind { return RigitBodyKind.block; }
  get owner(): any { return undefined }
  get speed(): Vector3 { return new Vector3(0, 0, 0); }
  get position(): Vector3 { return this.pos; }
  get size(): Vector3 { return this.mapBlock!.model!.size; }

  get blocks(): MapBlockCoord[] { return [this.mapBlock] }

  setSpeed(speed: Vector3): void {
  }
  onMove(pos: Vector3): void {
  }
  setCollision(obj: IRigitBody): void {
  }
}

export class MapBoundaryRigitBody implements IRigitBody {
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

  setSpeed(speed: Vector3): void {
  }
  onMove(pos: Vector3): void {
  }
  setCollision(obj: IRigitBody): void {
  }
}