import { Scene, Vector, Vector3 } from "three";
import { VoxelAnimationCollection, VoxelMeshModel } from "../../voxel/voxelmeshmodel";
import { IRigitModel } from "../irigitmodel";
import { RigitAABB } from "../../voxel/irigitbody";
import { VoxelModel } from "../../voxel/voxelmodel";
import { modelCache } from "../../voxel/voxelmodelcache";

export class StaticCubeModel implements IRigitModel {
  //private meshModels: { [key: string]: VoxelMeshModel } = {};
  private voxelModel!: VoxelModel;
  private meshModel!: VoxelMeshModel;
  private _size!: Vector3;
  private _position!: Vector3;
  private _scale: number;

  get size(): Vector3 { return this._size; }

  public constructor(scale: number) {
    this._scale = scale;
  }

  public async load(uri: string): Promise<void> {
    let vmm = modelCache.getVoxelModel(uri);
    if (vmm === undefined) {
      return;
    }

    this.voxelModel = vmm;

    let m = VoxelMeshModel.create(this.voxelModel);
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

  public aabb(pos: Vector3 | undefined): RigitAABB {
    pos = pos ?? this._position;

    return {
      xStart: pos.x, xEnd: pos.x + this._size.x,
      yStart: pos.y, yEnd: pos.y + this._size.y,
      zStart: pos.z, zEnd: pos.z + this._size.z
    }
  }

  setPosition(pos: Vector3): void {
    this.meshModel.setPosition(pos);
  }
  setSpeed(speed: Vector3): void {
  }
  setDirectionXZ(angle: number): void {
  }
  setRotationXZ(angle: number): void {

  }
  update(): void {
  }
}