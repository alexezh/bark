import { WireLevelInfo, WireProjectConfig, fetchResource, getProjectId, setProjectId, wireCreateProject, wireSetObject, wireSetUserString } from "../lib/fetchadapter";
import { CommandAction, FormPane } from "./commandaction";
import { v4 as uuidv4 } from 'uuid';
import { vm } from "../engine/ivm";
import { ICommandBar } from "../ui/iaction";
import { VoxelModelCache, WireModelInfo, modelCache } from "../voxel/voxelmodelcache";
import { ImportVoxAction, UploadFile } from "./importaction";
import { Vox } from "../voxel/vox";
import { ThumbnailRenderer } from "../voxel/thumbnailrenderer";
import { VoxelLevelFile } from "../engine/voxellevelfile";
import { FileMapBlock } from "../ui/ivoxelmap";

export class CreateProjectAction extends CommandAction {
  get name(): string { return 'CreateProject' }
  get tags(): string[] { return ['project', 'create'] }

  protected override onClick(bar: ICommandBar) {
    let pane = new FormPane();
    pane.addTextField('Name', 'MyProject');
    //pane.addIntField('Blocks X', 100);
    //pane.addIntField('Blocks Z', 100);
    pane.addButtom('Create', () => this.createProject(pane));
    bar.openDetailsPane(pane.element);
  }

  private async createProject(pane: FormPane): Promise<void> {
    let oldProject: string | undefined = getProjectId();
    try {
      let name = pane.values['Name'];
      let response = await wireCreateProject(name);

      // switch project id for next requests
      // at this point we are switching to new project; so we have to reload
      // but before we reload, create a level so we have somewhere to go
      // if we fail; go bath
      setProjectId(response.id);

      await CreateLevelAction.createLevelParams('default', 100, 100);

      await vm.loadProject(response.id);

      //await wireSetUserString('lastProject', response.id);
    }
    catch (e) {
      console.log('createProject failed');
      if (oldProject !== undefined) {
        setProjectId(oldProject);
      }
    }
  }
}

async function importDefaultModels(voxNames: string[]): Promise<WireModelInfo[] | undefined> {
  let vox = new Vox;
  let tr = new ThumbnailRenderer(128, 128);

  let uploadFiles: UploadFile[] = [];
  for (let voxName of voxNames) {

    let chunkBuffer = await fetchResource('assets/vox/' + voxName);
    let chunkBlob = new Uint8Array(chunkBuffer);

    let thumb = await ImportVoxAction.renderThumbnail(vox, tr, chunkBlob, voxName);
    if (typeof thumb === 'string' || thumb === undefined) {
      continue;
    }

    uploadFiles.push({
      fn: voxName,
      vox: chunkBlob,
      png: thumb
    });
  }

  return ImportVoxAction.upload(uploadFiles);
}

/**
 * creates default project with default map
 */
export async function createDefaultProject(): Promise<void> {
  let projectConfig: WireProjectConfig = {
    version: 1
  };

  console.log('createDefaultProject');

  await wireSetObject<WireProjectConfig>('config', projectConfig);

  let modelInfos = await importDefaultModels(['ground.vox', 'monky.vox', 'bomb.vox']);
  if (modelInfos === undefined) {
    return;
  }

  let file = await VoxelLevelFile.createLevel('levels/default');

  let blocks: FileMapBlock[] = [];
  for (let x = 0; x < file.mapSize.sx; x++) {
    for (let z = 0; z < file.mapSize.sz; z++) {
      blocks.push({ x: x, y: 0, z: z, blockId: modelInfos[0].id });
    }
  }

  file.addBlocks(blocks);
}

export class CreateLevelAction extends CommandAction {
  get name(): string { return 'CreateLevel' }
  get tags(): string[] { return ['level', 'create', 'level'] }

  protected override onClick(bar: ICommandBar) {
    let pane = new FormPane();
    pane.addTextField('Name', 'MyLevel');
    pane.addIntField('Blocks X', 100);
    pane.addIntField('Blocks Z', 100);
    pane.addButtom('Create', () => this.createLevel(pane));
    bar.openDetailsPane(pane.element);
  }

  private createLevel(pane: FormPane): Promise<void> {
    return CreateLevelAction.createLevelParams(pane.values['Name'], pane.values['Block X'], pane.values['Block Z'])
  }

  public static async createLevelParams(name: string, sx: number, sz: number): Promise<void> {
    let levelInfo: WireLevelInfo = {
      name: name,
      id: uuidv4(),
      sx: sx,
      sy: 1,
      sz: sz,
    }
    wireSetObject(`levels/info/${levelInfo.id}`, levelInfo);
  }
}


