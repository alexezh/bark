import { Quaternion, Scene, Vector, Vector3 } from "three";
import { VoxelAnimationCollection, VoxelMeshModel } from "../../voxel/voxelmeshmodel";
import { IRigitModel } from "../irigitmodel";
import { RigitAABB } from "../../voxel/irigitbody";
import { VoxelModel } from "../../voxel/voxelmodel";
import { modelCache } from "../../voxel/voxelmodelcache";
import { Coord3 } from "../../voxel/pos3";

export class CubeModel implements IRigitModel {
  private voxelModel!: VoxelModel;
  private meshModel!: VoxelMeshModel;
  private _size!: Vector3;
  private _directionAngleXZ: number = 0;
  private _rotationAngleXZ: number = 0;

  // position is offset by the base
  private _position!: Vector3;
  private _baseX: number = 0;
  private _baseZ: number = 0;
  private _scale: number = 1;
  private _bottomPoints: Coord3[] = [];

  public get size(): Vector3 { return this._size; }

  public get bottomPoints(): Coord3[] { return this._bottomPoints; }

  public constructor(scale: number) {
    this._scale = scale;
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

    this._bottomPoints.push({ x: 0, y: 0, z: 0 });
    this._bottomPoints.push({ x: -this._baseX, y: 0, z: -this._baseZ });
    this._bottomPoints.push({ x: this._baseX, y: 0, z: -this._baseZ });
    this._bottomPoints.push({ x: this._baseX, y: 0, z: this._baseZ });
    this._bottomPoints.push({ x: -this._baseX, y: 0, z: this._baseZ });

    this.meshModel = VoxelMeshModel.create(this.voxelModel, this._scale);
    this.meshModel.setBasePoint(new Vector3(-this._baseX, 0, -this._baseZ));
    this.meshModel.setPosition(this._position);
  }

  public addAnimation(name: string) {
    this.meshModel.animations[name] = [];
  }

  public addFrame(name: string, idx: number, duration: number) {
    this.meshModel.animations[name].push({ idx: idx, dur: duration });
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
    this.meshModel.playAnimation(id);
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

  public setPosition(pos: Vector3): void {
    // we adjusted mesh to base point; this way we do not have to adjust this pos
    this._position.set(pos.x, pos.y, pos.z);
    this.meshModel.setPosition(this._position);
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
    this.meshModel.setRotation(qt);
  }

  // recalc from physics
  public update() {

  }
}