import { Matrix4, Quaternion, Scene, Vector3 } from "three";
import { IRigitModel } from "../irigitmodel";
import { Sprite3 } from "../sprite3";
import { VoxelAnimationCollection, VoxelMeshModel } from "../../voxel/voxelmeshmodel";

// handles animal with 4 legs, tail and head
export class Mammal4Model implements IRigitModel {
  private meshModels: { [key: string]: VoxelMeshModel } = {};
  private _size!: Vector3;

  get size(): Vector3 { return this._size; }
  async load(uri: string, animations: VoxelAnimationCollection | undefined): Promise<void> {
    let main = await VoxelMeshModel.create(uri, animations);
    this.meshModels.main = main;
    this._size = main.size;
  }


  public animate(id: string) {
    for (let m of Object.keys(this.meshModels)) {
      this.meshModels[m].playAnimation(id);
    }
  }

  public addToScene(scene: Scene) {
    for (let m of Object.keys(this.meshModels)) {
      this.meshModels[m].addToScene(scene);
    }
  }

  public removeFromScene(scene: Scene) {
    for (let m of Object.keys(this.meshModels)) {
      this.meshModels[m].removeFromScene(scene);
    }
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
  }

  public setDirection(dir: Vector3): void {
    let angle = Math.atan2(dir.x, -dir.y);
    let qt = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angle);
    for (let key of Object.keys(this.meshModels)) {
      let model = this.meshModels[key];
      model.setRotation(qt);
    }
  }
  // recalc from physics
  public update() {

  }
}

// TODO: define animation sets left/right/etc
export class Mammal4 extends Sprite3 {
  public constructor(pos: Vector3, size: Vector3) {
    super(pos, size, new Mammal4Model());
  }
}
