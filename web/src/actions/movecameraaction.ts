import { vm } from "../engine/ivm";
import { ICommandLayer } from "./iaction"
import { BasicAction } from "./commandaction";
import { FormPane } from "./formpane";

export class ThirdPersonCameraAction extends BasicAction {
  public constructor() {
    super('Third person camera', { tags: ['level', 'edit', 'level'] })
  }

  protected override onClick(bar: ICommandLayer) {
    //vm.camera.setThirdPersonCamera();
  }
}

export function moveCameraForm(bar: ICommandLayer): FormPane {
  let form = new FormPane();

  let cp = vm.camera?.position;
  form.addIntField('x', cp?.x, (val: number) => {
    let camera = vm.camera;
    if (camera === undefined) {
      return;
    }
    let newPos = camera.position.clone();
    newPos.x = val;
    camera.position = newPos;
  });
  form.addIntField('y', cp?.y, (val: number) => {
    let camera = vm.camera;
    if (camera === undefined) {
      return;
    }
    let newPos = camera.position.clone();
    newPos.y = val;
    camera.position = newPos;
  });
  form.addIntField('z', cp?.y, (val: number) => {
    let camera = vm.camera;
    if (camera === undefined) {
      return;
    }
    let newPos = camera.position.clone();
    newPos.z = val;
    camera.position = newPos;
  });

  return form;
}
