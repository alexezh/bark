import { IAction } from "./iaction";
import { CreateLevelAction, CreateProjectAction } from "./createprojectaction";
import { registerEditActions } from "./editaction";

let actions: IAction[] = [];

export function getTopLevelActions(): IAction[] {
  return actions;
}

export function registerActions() {
  //actions.push(new RunGameAction());
  //actions.push(new MoveCameraAction());
  actions.push(new CreateProjectAction());
  actions.push(new CreateLevelAction());
  // actions.push(new ThirdPersonCameraAction());

  registerEditActions(actions);
}
