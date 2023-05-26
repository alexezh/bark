import { vm } from "../engine/ivm";
import { IAction, ICommandLayer } from "./iaction";
import { shell } from "../ui/igameshell";
import { CommandAction } from "./commandaction";
import { EditCodeAction, registerEditCodeActions } from "./editcodeaction";

// display list of blocks, selects block as current
export class SelectBlockAction extends CommandAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['select', 'vox', 'block'] }

}

export class EditLevelAction extends CommandAction {
  public constructor() {
    super('EditLevel', ['level', 'edit', 'level']);
  }

  protected override onClick(bar: ICommandLayer) {
    vm.editLevel();
  }
}

export class EditBlockAction extends CommandAction {
  public constructor() {
    super('EditVox', ['edit', 'block', 'vox']);
  }

  protected override onClick(bar: ICommandLayer) {
  }
}



export function registerEditActions(actions: IAction[]) {
  actions.push(new EditLevelAction());
  actions.push(new EditBlockAction());
  registerEditCodeActions(actions);
}

