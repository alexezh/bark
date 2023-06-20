import { vm } from "../engine/ivm";
import { FolderAction, FuncAction } from "./commandaction";
import { IAction } from "./iaction";
import { ImportVoxAction } from "./importaction";

export function getSpriteActions(): IAction[] {
  return [
    new FuncAction('Code', { closePane: false }, () => vm.levelEditor?.copyBlock()),
    new FuncAction('Info', { closePane: false }, () => vm.levelEditor?.copyBlock()),
    new FolderAction('Skins'),
    //new FuncAction('Block Library', { closePane: false }, () => this.showLibrary(bar)),
    new ImportVoxAction('Import Skin')
  ]
}
