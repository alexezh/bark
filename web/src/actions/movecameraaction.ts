import { Vector3 } from "three";
import { vm } from "../engine/ivm";
import { createButton, createCommandButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";
import { IAction, ICommandLayer } from "./iaction"
import { CommandAction } from "./commandaction";
import { FormPane } from "./formpane";

export class ThirdPersonCameraAction extends CommandAction {
  get name(): string { return 'Third person camera' }
  get tags(): string[] { return ['level', 'edit', 'level'] }

  protected override onClick(bar: ICommandLayer) {
    //vm.camera.setThirdPersonCamera();
  }
}

export class MoveCameraAction implements IAction {
  private button: HTMLButtonElement | undefined;
  private propPage: HTMLDivElement | undefined;

  get name(): string { return 'MoveCamera' }
  get tags(): string[] { return ['camera', 'edit', 'move'] }

  public constructor() {
  }

  renderButton(parent: HTMLElement, bar: ICommandLayer) {
    this.button = createCommandButton(parent, "MoveCamera", () => {
      this.onMoveCameraClick(bar)
    });
  }

  destroyButton(parent: HTMLElement) {
    if (this.button === undefined) {
      return;
    }

    parent.removeChild(this.button);
    this.button = undefined;
  }

  private onMoveCameraClick(bar: ICommandLayer) {
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

    bar.openDetailsPane(form.element);
  }
}
