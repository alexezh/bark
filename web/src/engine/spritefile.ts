import { snakeCase } from "lodash";
import { WireString, wireGetDict, wireGetObject, wireGetObjects, wireGetString, wireGetStrings, wireIncrement, wireSetDict, wireSetObject, wireSetObjectBackground, wireSetString } from "../lib/fetchadapter";
import { modelCache } from "../voxel/voxelmodelcache";
import { Sprite3 } from "./sprite3";
import { vm } from "./ivm";
import { CubeModel } from "./avatars/cubemodel";
import { IRigitBody, RigitBodyKind } from "../voxel/irigitbody";
import { createDefaultSprites } from "../actions/createprojectaction";
import { IRigitModel } from "./irigitmodel";

type WireSpriteFile = {
  id: number;
  name: string;
  code: string;
  skins: { id: string, url: string }[];
}

const defaultSkin = 'default';

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
  private _code!: string;

  /**
   * user defined name; used for debugging and such
   */
  public name: string = '';

  // map from user defined skin name to a model url
  private _skins = new Map<string, string>();

  private static getSpriteUrl(id: number): string { return '/sprites/' + id.toString() }

  public constructor(id: number, file?: WireSpriteFile) {
    this.id = id;
    if (file) {
      this._code = file.code;
      for (let s of file.skins) {
        this._skins.set(s.id, s.url);
      }
    }
  }

  public static async load(id: number): Promise<SpriteFile> {
    let wireFile = await wireGetObject<WireSpriteFile>(SpriteFile.getSpriteUrl(id));
    if (!wireFile) {
      throw new Error('cannot find sprite');
    }

    let file = new SpriteFile(id, wireFile);

    return file;
  }

  public get code(): string {
    return this._code;
  }
  public set code(val: string) {
    this._code = val;
    this.saveBackground();
  }

  public saveBackground(): void {
    wireSetObjectBackground<WireSpriteFile>(SpriteFile.getSpriteUrl(this.id), {
      id: this.id,
      name: this.name,
      code: this._code,
      skins: []
    });
  }

  public async addSkin(skinName: string | undefined, url: string): Promise<void> {
    skinName = skinName ?? defaultSkin;
    this._skins.set(skinName, url);
    this.saveBackground();
  }

  public async removeSkin(skinName: string): Promise<void> {
    throw new Error('Not implemented');
  }

  public async createSprite(bodyKind: RigitBodyKind, skinName: string | undefined, scale?: number): Promise<Sprite3> {

    skinName = skinName ?? defaultSkin;
    let skinUrl: string | undefined = undefined;

    if (!skinUrl) {
      throw new Error('Cannot load skin ' + skinName);
    }

    let rigit: IRigitModel;

    if (bodyKind === RigitBodyKind.object) {
      rigit = new CubeModel(scale ?? 1.0);
    } else {
      rigit = new CubeModel(scale ?? 1.0);
    }
    await rigit!.load(skinUrl);

    let sprite = vm.createSprite(this.name, rigit, bodyKind);

    return sprite;
  }
}

/**
 * each sprite is a directory with multiple keys
 */
export class SpriteFileCollection {
  private spritesById = new Map<number, SpriteFile>();
  private spritesByName = new Map<string, SpriteFile>();

  public async load(): Promise<void> {
    //this._levelFile = new VoxelLevelFile('levels/' + id);
    //await this._levelFile.load(false);
    let wireSprites = await wireGetObjects<WireSpriteFile>({ pattern: 'sprites/*' });
    if (wireSprites) {
      for (let wireSprite of wireSprites) {
        let file = new SpriteFile(wireSprite.data.id, wireSprite.data);
        this.spritesById.set(wireSprite.data.id, file);
        this.spritesByName.set(file.name, file);
      }
    } else {
      await createDefaultSprites();
    }
  }

  public findByName(name: string): SpriteFile | undefined {
    return this.spritesByName.get(name);
  }

  public async createSprite(name: string): Promise<SpriteFile> {
    let id = await wireIncrement('spriteid', 1);
    if (!id) {
      throw new Error('Failed to create sprite');
    }
    let sf = new SpriteFile(id);
    await sf.saveBackground();
    this.spritesById.set(id, sf);
    this.spritesByName.set(name, sf);
    return sf;
  }
}

export let spriteFiles = new SpriteFileCollection();