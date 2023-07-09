import { vm } from "../engine/ivm";
import { FolderAction, FuncAction } from "./commandaction";
import { FormAction, FormPane } from "./formpane";
import { IAction, ICommandLayer } from "./iaction";
import { ImportVoxAction } from "./importaction";

function selectSprite() {

}

function createSpriteForm(layer: ICommandLayer): FormPane {

  let form = new FormPane();

  let cp = vm.camera?.position;
  form.addTextField('name', 'MySprite', (val: string) => {
  });

  form.addButtom('Create', () => createSprite(form));

  return form;
}

function createSprite(form: FormPane) {
  console.log('createSprite');
}

export function getSpriteActions(): IAction[] {
  return [
    new FuncAction('Select Sprite', { closePane: false }, selectSprite),
    new FormAction('Create Sprite', [], createSpriteForm),
    new FuncAction('Edit Code', { closePane: false }, () => vm.levelEditor?.copyBlock()),
    new FuncAction('Show Info', { closePane: false }, () => vm.levelEditor?.copyBlock()),
    new FolderAction('Skins'),
    //new FuncAction('Block Library', { closePane: false }, () => this.showLibrary(bar)),
    new ImportVoxAction('Import Skin')
  ]
}
