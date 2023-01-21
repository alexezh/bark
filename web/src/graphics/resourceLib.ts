import { fetchSpriteSheets, fetchText, fetchTiles, updateTile, addCompositeTile, storeFile, fetchFiles } from "../fetchadapter";
import { getComposedTileId, TileDef, WireTileDefProps } from "../world/tiledef";
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

  private tiles: Map<number, TileDef> = new Map<number, TileDef>();
  // map of tiles which is composition of base and addon
  private composedTiles: Map<string, TileDef> = new Map<string, TileDef>();
  private code: Map<string, string> = new Map<string, string>();

  public get grammar(): string | undefined { return this._grammar; }
  public get parser(): object | undefined { return this._parser; }
  public readonly pokedex: Pokedex = new Pokedex();

  async load(worldId: string) {
    try {

      await this.loadTileCode();
      await this.pokedex.loadPokedex();
      await this.loadSpriteSheets();
      await this.loadTiles();

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

  private async loadTiles() {
    let tileColl = await fetchTiles();
    tileColl.tiles.forEach(tileProps => {

      let baseTile = this.getTileById2(tileProps.baseTile);
      let addOnTile = this.getTileById2(tileProps.addOnTile);

      // we might not have a sheet if tile is composed
      let sheet: SpriteSheet | undefined = (tileProps.atlasId !== undefined) ? this.spriteSheets.get(tileProps.atlasId) : undefined;
      let tileDef = new TileDef(tileProps, sheet, baseTile, addOnTile);

      // make sure that x/y is set if atlas is set
      // network layer might skip 0 which is valid for composite tiles
      if (tileProps.atlasId !== undefined) {
        if (tileProps.idx === undefined) {
          tileProps.idx = 0;
        }
      }

      this.tiles.set(tileProps.id, tileDef);
      if (tileProps.baseTile !== undefined || tileProps.addOnTile !== undefined) {
        this.composedTiles.set(getComposedTileId(tileProps.baseTile, tileProps.addOnTile), tileDef);
      }
    });
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

  public createTileSprite(tile: TileDef | undefined, pos: PxPos): PixiSprite | undefined {
    if (tile === undefined || tile.sheet === undefined) {
      return undefined;
    }

    return tile.sheet.createSprite(tile.props.idx!, pos);
  }

  public getTileById(n: number): TileDef | undefined {
    return this.tiles.get(n);
  }

  public getTileById2(n: number | undefined): TileDef | undefined {
    if (n === undefined) {
      return undefined;
    }
    return this.tiles.get(n);
  }

  public deleteTile(tile: number) {
    throw new Error("Method not implemented.");
  }

  public findTile(pred: (tile: TileDef) => boolean): TileDef | undefined {
    for (let tile of this.tiles.values()) {
      if (pred(tile!)) {
        return tile;
      }
    }

    return undefined;
  }

  public *findTiles(pred: (tile: TileDef) => boolean): IterableIterator<TileDef> {
    for (let tile of this.tiles.values()) {
      if (pred(tile!)) {
        yield tile;
      }
    }
  }

  public updateTile(tile: TileDef) {
    updateTile(tile.props);
  }

  public async findOrAddTile(currentTile: TileDef, addOnTile: TileDef): Promise<TileDef> {
    // custom is never copied; just return
    //if (currentTile.props.categories[TileCategory_custom]) {
    //  currentTile.props.addOnTile = addOnTile.props.id;
    //  return currentTile.props.id;
    //}
    let composedTileId = getComposedTileId(currentTile.props.id, addOnTile.props.id);
    let composedTile = this.composedTiles.get(composedTileId);
    if (composedTile !== undefined) {
      return composedTile;
    }

    let tileProps: WireTileDefProps = {
      id: 0,
      categories: {},
      baseTile: currentTile.props.id,
      addOnTile: addOnTile.props.id
    }
    composedTile = new TileDef(tileProps, undefined, currentTile, addOnTile);

    // save tile on the server
    let response = await addCompositeTile(composedTile.props);

    console.log('created tile ' + response.tileId);
    composedTile.props.id = response.tileId;

    this.tiles.set(composedTile.props.id, composedTile);
    this.composedTiles.set(composedTileId, composedTile);

    // current tile is not custom; create a copy
    // there is a standard problem with sync between different users
    // later we are going to solve this by having protocol which confirms IDs
    // and replaces conflicts
    // return 0;
    return composedTile;
  }
}

export var resourceLib = new ResourceLibrary();
