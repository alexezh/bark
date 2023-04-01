import { vm } from "../engine/ivm";
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

  protected onClick() {

  }
}

export class EditBlockAction extends CommandAction {
  get name(): string { return 'EditVox'; }
  get tags(): string[] { return ['edit', 'block', 'vox'] }

  protected onClick() {
    vm.editLevel();
  }
}

export class EditCodeAction extends CommandAction {
  get name(): string { return 'EditCode'; }
  get tags(): string[] { return ['edit', 'code'] }

  protected onClick() {

  }
}