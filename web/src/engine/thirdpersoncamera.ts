import { Group, PerspectiveCamera, Vector3 } from "three";
import { ITrackingCamera, Sprite3, TrackingCameraKind } from "./sprite3";

export class ThirtPersonCamera implements ITrackingCamera {
  private camera!: PerspectiveCamera;
  private cameraGroup!: Group;
  private sprite: Sprite3;
  private cameraOffset: Vector3;
  private spritePosition: Vector3;

  /**
   * direction in which sprite is looking
   */
  private angleXZ: number = 0;

  // offset related to sprite direction; such as x, y, 0 means camera behind by X units
  public constructor(sprite: Sprite3, cameraOffset: Vector3, camera: PerspectiveCamera, cameraGroup: Group) {
    this.camera = camera;
    this.cameraGroup = cameraGroup;
    this.sprite = sprite;
    this.cameraOffset = cameraOffset;
    this.sprite = sprite;
    this.spritePosition = sprite.position.clone();

    this.updateCameraPos();
    this.sprite.setTrackingCamera(this);
  }

  get cemraKind(): TrackingCameraKind { return TrackingCameraKind.ThirdPerson; }

  dispose() {
    this.sprite.setTrackingCamera(undefined);
  }

  onTargetMove(pos: Vector3): void {
    this.spritePosition = pos.clone();
    this.updateCameraPos();
  }

  onTargetSpeed(speed: Vector3): void {
  }

  onTargetDirectionXZ(angle: number): void {
    this.angleXZ = angle;
    this.updateCameraPos();
  }

  private updateCameraPos() {
    let cpos = this.spritePosition.clone();
    let off = this.cameraOffset.clone();

    // we are behind model in x direction; left/right is z direction
    // 0 degree angle is in z direction. We want to rotate offset by 90 degree more
    // to get behind the model
    off.applyAxisAngle(new Vector3(0, 1, 0), this.angleXZ - Math.PI / 2);

    // we need to translate offset vector in direction of 
    cpos.add(off);

    this.cameraGroup.position.copy(cpos);
    (this.camera as PerspectiveCamera).updateProjectionMatrix();

    // camera is looking in direction of the model
    this.cameraGroup.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), this.angleXZ);
  }
}
