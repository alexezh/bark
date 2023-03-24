import { fetchResource } from "../lib/fetchadapter";
import { Vox } from "./vox";
import { VoxelModel, VoxelModelFrame } from "./voxelmodel";

export class VoxelModelCache {
  private readonly models: Map<string, VoxelModel> = new Map<string, VoxelModel>();

  public async getVoxelModel(url: string): Promise<VoxelModel> {
    let model = this.models.get(url);
    if (model !== undefined) {
      return model;
    }

    let chunkBlob = await fetchResource(url);
    let vox = new Vox();
    let voxelFile = vox.loadModel(chunkBlob, url);
    if (voxelFile === undefined) {
      throw Error('cannpt load model');
    }

    model = new VoxelModel(url);
    for (let f of voxelFile.frames) {
      let mf = new VoxelModelFrame(f);
      model.frames.push(mf);
    }

    this.models.set(url, model);

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