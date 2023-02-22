import { IRigitBody } from "./sprite3";

class PathElement {

}

// sprites follow the path of the first sprite
class RoapBody implements IRigitBody {
    private sprites: Sprite3[] = [];
    private path: Vector3[] = [];
}

export function 