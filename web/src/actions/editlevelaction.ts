import { vm } from "../engine/ivm";
import { getWireResourceUri } from "../lib/fetchadapter";
import { setBlockRegister } from "../ui/ileveleditor";
import { VoxelModel } from "../voxel/voxelmodel";
import { VoxelModelCache, modelCache } from "../voxel/voxelmodelcache";
import { BasicAction, FolderAction, FuncAction, PaneAction } from "./commandaction";
import { ICommandLayer, DetailsPaneKind, IAction } from "./iaction";
import { ImportVoxAction } from "./importaction";

export function getLevelActions(): IAction[] {
  return [
    new FuncAction('Copy', { closePane: false }, () => vm.levelEditor?.copyBlock()),
    new FuncAction('Cut', { closePane: false }, () => vm.levelEditor?.cutBlock()),
    new FuncAction('Paste', { closePane: false }, () => vm.levelEditor?.pasteBlock()),
    new FuncAction('Clear', { closePane: false }, () => vm.levelEditor?.clearBlock()),
    new FuncAction('RotateXZ', { closePane: false }, () => vm.levelEditor?.rotateXZ()),
    new FuncAction('FlipX', { closePane: false }, () => vm.levelEditor?.flipX()),
    new FuncAction('FlipZ', { closePane: false }, () => vm.levelEditor?.flipZ()),
    new PaneAction('Blocks', createBlocksPane),
    //new FuncAction('Block Library', { closePane: false }, () => this.showLibrary(bar)),
    new ImportVoxAction('Import Block')
  ]
}

function createBlocksPane(commandLayer: ICommandLayer): HTMLElement {
  let wrapper = document.createElement('div');
  wrapper.className = 'blockLibraryWrapper';

  let library = document.createElement('div');
  library.className = 'blockLibrary';
  wrapper.appendChild(library);

  renderLibrary(library);

  return wrapper;
}

function renderLibrary(library: HTMLDivElement) {
  for (let model of modelCache.getVoxelModels()) {
    let item = document.createElement('div');
    item.className = 'blockLibraryItem';

    let image = document.createElement('img') as HTMLImageElement;
    image.src = getWireResourceUri(model.thumbnailUri);
    item.appendChild(image);
    item.addEventListener('click', () => onSelectItem(model));

    library.appendChild(item);
  }
}

function onSelectItem(model: VoxelModel) {
  setBlockRegister(model);
}


