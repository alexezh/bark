import { base64ToBytes } from "../lib/base64";
import { WireDict, WireString, fetchResource, wireGetDict, wireGetStrings, wireIncrement, wireSetDict } from "../lib/fetchadapter";
import { Vox } from "./vox";
import { VoxelModel, VoxelModelFrame } from "./voxelmodel";

export type WireModelInfo = {
  id: number;
  voxUrl: string;
  thumbnailUrl: string;
}

export class VoxelModelCache {
  private readonly modelsByUrl: Map<string, VoxelModel> = new Map<string, VoxelModel>();
  private readonly modelsById: Map<number, VoxelModel> = new Map<number, VoxelModel>();
  private nextId: number = 1;

  public getVoxelModelById(id: number): VoxelModel | undefined {
    return this.modelsById.get(id);
  }

  public async load() {
    let dict = await wireGetDict('models', undefined);
    let voxUrls: string[] = [];

    if (dict !== undefined) {
      for (let modelEntry of dict) {
        let modelInfo: WireModelInfo = JSON.parse(modelEntry.value);
        voxUrls.push(modelInfo.voxUrl);
      }

      // we might return different list than input
      let voxs = await wireGetStrings(voxUrls);

    }
  }

  public async addModels(models: { voxUrl: string, thumbnailUrl: string }[]) {
    let dict: WireDict[] = [];

    let startIdx = await wireIncrement('modelcount', models.length);
    if (startIdx === undefined) {
      return;
    }

    for (let model of models) {
      let entry: WireModelInfo = {
        id: startIdx,
        voxUrl: model.voxUrl,
        thumbnailUrl: model.thumbnailUrl
      }
      dict.push({ field: entry.id.toString(), value: JSON.stringify(entry) });
      startIdx++;
    }
    await wireSetDict('models', dict);
  }

  public async getVoxelModel(url: string): Promise<VoxelModel> {
    let model = this.modelsByUrl.get(url);
    if (model !== undefined) {
      return model;
    }

    let id = this.nextId++;
    let chunkBuffer = await fetchResource(url);
    let chunkBlob = new Uint8ClampedArray(chunkBuffer);

    return this.loadModelFromArray(id, url, chunkBlob);
  };


  private loadModelFromString(id: number, url: string, modelData64: string): VoxelModel {
    let chunkBlob = base64ToBytes(modelData64);
    return this.loadModelFromArray(id, url, chunkBlob);
  }

  private loadModelFromArray(id: number, url: string, chunkBlob: Uint8ClampedArray): VoxelModel {
    let vox = new Vox();
    let voxelFile = vox.loadModel(chunkBlob, url);
    if (voxelFile === undefined) {
      throw Error('cannpt load model');
    }

    let model = new VoxelModel(url, id);
    for (let f of voxelFile.frames) {
      let mf = new VoxelModelFrame(f);
      model.frames.push(mf);
    }

    this.modelsByUrl.set(url, model);
    this.modelsById.set(model.id, model);

    return model;
  }
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