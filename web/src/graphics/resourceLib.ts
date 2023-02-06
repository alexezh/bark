import { fetchSpriteSheets, fetchText, storeFile, fetchFiles } from "../fetchadapter";
import { SpriteSheet } from "./spritesheet";
import { Sprite as PixiSprite } from 'pixijs';

import * as peggy from "peggy";
// @ts-ignore
import grammarUri from '../posh.peggjs';
import { GridRect, PxPos } from "../posh/pos";
import { SpriteSheetProps } from "./imageatlas";
import { Pokedex } from "./pokedex";


export class ResourceLibrary {
  private _grammar?: string;
  private _parser?: object;
  private spriteSheets: Map<string, SpriteSheet> = new Map<string, SpriteSheet>;

  // map of tiles which is composition of base and addon
  private code: Map<string, string> = new Map<string, string>();

  public get grammar(): string | undefined { return this._grammar; }
  public get parser(): object | undefined { return this._parser; }
  public readonly pokedex: Pokedex = new Pokedex();

  async load(worldId: string) {
    try {

      await this.loadTileCode();
      await this.pokedex.loadPokedex();
      await this.loadSpriteSheets();

      //const prefix = 'data:text/plain;base64,';
      //let g = grammar;
      //if (!g.startsWith(prefix)) {
      //  throw 'incorrect grammar file';
      //}
      this._grammar = await fetchText(grammarUri);
      this._parser = peggy.generate(resourceLib.grammar!);
    }
    catch (e) {
      console.log('ResourceLib: failed to load')
      throw (e);
    }
  }

  private async loadTileCode() {
    let files = await fetchFiles('tile/code/*');
    for (let p of files) {
      this.code.set(p.name, p.data);
    }
  }

  private async loadSpriteSheets() {
    let atlasPropColl = await fetchSpriteSheets();
    for (let i = 0; i < atlasPropColl.length; i++) {
      let sheetProps = atlasPropColl[i];
      let sheet = await SpriteSheet.load(sheetProps);
      this.addSpriteSheet(sheet);
    }
  }

  public addSpriteSheet(spriteSheet: SpriteSheet) {
    this.spriteSheets.set(spriteSheet.id, spriteSheet);
  }

  public getSpriteSheetById(id: string): SpriteSheet {
    let sheet = this.spriteSheets.get(id);
    if (sheet === undefined) {
      throw "cannot find atlas";
    }
    return sheet;
  }

  public async loadSpriteSheet(props: SpriteSheetProps): Promise<SpriteSheet> {
    let currentSheet = this.spriteSheets.get(props.url);
    if (currentSheet !== undefined) {
      return currentSheet;
    }

    let sheet = await SpriteSheet.load(props);
    this.addSpriteSheet(sheet);
    return sheet;
  }

  public forEachSpriteSheet(func: (x: SpriteSheet) => void) {
    this.spriteSheets.forEach((atlas) => func(atlas));
  }

}

export var resourceLib = new ResourceLibrary();
