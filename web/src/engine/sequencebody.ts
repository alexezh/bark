import { Vector3 } from "three";
import { IRigitBody, IRigitModel, VoxelMeshModel } from "./voxelmeshmodel";

class PathElement {

}

// sprites follow the path of the first sprite
export class RoapModel implements IRigitModel {
    private path: Vector3[] = [];
    private dir: Vector3 | undefined;

    // adds new position to the path
    // recomputes position of parts
    public move(pos: Vector3, parts: VoxelMeshModel) {
        this.path.splice(0, 0, pos);
    }

    // recalc from physics
    public update() {

    }
}

