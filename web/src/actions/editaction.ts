import { vm } from "../engine/ivm";
import { IAction, ICommandLayer } from "./iaction";
import { shell } from "../ui/igameshell";
import { CommandAction } from "./commandaction";

// display list of blocks, selects block as current
export class SelectBlockAction extends CommandAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['select', 'vox', 'block'] }

}

export class EditLevelAction extends CommandAction {
  get name(): string { return 'EditLevel' }
  get tags(): string[] { return ['level', 'edit', 'level'] }

  protected override onClick(bar: ICommandLayer) {
    vm.editLevel();
  }
}

export class EditBlockAction extends CommandAction {
  get name(): string { return 'EditVox'; }
  get tags(): string[] { return ['edit', 'block', 'vox'] }

  protected override onClick(bar: ICommandLayer) {
  }
}

export class EditCodeAction extends CommandAction {
  get name(): string { return 'EditCode'; }
  get tags(): string[] { return ['edit', 'code'] }

  protected override onClick(bar: ICommandLayer) {
    vm.stop();
    shell.editCode();
  }
}

export function registerEditActions(actions: IAction[]) {
  actions.push(new EditLevelAction());
  actions.push(new EditBlockAction());
  actions.push(new EditCodeAction());
}

