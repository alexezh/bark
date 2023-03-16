import { Matrix4, Quaternion, Vector3 } from "three";
import { IRigitModel } from "../irigitmodel";
import { Sprite3 } from "../sprite3";
import { VoxelMeshModel } from "../../voxel/voxelmeshmodel";

export class Mammal4Model implements IRigitModel {
  private speed: Vector3 | undefined;
  private qt: Quaternion | undefined;

  public onRender(speed: Vector3, parts: VoxelMeshModel) {
    if (this.speed !== undefined && this.speed.equals(speed)) {
      return;
    }

    //var mx = new Matrix4().lookAt(speed, new Vector3(0, 0, 0), new Vector3(0, 0, 1));
    //this.qt = new Quaternion().setFromRotationMatrix(mx);
    let angle = Math.atan2(speed.x, -speed.y);
    this.qt = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angle);
    parts.setRotation(this.qt);
  }

  // adds new position to the path
  // recomputes position of parts
  public move(pos: Vector3, parts: VoxelMeshModel) {
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
