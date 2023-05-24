import { Scene, Vector3 } from "three";
import { getSupportedCodeFixes } from "typescript";
import { IRigitModel } from "./irigitmodel";
import { IRigitBody, RigitBodyKind, VoxelAnimationCollection, VoxelMeshModel } from "../voxel/voxelmeshmodel";
import { StaticCubeModel } from "./avatars/staticcubemodel";

export interface ITrackingCamera {
  onTargetMove(pos: Vector3): void;
}

// main object for compositing content
export class Sprite3 implements IRigitBody, IDigSprite {
  private static _nextId: number = 1;
  private _id: number;
  private _name: string;
  public owner: any;
  public rigit: IRigitModel;
  private _inactive: boolean = false;
  private _speed: Vector3 = new Vector3();
  private _position: Vector3;
  private _trackingCamera: ITrackingCamera | undefined;

  public get id(): number { return this._id; }
  public get name(): string { return this._name; }
  public get inactive(): boolean { return this._inactive }
  public get kind(): RigitBodyKind { return RigitBodyKind.sprite; }

  public get speed(): Vector3 { return this._speed };
  public get position(): Vector3 { return this._position };
  public get size(): Vector3 { return this.rigit.size };

  public get x(): number { return this._position.x };
  public get y(): number { return this._position.y };
  public get z(): number { return this._position.z };

  public constructor(name: string, rigit?: IRigitModel) {
    this._id = Sprite3._nextId++;
    this._name = name;
    this.rigit = rigit ?? new StaticCubeModel();
    this._position = new Vector3();
  }

  public async load(uri: string): Promise<void> {
    await this.rigit!.load(uri);
    this.rigit.setPosition(this._position);
    this.rigit.setDirection(this.speed);
  }

  public addToScene(scene: Scene) {
    this.rigit.addToScene(scene);
    console.log('Loaded sprite: ' + this._id);
  }

  public removeFromScene(scene: Scene) {
    this.rigit.removeFromScene(scene);
    console.log('Remove sprite: ' + this._id);
  }

  public onRender(tick: number) {
    this.rigit?.onRenderFrame(tick);
  }

  public setPosition(pos: Vector3) {
    this._position = pos;
    this.rigit.setPosition(pos);
  }

  public setSpeed(speed: Vector3) {
    this._speed = speed;
    this.rigit.setDirection(speed);
    this._inactive = speed.x === 0 && speed.y === 0 && speed.z === 0;
  }

  public setTrackingCamera(camera: ITrackingCamera | undefined) {
    this._trackingCamera = camera;
  }

  public onMove(pos: Vector3): void {
    this._position = pos;

    // move meshes; we should run this through rigitmodel to update
    // position correctly
    this.rigit.setPosition(pos);

    if (this._trackingCamera) {
      this._trackingCamera.onTargetMove(pos);
    }
  }
}
