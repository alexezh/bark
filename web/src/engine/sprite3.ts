import { Scene, Vector3 } from "three";
import { getSupportedCodeFixes } from "typescript";
import { IRigitModel } from "./irigitmodel";
import { IRigitBody, RigitBodyKind, VoxelAnimationCollection, VoxelMeshModel } from "../voxel/voxelmeshmodel";
import { StaticCubeModel } from "./avatars/staticcubemodel";

// main object for compositing content
export class Sprite3 implements IRigitBody {
  private static _nextId: number = 1;
  private _id: number;
  public owner: any;
  public rigit: IRigitModel;
  private _inactive: boolean = false;
  private _speed: Vector3 = new Vector3();
  private _position: Vector3;

  // if true, onCollide will record the array
  public collision: IRigitBody | undefined;

  public get id(): number { return this._id; }
  public get inactive(): boolean { return this._inactive }
  public get kind(): RigitBodyKind { return RigitBodyKind.sprite; }

  public get speed(): Vector3 { return this._speed };
  public get position(): Vector3 { return this._position };
  public get size(): Vector3 { return this.rigit.size };

  public constructor(pos: Vector3, size: Vector3, rigit?: IRigitModel) {
    this._id = Sprite3._nextId++;
    this.rigit = rigit ?? new StaticCubeModel();
    this._position = pos;
  }

  public async load(uri: string, animations: VoxelAnimationCollection | undefined): Promise<void> {
    await this.rigit!.load(uri, animations);
    this.rigit.setPosition(this._position);
    this.rigit.setDirection(this.speed);
  }

  public animate(id: string) {
    this.rigit.animate(id);
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

  public onMove(pos: Vector3): void {
    this._position = pos;

    // move meshes; we should run this through rigitmodel to update
    // position correctly
    this.rigit.setPosition(pos);
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
}
