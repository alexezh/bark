import { snakeCase } from "lodash";
import { wireGetDict, wireGetObject, wireGetString, wireGetStrings, wireIncrement, wireSetDict, wireSetString } from "../lib/fetchadapter";
import { modelCache } from "../voxel/voxelmodelcache";
import { Sprite3 } from "./sprite3";

type WireSprite = {

}

/**
 * SpriteFile is a persisted structure used to create Sprites
 * An application defines a set of files (1,2,3). Each file has code
 * and points to number of models. Each model contains one or more frames
 * which are used to animation; File can also define code level animations
 * 
 * SpriteFile is loaded at open and it then used to create Sprite3 by calling
 * 
 */
export class SpriteFile {
  private id: number;
  private name: string = '';
  private _code!: string;

  // map from user defined skin name to a model url
  private _skins = new Map<string, string>();

  private get url(): string { return '/sprites/' + this.id.toString() }

  public constructor(id: number) {
    this.id = id;
  }

  public static async load(id: number): Promise<SpriteFile> {
    let file = new SpriteFile(id);
    await file.loadWorker();
    return file;
  }

  private async loadWorker(): Promise<void> {
    let code = await wireGetString(this.url + '/code');
    if (code) {
      this._code = code;
    }

    let skins = await wireGetDict(this.url + '/skins', null);
    if (skins) {
      for (let k of skins) {
        this._skins.set(k.field, k.value);
      }
    }

  }

  public async save(): Promise<void> {
    await wireSetString(this.url + '/code', this._code);

  }

  public async addSkin(skinName: string, url: string): Promise<void> {
    this._skins.set(skinName, url);
    await wireSetDict(this.url + '/skins', [{ field: skinName, value: url }]);
  }

  public async removeSkin(skinName: string): Promise<void> {
    throw new Error('Not implemented');
  }

  public createSprite(skinName: string): Sprite3 {
    throw new Error('not implemented');

    // monky:= Sprite.createCubeSprite 'monky' 'vox/monky.vox' scale:=0.5

  }
}

/**
 * each sprite is a directory with multiple keys
 */
export class SpriteFileCollection {
  private sprites = new Map<number, SpriteFile>();

  public async load(): Promise<void> {
    this.
    //this._levelFile = new VoxelLevelFile('levels/' + id);
    //await this._levelFile.load(false);
  }

  public async createSprite(name: string): Promise<SpriteFile> {
    let id = await wireIncrement('spritecount', 1);
    if (!id) {
      throw new Error('Failed to create sprite');
    }
    let sf = new SpriteFile(id, name);
    this.sprites.set(id, sf);
    return sf;
  }
}
