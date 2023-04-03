import { IAction } from "../ui/iaction";
import { CreateLevelAction, CreateProjectAction } from "./createprojectaction";
import { registerEditActions } from "./editaction";
import { ImportVoxAction } from "./importaction";
import { MoveCameraAction } from "./movecameraaction";

let actions: IAction[] = [];

export function getActions(): IAction[] {
  return actions;
}

export function registerActions() {
  actions.push(new ImportVoxAction());
  actions.push(new MoveCameraAction());
  actions.push(new CreateProjectAction());
  actions.push(new CreateLevelAction());

  registerEditActions(actions);
}
