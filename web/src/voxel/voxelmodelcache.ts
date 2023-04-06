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

  public getVoxelModelById(id: number): VoxelModel | undefined {
    return this.modelsById.get(id);
  }

  public getVoxelModel(url: string): VoxelModel | undefined {
    let model = this.modelsByUrl.get(url);
    return model;
  }


  public async load(): Promise<boolean> {
    let modelEntries = await wireGetDict('models', undefined);

    if (modelEntries === undefined) {
      return false;
    }

    await this.loadModelEntries(modelEntries);
    return true;
  }

  public async loadModelEntries(modelEntries: WireDict[]): Promise<void> {
    let voxUrls: string[] = [];
    let modelInfos: Map<string, WireModelInfo> = new Map<string, WireModelInfo>();
    for (let modelEntry of modelEntries) {
      let modelInfo: WireModelInfo = JSON.parse(modelEntry.value);
      voxUrls.push(modelInfo.voxUrl);
      modelInfos.set(modelInfo.voxUrl, modelInfo);
    }

    // we might return different list than input
    let voxs = await wireGetStrings(voxUrls);
    for (let vox of voxs) {
      let modelInfo = modelInfos.get(vox.key);
      if (modelInfo === undefined) {
        console.log('Unknown model:' + vox.key);
        continue;
      }

      this.loadModelFromString(modelInfo.id, vox.key, vox.data);
    }
  }

  /**
   * add model references to cloud; models have to be loaded from cloud separately
   */
  public static async addModelReferences(models: { voxUrl: string, thumbnailUrl: string }[]): Promise<WireModelInfo[] | undefined> {
    let dict: WireDict[] = [];
    let infos: WireModelInfo[] = [];

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
      infos.push(entry);
      dict.push({ field: entry.id.toString(), value: JSON.stringify(entry) });
      startIdx++;
    }
    await wireSetDict('models', dict);

    return infos;
  }

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

