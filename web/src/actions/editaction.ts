import { vm } from "../engine/ivm";
import { IAction, ICommandLayer } from "./iaction";
import { shell } from "../ui/igameshell";
import { BasicAction } from "./commandaction";
import { EditCodeAction, registerEditCodeActions } from "./editcodeaction";

// display list of blocks, selects block as current
export class SelectBlockAction extends BasicAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['select', 'vox', 'block'] }

}

export class EditBlockAction extends BasicAction {
  public constructor() {
    super('EditVox', { tags: ['edit', 'block', 'vox'] });
  }

  protected override onClick(bar: ICommandLayer) {
  }
}



export function registerEditActions(actions: IAction[]) {
  actions.push(new EditBlockAction());
  registerEditCodeActions(actions);
}

