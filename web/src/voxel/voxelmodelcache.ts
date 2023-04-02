import { fetchResource } from "../lib/fetchadapter";
import { Vox } from "./vox";
import { VoxelModel, VoxelModelFrame } from "./voxelmodel";

export class VoxelModelCache {
  private readonly modelsByUrl: Map<string, VoxelModel> = new Map<string, VoxelModel>();
  private readonly modelsById: Map<number, VoxelModel> = new Map<number, VoxelModel>();
  private nextId: number = 1;

  public getVoxelModelById(id: number): VoxelModel | undefined {
    return this.modelsById.get(id);
  }

  public async getVoxelModel(url: string): Promise<VoxelModel> {
    let model = this.modelsByUrl.get(url);
    if (model !== undefined) {
      return model;
    }

    let chunkBlob = await fetchResource(url);
    let vox = new Vox();
    let voxelFile = vox.loadModel(chunkBlob, url);
    if (voxelFile === undefined) {
      throw Error('cannpt load model');
    }

    let id = this.nextId++;

    model = new VoxelModel(url, id);
    for (let f of voxelFile.frames) {
      let mf = new VoxelModelFrame(f);
      model.frames.push(mf);
    }

    this.modelsByUrl.set(url, model);
    this.modelsById.set(model.id, model);

    return model;
  };
}

export let modelCache: VoxelModelCache = new VoxelModelCache();

export function getCharacterModelList(): string[] {
  return [
    './assets/vox/monky.vox',
  ]
}

export function getBlockModelList(): string[] {
  return [
    './assets/vox/ground.vox'
  ]
}

export function getObjectModelList(): string[] {
  return [
    './assets/vox/ground.vox'
  ]
}