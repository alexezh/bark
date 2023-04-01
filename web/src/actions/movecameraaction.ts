import { Vector3 } from "three";
import { vm } from "../engine/ivm";
import { ICommandBar } from "../ui/commandBar"
import { createButton, createCommandButton, createTextEntry } from "../lib/htmlutils";
import { IAction } from "../ui/iaction"

export class MoveCameraAction implements IAction {
  private button: HTMLButtonElement | undefined;
  private propPage: HTMLDivElement | undefined;
  private bar: ICommandBar;

  get name(): string { return 'MoveCamera' }
  get tags(): string[] { return ['camera', 'edit', 'move'] }

  public constructor(bar: ICommandBar) {
    this.bar = bar;
  }

  renderButton(parent: HTMLElement) {
    this.button = createCommandButton(parent, "MoveCamera", this.onMoveCameraClick.bind(this));
  }

  destroyButton(parent: HTMLElement) {
    if (this.button === undefined) {
      return;
    }

    parent.removeChild(this.button);
    this.button = undefined;
  }

  private onMoveCameraClick() {
    let pane = document.createElement('div');
    pane.className = 'commandPane';
    let cp = vm.camera?.position;
    createTextEntry(pane, 'x', cp?.x, (val: string) => {
      let camera = vm.camera;
      if (camera === undefined) {
        return;
      }
      let newPos = camera.position.clone();
      newPos.x = parseInt(val);
      camera.position = newPos;
    });
    createTextEntry(pane, 'y', cp?.y, (val: string) => {
      let camera = vm.camera;
      if (camera === undefined) {
        return;
      }
      let newPos = camera.position.clone();
      newPos.y = parseInt(val);
      camera.position = newPos;
    });
    createTextEntry(pane, 'z', cp?.y, (val: string) => {
      let camera = vm.camera;
      if (camera === undefined) {
        return;
      }
      let newPos = camera.position.clone();
      newPos.z = parseInt(val);
      camera.position = newPos;
    });

    this.bar.openDetailsPane(pane);
  }
}
