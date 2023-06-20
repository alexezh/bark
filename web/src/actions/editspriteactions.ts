import { vm } from "../engine/ivm";
import { FuncAction } from "./commandaction";
import { IAction } from "./iaction";
import { ImportVoxAction } from "./importaction";

export function getSpriteActions(): IAction[] {
  return [
    new FuncAction('Copy', { closePane: false }, () => vm.levelEditor?.copyBlock()),
    new FuncAction('Cut', { closePane: false }, () => vm.levelEditor?.cutBlock()),
    new FuncAction('Paste', { closePane: false }, () => vm.levelEditor?.pasteBlock()),
    new FuncAction('Clear', { closePane: false }, () => vm.levelEditor?.clearBlock()),
    new FuncAction('RotateXZ', { closePane: false }, () => vm.levelEditor?.rotateXZ()),
    new FuncAction('FlipX', { closePane: false }, () => vm.levelEditor?.flipX()),
    new FuncAction('FlipZ', { closePane: false }, () => vm.levelEditor?.flipZ()),
    //new FuncAction('Block Library', { closePane: false }, () => this.showLibrary(bar)),
    new ImportVoxAction()
  ]
}
