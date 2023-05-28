import { base64ToBytes } from "../lib/base64";
import { WireDict, wireGetDict, wireGetStrings, wireIncrement, wireSetDict } from "../lib/fetchadapter";
import { Vox } from "./vox";
import { VoxelModel, VoxelModelFrame } from "./voxelmodel";

export type ImportFile = {
  fn: string;
  voxUrl?: string;
  thumbnailUrl?: string;
  vox: Uint8Array;
  rotateYZ: boolean | undefined;
  png: ImageData | undefined;
}

export type WireModelInfo = {
  id: number;
  voxUrl: string;
  thumbnailUrl: string;
  rotateYZ: boolean;
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

  public *getVoxelModels(): Iterable<VoxelModel> {
    for (let model of this.modelsById) {
      yield model[1];
    }
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
      console.log(`load: ${vox.key} ${modelInfo?.id}`);
      if (modelInfo === undefined) {
        console.log('Unknown model:' + vox.key);
        continue;
      }

      this.loadModelFromString(modelInfo, vox.data);
    }
  }

  /**
   * add model references to cloud; models have to be loaded from cloud separately
   */
  public async importFiles(importFiles: ImportFile[]): Promise<WireModelInfo[] | undefined> {
    let dict: WireDict[] = [];
    let infos: WireModelInfo[] = [];

    let startIdx = await wireIncrement('modelcount', importFiles.length);
    if (startIdx === undefined) {
      return;
    }

    for (let imp of importFiles) {
      let model = this.modelsByUrl.get(imp.voxUrl!);

      // reuse ID if existing item
      let entry: WireModelInfo = {
        id: startIdx,
        voxUrl: imp.voxUrl!,
        thumbnailUrl: imp.thumbnailUrl!,
        rotateYZ: imp.rotateYZ ?? false
      }
      if (model !== undefined) {
        console.log(`updateModel: ${imp.voxUrl} ${model.id}`)
        entry.id = model.id;
      } else {
        console.log(`addModel: ${imp.voxUrl} ${startIdx}`)
        startIdx++;
      }
      dict.push({ field: entry.id.toString(), value: JSON.stringify(entry) });
    }
    await wireSetDict('models', dict);

    // reload from server
    await this.loadModelEntries(dict);

    return infos;
  }

  private loadModelFromString(modelInfo: WireModelInfo, modelData64: string): VoxelModel {
    let chunkBuffer = base64ToBytes(modelData64);
    return this.loadModelFromArray(modelInfo, new Uint8Array(chunkBuffer));
  }

  private loadModelFromArray(modelInfo: WireModelInfo, chunkBlob: Uint8Array): VoxelModel {
    let vox = new Vox();
    let voxelFile = vox.loadModel(chunkBlob, false);
    if (voxelFile === undefined) {
      throw Error('cannpt load model');
    }

    let model = new VoxelModel(modelInfo.id, modelInfo.voxUrl, modelInfo.thumbnailUrl);
    for (let f of voxelFile.frames) {
      let mf = new VoxelModelFrame(f);
      model.frames.push(mf);
    }

    this.modelsByUrl.set(modelInfo.voxUrl, model);
    this.modelsById.set(model.id, model);

    return model;
  }
}

export let modelCache: VoxelModelCache = new VoxelModelCache();

