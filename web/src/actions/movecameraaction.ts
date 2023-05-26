import { Vector3 } from "three";
import { vm } from "../engine/ivm";
import { createButton, createCommandButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";
import { IAction, ICommandLayer } from "./iaction"
import { CommandAction } from "./commandaction";
import { FormAction, FormPane } from "./formpane";

export class ThirdPersonCameraAction extends CommandAction {
  public constructor() {
    super('Third person camera', ['level', 'edit', 'level'])
  }

  protected override onClick(bar: ICommandLayer) {
    //vm.camera.setThirdPersonCamera();
  }
}

export class MoveCameraAction extends FormAction {
  public constructor() {
    super('MoveCamera', ['camera', 'edit', 'move']);
  }

  protected createForm(bar: ICommandLayer): FormPane {
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
}
