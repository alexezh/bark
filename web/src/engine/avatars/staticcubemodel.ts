import { Scene, Vector, Vector3 } from "three";
import { VoxelAnimationCollection, VoxelMeshModel } from "../../voxel/voxelmeshmodel";
import { IRigitModel } from "../irigitmodel";

export class StaticCubeModel implements IRigitModel {
  //private meshModels: { [key: string]: VoxelMeshModel } = {};
  private meshModel!: VoxelMeshModel;
  private _size!: Vector3;
  private _position!: Vector3;

  get size(): Vector3 { return this._size; }
  async load(uri: string): Promise<void> {
    let m = await VoxelMeshModel.create(uri);
    this.meshModel = m;
    this._size = m.size;
    // animations: VoxelAnimationCollection | undefined
  }

  addAnimation(name: string) {
    this.meshModel.animations[name] = [];
  }
  addFrame(name: string, idx: number, duration: number) {
    this.meshModel.animations[name].push({ idx: idx, dur: duration });
  }

  animate(id: string) {
  }

  public addToScene(scene: Scene) {
    this.meshModel.addToScene(scene);
  }

  public removeFromScene(scene: Scene) {
    this.meshModel.removeFromScene(scene);
  }

  public onRenderFrame(tick: number) {
    this.meshModel.onRender(tick);
  }

  setPosition(pos: Vector3): void {
    this.meshModel.setPosition(pos);
  }
  setDirection(pos: Vector3): void {
  }
  update(): void {
  }
}