import { Group, Matrix4, Quaternion, Scene, Vector3 } from "three";
import { IRigitModel } from "../irigitmodel";
import { Sprite3 } from "../sprite3";
import { VoxelAnimationCollection, VoxelMeshModel } from "../../voxel/voxelmeshmodel";
import { RigitAABB } from "../../voxel/irigitbody";
import { VoxelModel } from "../../voxel/voxelmodel";
import { modelCache } from "../../voxel/voxelmodelcache";

/*
// handles animal with 4 legs, tail and head
export class Mammal4Model implements IRigitModel {
  private voxelModel!: VoxelModel;
  private meshModels: { [key: string]: VoxelMeshModel } = {};
  private _size!: Vector3;
  private _directionAngleXZ: number = 0;
  private _rotationAngleXZ: number = 0;

  // position is offset by the base
  private _position!: Vector3;
  private _baseX: number = 0;
  private _baseZ: number = 0;
  private _scale: number = 1;
  private _recalcBottom: boolean = true;
  private _bottomPoints: Vector3[];

  public get size(): Vector3 { return this._size; }

  public bottomPoints(): number[] {
    return [this._position.x, this._position.y, this._position.z]
  }

  public constructor(scale: number) {
    this._scale = scale;
    this._bottomPoints = new Vector3[5];
  }

  public async load(uri: string): Promise<void> {
    let vmm = await modelCache.getVoxelModel(uri);
    if (vmm === undefined) {
      console.log('cannot file model ' + uri);
      return;
    }
    this.voxelModel = vmm;

    this._size = this.voxelModel.size;
    this._size.multiplyScalar(this._scale);
    this._baseZ = this._size.z / 2;
    this._baseX = this._size.x / 2;
    this._position = new Vector3(-this._baseX, 0, -this._baseZ);

    this.meshModels.main = VoxelMeshModel.create(this.voxelModel, this._scale);
    this.meshModels.main.setBasePoint(new Vector3(-this._baseX, 0, -this._baseZ));
    this.meshModels.main.setPosition(this._position);
  }

  public addAnimation(name: string) {
    this.meshModels.main.animations[name] = [];
  }

  public addFrame(name: string, idx: number, duration: number) {
    this.meshModels.main.animations[name].push({ idx: idx, dur: duration });
  }

  public aabb(pos: Vector3 | undefined): RigitAABB {
    if (pos) {
      return {
        xStart: pos.x - this._baseX, xEnd: pos.x + this._size.x - this._baseX,
        yStart: pos.y, yEnd: pos.y + this._size.y,
        zStart: pos.z - this._baseZ, zEnd: pos.z + this._size.z - this._baseZ
      }
    } else {
      pos = this._position;
      return {
        xStart: pos.x, xEnd: pos.x + this._size.x,
        yStart: pos.y, yEnd: pos.y + this._size.y,
        zStart: pos.z, zEnd: pos.z + this._size.z
      }
    }
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
    // we adjusted mesh to base point; this way we do not have to adjust this pos
    this._position.set(pos.x, pos.y, pos.z);
    for (let key of Object.keys(this.meshModels)) {
      let model = this.meshModels[key];
      model.setPosition(this._position);
    }
  }

  public setSpeed(speed: Vector3): void {

  }

  public setDirectionXZ(angle: number): void {
    if (this._directionAngleXZ == angle) {
      return;
    }

    if (angle === 0) {
      return;
    }

    this._directionAngleXZ = angle;
    this.updateRotation();
  }

  public setRotationXZ(angle: number): void {
    this._rotationAngleXZ = angle;
    this.updateRotation();
  }

  private updateRotation() {
    let qt = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), this._directionAngleXZ + this._rotationAngleXZ);

    for (let key of Object.keys(this.meshModels)) {
      let model = this.meshModels[key];
      model.setRotation(qt);
    }
  }

  // recalc from physics
  public update() {

  }
}
*/