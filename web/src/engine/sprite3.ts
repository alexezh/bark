import { Scene, Vector3 } from "three";
import { getSupportedCodeFixes } from "typescript";
import { IRigitBody, IRigitModel, RigitBodyKind, VoxelAnimationCollection, VoxelMeshModel } from "./voxelmeshmodel";

// main object for compositing content
export class Sprite3 implements IRigitBody {
  private static _nextId: number = 1;
  private _id: number;
  private meshModels: { [key: string]: VoxelMeshModel } = {};
  private _rigitBody: IRigitBody | undefined;
  public owner: any;
  public rigit: IRigitModel | undefined;
  private _inactive: boolean = false;
  private _speed: Vector3 = new Vector3();
  private _position: Vector3;
  private _size!: Vector3;

  // if true, onCollide will record the array
  private collision: IRigitBody | undefined;

  public get id(): number { return this._id; }
  public get inactive(): boolean { return this._inactive }
  public get kind(): RigitBodyKind { return RigitBodyKind.sprite; }

  public get speed(): Vector3 { return this._speed };
  public get position(): Vector3 { return this._position };
  public get size(): Vector3 { return this._size };

  public constructor(pos: Vector3, size: Vector3, rigit?: IRigitModel) {
    this._id = Sprite3._nextId++;
    this.rigit = rigit;
    this._position = pos;
  }

  public async load(uri: string, animations: VoxelAnimationCollection | undefined): Promise<void> {
    let m = await VoxelMeshModel.create(uri, animations);
    m.setPosition(this._position);
    this.meshModels.main = m;
    this._size = m.size;
  }

  public addToScene(scene: Scene) {
    for (let m of Object.keys(this.meshModels)) {
      this.meshModels[m].addToScene(scene);
    }

    console.log('Loaded sprite: ' + this._id);
  }

  public removeFromScene(scene: Scene) {
    for (let m of Object.keys(this.meshModels)) {
      this.meshModels[m].removeFromScene(scene);
    }

    console.log('Remove sprite: ' + this._id);
  }

  public setPosition(pos: Vector3) {
    this._position = pos;
    for (let m of Object.keys(this.meshModels)) {
      this.meshModels[m].setPosition(pos);
    }
  }

  public setSpeed(speed: Vector3) {
    this._speed = speed;
    this._inactive = speed.x === 0 && speed.y === 0 && speed.z === 0;
  }

  public onMove(pos: Vector3): void {
    this._position = pos;

    // move meshes; we should run this through rigitmodel to update
    // position correctly
    for (let m of Object.keys(this.meshModels)) {
      this.meshModels[m].setPosition(pos);
    }
  }

  public setCollision(obj: IRigitBody | undefined): void {
    if (obj !== undefined) {
      if (this.collision !== undefined) {
        return;
      }

      this.collision = obj;
    } else {
      this.collision = undefined;
    }
  }

  public collidedWith<T>(): boolean {
    return false;
  }
}
