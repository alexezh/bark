import { Scene, Vector3 } from "three";
import { vm } from "./vm";
import { IRigitBody, IRigitModel, VoxelMeshModel } from "./voxelmeshmodel";

// main object for compositing content
export class Sprite3 implements IRigitBody {
  private meshModels: VoxelMeshModel[] = [];
  private _rigitBody: IRigitBody | undefined;
  public owner: any;
  public rigit: IRigitModel | undefined;
  private _speed: Vector3 = new Vector3();
  private _position: Vector3;

  // if true, onCollide will record the array
  private collisions: IRigitBody[] | undefined;

  public get speed(): Vector3 { return this._speed };
  public get position(): Vector3 { return this._position };

  public constructor(pos: Vector3, rigit?: IRigitModel) {
    this.rigit = rigit;
    this._position = pos;
  }

  public async load(uri: string): Promise<void> {
    let m = await VoxelMeshModel.create(uri);
    this.meshModels.push(m);
  }

  public loadSprite(scene: Scene) {
    for (let m of this.meshModels) {
      scene.add(m.getMesh());
    }

    return true;
  }

  public setPosition(pos: Vector3) {

  }

  public setSpeed(speed: Vector3) {
    this._speed = speed;
  }

  public onMove(pos: Vector3): void {
    this._position = pos;
  }

  public trackCollision(enadle: boolean) {
    if (enadle) {
      this.collisions = [];
    } else {
      this.collisions = undefined;
    }
  }

  public onCollision(obj: IRigitBody): void {
    if (this.collisions === undefined) {
      return;
    }

    this.collisions.push(obj);
  }

  public collidedWith<T>(): boolean {
    return false;
  }
}
