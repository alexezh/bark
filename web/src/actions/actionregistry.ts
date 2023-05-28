import { IAction } from "./iaction";
import { CreateLevelAction, CreateProjectAction } from "./createprojectaction";
import { registerEditActions } from "./editaction";
import { ImportVoxAction } from "./importaction";
import { MoveCameraAction, ThirdPersonCameraAction } from "./movecameraaction";

let actions: IAction[] = [];

export function getTopLevelActions(): IAction[] {
  return actions;
}

export function registerActions() {
  actions.push(new MoveCameraAction());
  actions.push(new CreateProjectAction());
  actions.push(new CreateLevelAction());
  actions.push(new ThirdPersonCameraAction());

  registerEditActions(actions);
}
