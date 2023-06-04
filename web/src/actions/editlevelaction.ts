import { vm } from "../engine/ivm";
import { getWireResourceUri } from "../lib/fetchadapter";
import { VoxelModel } from "../voxel/voxelmodel";
import { VoxelModelCache, modelCache } from "../voxel/voxelmodelcache";
import { BasicAction, FuncAction } from "./commandaction";
import { ICommandLayer, DetailsPaneKind } from "./iaction";
import { ImportVoxAction } from "./importaction";

export class EditLevelAction extends BasicAction {
  private wrapper: HTMLDivElement | undefined;
  private library: HTMLDivElement | undefined;

  public constructor() {
    super('EditLevel', { tags: ['level', 'edit', 'level'] });
  }

  protected override onClick(bar: ICommandLayer) {
    vm.stop();
    vm.editLevel();

    bar.pushActions(
      [
        new FuncAction('Back', {}, () => this.onBack(bar)),
        new FuncAction('Copy', { closePane: false }, () => vm.levelEditor?.copyBlock()),
        new FuncAction('Cut', { closePane: false }, () => vm.levelEditor?.cutBlock()),
        new FuncAction('Paste', { closePane: false }, () => vm.levelEditor?.pasteBlock()),
        new FuncAction('Clear', { closePane: false }, () => vm.levelEditor?.clearBlock()),
        new FuncAction('RotateXZ', { closePane: false }, () => vm.levelEditor?.rotateXZ()),
        new FuncAction('FlipX', { closePane: false }, () => vm.levelEditor?.flipX()),
        new FuncAction('FlipZ', { closePane: false }, () => vm.levelEditor?.flipZ()),
        new FuncAction('Block Library', { closePane: false }, () => this.showLibrary(bar)),
        new ImportVoxAction()
      ]);
  }

  private onBack(bar: ICommandLayer) {
    bar.popActions();
  }

  private showLibrary(bar: ICommandLayer) {
    if (this.wrapper !== undefined) {
      bar.closeDetailsPane();
      this.wrapper = undefined;
    } else {

      this.wrapper = document.createElement('div');
      this.wrapper.className = 'blockLibraryWrapper';

      this.library = document.createElement('div');
      this.library.className = 'blockLibrary';
      this.wrapper.appendChild(this.library);

      this.renderLibrary();
      bar.openDetailsPane(this.wrapper, DetailsPaneKind.Partial);
    }
  }

  private renderLibrary() {
    for (let model of modelCache.getVoxelModels()) {
      let item = document.createElement('div');
      item.className = 'blockLibraryItem';

      let image = document.createElement('img') as HTMLImageElement;
      image.src = getWireResourceUri(model.thumbnailUri);
      item.appendChild(image);
      item.addEventListener('click', () => this.onSelectItem(model));

      this.library?.appendChild(item);
    }
  }

  private onSelectItem(model: VoxelModel) {
    vm.levelEditor?.selectBlock(model);
  }
}

