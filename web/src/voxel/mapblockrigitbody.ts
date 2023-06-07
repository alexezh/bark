import { Vector3 } from "three";
import { MapBlock, MapBlockCoord } from "../ui/ivoxellevel";
import { WorldCoord3 } from "./pos3";
import { IRigitBody, RigitAABB, RigitBodyKind } from "./irigitbody";
import { IRigitModel } from "../engine/irigitmodel";

export class MapBlockRigitBody implements IRigitBody, IDigBlock {
  public readonly mapBlock: MapBlockCoord;
  private _pos: Vector3;

  public constructor(mapBlock: MapBlockCoord, pos: WorldCoord3) {
    this.mapBlock = mapBlock;
    this._pos = new Vector3(pos.x, pos.y, pos.z);
  }

  get id(): number { return 0; }
  get name(): string { return '' }
  get inactive(): boolean { return false }
  get rigitKind(): RigitBodyKind { return RigitBodyKind.block; }
  get owner(): any { return undefined }
  get relativeSpeed(): Vector3 { return new Vector3(0, 0, 0); }
  get physicsSpeed(): Vector3 { return new Vector3(0, 0, 0); }

  get position(): Vector3 { return this._pos; }
  get modelSize(): Vector3 { return this.mapBlock!.model!.modelSize; }
  get gravityFactor(): number { return 0 }
  get maxClimbSpeed(): number { return 0 }
  get rigit(): IRigitModel | undefined { return undefined; }

  public get x(): number { return this._pos.x };
  public get y(): number { return this._pos.y };
  public get z(): number { return this._pos.z };
  public get standing(): boolean { return false };

  get worldSpeed(): Vector3 { return new Vector3(0, 0, 0); }

  aabb(pos: Vector3 | undefined): RigitAABB {
    return { xStart: 0, xEnd: 0, yStart: 0, yEnd: 0, zStart: 0, zEnd: 0 }
  }
  setPhysicsSpeed(speed: Vector3 | undefined) {
  }
  setSpeed(speed: Vector3): void {
  }
  onMove(pos: Vector3): void {
  }
  setStanding(val: boolean): void {
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
  get name(): string { return '' }
  get inactive(): boolean { return false }
  get rigitKind(): RigitBodyKind { return RigitBodyKind.boundary; }
  get owner(): any { return undefined }
  get relativeSpeed(): Vector3 { return new Vector3(0, 0, 0); }
  get physicsSpeed(): Vector3 { return new Vector3(0, 0, 0); }
  get position(): Vector3 { return this._pos; }
  get modelSize(): Vector3 { return this._size; }
  get gravityFactor(): number { return 0 }
  get maxClimbSpeed(): number { return 0 }
  get rigit(): IRigitModel | undefined { return undefined; }
  public get standing(): boolean { return false };

  public get x(): number { return this._pos.x };
  public get y(): number { return this._pos.y };
  public get z(): number { return this._pos.z };

  get worldSpeed(): Vector3 { return new Vector3(0, 0, 0); }
  aabb(pos: Vector3 | undefined): RigitAABB {
    return { xStart: 0, xEnd: 0, yStart: 0, yEnd: 0, zStart: 0, zEnd: 0 }
  }
  setPhysicsSpeed(speed: Vector3 | undefined) {
  }
  setSpeed(speed: Vector3): void {
  }
  setStanding(val: boolean): void {
  }
  onMove(pos: Vector3): void {
  }
}