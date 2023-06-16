import { Group, PerspectiveCamera, Vector3 } from "three";
import { ITrackingCamera } from "./sprite3";

export class DirectCamera implements ITrackingCamera {
  private camera!: PerspectiveCamera;
  private cameraGroup!: Group;

  public constructor(camera: PerspectiveCamera, cameraGroup: Group) {
    this.camera = camera;
    this.cameraGroup = cameraGroup;

    //var point = new Vector3(0, 0, 0);
    //ßthis.camera.lookAt(point);
    let angleZ = Math.PI / 4;

    this.camera.position.set(100, 200, 100 + 100 * Math.tan(angleZ));

    //this.cameraGroup.position.set(0, 0, 0);
    this.cameraGroup.rotation.set(-angleZ, 0, 0);
    //this.cameraGroup.position.set(100, 200, 100 + 100 * Math.tan(angleZ));
    (this.camera as PerspectiveCamera).updateProjectionMatrix();
  }

  dispose() {
  }

  onTargetMove(pos: Vector3): void {
  }

  onTargetSpeed(pos: Vector3): void {
  }

  onTargetDirectionXZ(angle: number): void {
  }
}
