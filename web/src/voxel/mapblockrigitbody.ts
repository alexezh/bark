import { Vector3 } from "three";
import { IRigitBody, RigitBodyKind } from "../engine/voxelmeshmodel";
import { MapBlock } from "./igamemap";
import { WorldCoord3 } from "./pos3";

export class MapBlockRigitBody implements IRigitBody {
  private mapBlock: MapBlock;
  private pos: Vector3;

  public constructor(mapBlock: MapBlock, pos: WorldCoord3) {
    this.mapBlock = mapBlock;
    this.pos = new Vector3(pos.x, pos.y, pos.z);
  }

  get id(): number { return 0; }
  get inactive(): boolean { return false }
  get kind(): RigitBodyKind { return RigitBodyKind.block; }
  get owner(): any { return undefined }
  get speed(): Vector3 { return new Vector3(0, 0, 0); }
  get position(): Vector3 { return this.pos; }
  get size(): Vector3 { return this.mapBlock.model.size; }

  setSpeed(speed: Vector3): void {
  }
  onMove(pos: Vector3): void {
  }
  setCollision(obj: IRigitBody): void {
  }
}