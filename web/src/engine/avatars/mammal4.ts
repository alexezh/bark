import { Group, Matrix4, Quaternion, Scene, Vector3 } from "three";
import { IRigitModel } from "../irigitmodel";
import { Sprite3 } from "../sprite3";
import { VoxelAnimationCollection, VoxelMeshModel } from "../../voxel/voxelmeshmodel";

// handles animal with 4 legs, tail and head
export class Mammal4Model implements IRigitModel {
  private meshModels: { [key: string]: VoxelMeshModel } = {};
  private _size!: Vector3;
  private _dir: Vector3 = new Vector3();
  private _normal!: Quaternion;

  get size(): Vector3 { return this._size; }
  async load(uri: string): Promise<void> {
    let main = await VoxelMeshModel.create(uri);
    this.meshModels.main = main;
    this._size = main.size;
    // our scene is y up; but sprite is z up
    this._normal = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
    this.meshModels.main.setPosition(new Vector3(-this._size.x / 2, -this._size.y / 2, 0));
    this.setRotation(this._normal);
  }

  addAnimation(name: string) {
    this.meshModels.main.animations[name] = [];
  }

  addFrame(name: string, idx: number, duration: number) {
    this.meshModels.main.animations[name].push({ idx: idx, dur: duration });
  }

  public animate(id: string) {
    for (let m of Object.keys(this.meshModels)) {
      this.meshModels[m].playAnimation(id);
    }
  }

  public addToScene(scene: Scene) {
    for (let key of Object.keys(this.meshModels)) {
      let model = this.meshModels[key];
      model.addToScene(scene);
    }
    //    scene.add(this._group);
  }

  public removeFromScene(scene: Scene) {
    for (let key of Object.keys(this.meshModels)) {
      let model = this.meshModels[key];
      model.removeFromScene(scene);
    }
    // scene.remove(this._group);
  }

  public onRenderFrame(tick: number) {
    for (let key of Object.keys(this.meshModels)) {
      let model = this.meshModels[key];
      model.onRender(tick);
    }
  }

  public setPosition(pos: Vector3): void {
    for (let key of Object.keys(this.meshModels)) {
      let model = this.meshModels[key];
      model.setPosition(pos);
    }
    //this._group.position.copy(pos);
  }

  public setDirection(dir: Vector3): void {
    if (this._dir.equals(dir)) {
      return;
    }

    if (dir.x === 0 && dir.z === 0) {
      return;
    }

    this._dir.copy(dir);
    let angle = Math.atan2(dir.x, dir.z);

    let qt = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle);
    qt = qt.multiply(this._normal);
    this.setRotation(qt);
  }

  private setRotation(qt: Quaternion) {
    for (let key of Object.keys(this.meshModels)) {
      let model = this.meshModels[key];
      model.setRotation(qt);
    }
  }

  // recalc from physics
  public update() {

  }
}
