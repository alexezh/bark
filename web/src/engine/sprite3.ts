import { Scene, Vector3 } from "three";
import { getSupportedCodeFixes } from "typescript";
import { IRigitModel } from "./irigitmodel";
import { CubeModel } from "./avatars/cubemodel";
import { IRigitBody, RigitAABB, RigitBodyKind } from "../voxel/irigitbody";

export enum TrackingCameraKind {
  Direct,
  FirstPerson,
  ThirdPerson,
}

export interface ITrackingCamera {
  get cemraKind(): TrackingCameraKind;
  onTargetMove(pos: Vector3): void;
  onTargetSpeed(pos: Vector3): void;
  onTargetDirectionXZ(angle: number): void;
  dispose(): void;
}

// main object for compositing content
export class Sprite3 implements IRigitBody, IDigSprite {
  private static _nextId: number = 1;
  private _id: number;
  private _name: string;
  public owner: any;
  public readonly rigit: IRigitModel | undefined;
  private _inactive: boolean = false;
  private _rigitKind: RigitBodyKind;

  /**
   * speed of sprite; speed is different from direction when it comes to strafe
   * we are moving sideways while looking in direction
   */
  private _speed: Vector3 = new Vector3();
  private _physicsSpeed: Vector3 | undefined;
  private _standing: boolean = false;

  /**
   * direction of the move
   * 0 means that we point in z negative direction
   */
  private _angleXZ: number = 0;

  /**
   * position of sprite
   */
  private _position: Vector3;

  private _trackingCamera: ITrackingCamera | undefined;

  public get id(): number { return this._id; }
  public get name(): string { return this._name; }
  public get rigitKind(): RigitBodyKind { return this._rigitKind; }

  public get relativeSpeed(): Vector3 { return this._speed; }
  public get position(): Vector3 { return this._position.clone() };
  public get size(): Vector3 { return this.rigit!.size };
  public get gravityFactor(): number { return 1 };
  public get maxClimbSpeed(): number { return 20 };
  public get physicsSpeed(): Vector3 { return this._physicsSpeed ?? new Vector3(0, 0, 0); }

  public get x(): number { return this._position.x };
  public get y(): number { return this._position.y };
  public get z(): number { return this._position.z };
  public get angleXZ(): number { return this._angleXZ };
  public get standing(): boolean { return this._standing };

  /**
   * world speed is combination of physics speed, user speed and direction
   */
  public get worldSpeed(): Vector3 {
    // ATT: 0 means we are looking down to z axis. X is forward direction. We need to rotate speed so X becomes Z
    let speed = this._speed.clone().applyAxisAngle(new Vector3(0, 1, 0), this._angleXZ + Math.PI / 2);
    if (this._physicsSpeed) {
      speed.add(this._physicsSpeed);
    }
    return speed;
  };

  public constructor(name: string, rigit?: IRigitModel, rigitKind?: RigitBodyKind) {
    this._id = Sprite3._nextId++;
    this._name = name;
    this.rigit = rigit ?? new CubeModel(1.0);
    this._position = new Vector3();
    this._rigitKind = rigitKind ?? RigitBodyKind.object;
  }

  public async load(uri: string): Promise<void> {
    await this.rigit!.load(uri);
    this.rigit!.setPosition(this._position);
    this.rigit!.setDirectionXZ(0);
  }

  public addToScene(scene: Scene) {
    this.rigit!.addToScene(scene);
    // console.log('Loaded sprite: ' + this._id);
  }

  public removeFromScene(scene: Scene) {
    this.rigit!.removeFromScene(scene);
    // console.log('Remove sprite: ' + this._id);
  }

  public onRender(tick: number) {
    this.rigit?.onRenderFrame(tick);
  }

  public setPosition(pos: Vector3) {
    this._position = pos;
    this.rigit!.setPosition(pos);
  }

  public setPhysicsSpeed(speed: Vector3 | undefined) {
    this._physicsSpeed = speed;
  }
  public setStanding(val: boolean): void {
    this._standing = val;
  }

  /**
   * set speed of sprite relative to direction
   */
  public setRelativeSpeed(speed: Vector3) {
    if (!this._speed.equals(speed)) {
      if (this.name === 'monky') {
        console.log(`setSpeed: ${speed.x} ${speed.z}`);
      }
    }

    this._speed = speed;
    if (this._trackingCamera) {
      this._trackingCamera.onTargetSpeed(speed);
    }
  }

  public setDirectionXZ(angle: number) {
    if (angle === undefined) {
      return;
    }

    this._angleXZ = angle;

    // TODO: need to separate speed from direction
    this.rigit!.setDirectionXZ(angle);

    this._inactive = (angle === 0);
    if (this._trackingCamera) {
      this._trackingCamera.onTargetDirectionXZ(angle);
    }
  }

  public aabb(pos: Vector3 | undefined): RigitAABB {
    return this.rigit!.aabb(pos);
  }

  public setTrackingCamera(camera: ITrackingCamera | undefined) {
    this._trackingCamera = camera;
  }

  public onMove(pos: Vector3): void {
    this._position = pos;

    // move meshes; we should run this through rigitmodel to update
    // position correctly
    this.rigit!.setPosition(pos);

    if (this._trackingCamera) {
      this._trackingCamera.onTargetMove(pos);
    }
  }
}
