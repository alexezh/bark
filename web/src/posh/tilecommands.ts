import { addTileSet as addTileSetNet } from "../fetchadapter";
import { resourceLib } from "../graphics/resourceLib";
import { terminal } from "../ui/igameterminal";
import { describeTileCategories } from "../world/tiledef";
import { combineParams, ParamDef, ParamType } from "./funcdef";
import { CoordinateParams, createCoordinateParams, GenericEditorFuncDef } from "./genericeditorfuncdef";
import { MapEditorState } from "./mapeditorstate";
import { PoshFunction, printHelp, registerFunction } from "./poshregistry";
import { Repl } from "./repl";
//import cityNamesJapUrl from '../mapgen/libraries/cityNamesJap.json';

export type AddTileCategoryParams = CoordinateParams & {
  category: string;
}

export class AddTileCategoryDef extends GenericEditorFuncDef {
  private static funcName: string = 'addTileCategory';

  public constructor(mapEditorState: MapEditorState) {
    super(AddTileCategoryDef.funcName, mapEditorState);
  }

  public help(): string {
    let s = 'Add category to tiles in a region.' + this.helpUsage() + '\r\n';
    s = s + 'Categories are: ' + describeTileCategories();
    return s;
  }

  public createParamDefs(): ParamDef[] {
    return combineParams([
      { name: 'category', t: ParamType._string, optional: false },
    ], createCoordinateParams(this))
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as AddTileCategoryParams;

    if (paramsT.x === undefined || paramsT.y === undefined) {
      return 'Error: region is not selected';
    }

    if (paramsT.w === 1 && paramsT.h === 1) {
      this.mapEditorState.currentTileLayer?.forEachTile(
        { x: paramsT.x, y: paramsT.y, w: paramsT.w, h: paramsT.h },
        (id) => this.addCategory(id, paramsT.category));
    } else {
      let seen = new Map<number, boolean>();

      this.mapEditorState.currentTileLayer?.forEachTile(
        { x: paramsT.x, y: paramsT.y, w: paramsT.w, h: paramsT.h },
        (id) => {
          if (seen.get(id)) {
            return;
          }

          this.addCategory(id, paramsT.category)
          seen.set(id, true);
        });
    }

    // issue empty update to UI components can refresh
    this.mapEditorState.update({});

    return undefined;
  }

  private addCategory(id: number, category: string | undefined) {
    let tileDef = resourceLib.getTileById(id);
    if (tileDef === undefined) {
      return;
    }

    if (tileDef.props.categories === undefined) {
      tileDef.props.categories = {};
    }

    if (category === undefined) {
      return;
    }

    tileDef.props.categories[category] = true;
    resourceLib.updateTile(tileDef);
  }

  //static createAst(rect: GridRect): AstNode {
  //  return RegionFuncDef.createAstFromRect(AddTileCategoryDef.funcName, rect);
  //}
}

export class RemoveTileCategoryDef extends GenericEditorFuncDef {
  private static funcName: string = 'removeTileCategory';

  public constructor(mapEditorState: MapEditorState) {
    super(RemoveTileCategoryDef.funcName, mapEditorState);
  }

  public help(): string {
    let s = 'Remove category to tiles in a region.' + this.helpUsage() + '\r\n';
    s = s + 'Categories are: ' + describeTileCategories();
    return s;
  }

  public createParamDefs(): ParamDef[] {
    return combineParams([
      { name: 'category', t: ParamType._string, optional: false },
    ], createCoordinateParams(this))
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as AddTileCategoryParams;

    if (paramsT.x === undefined || paramsT.y === undefined) {
      return 'Error: region is not selected';
    }

    if (paramsT.w === 1 && paramsT.h === 1) {
      this.mapEditorState.currentTileLayer?.forEachTile(
        { x: paramsT.x, y: paramsT.y, w: paramsT.w, h: paramsT.h },
        (id) => this.removeCategory(id, paramsT.category));
    } else {
      let seen = new Map<number, boolean>();

      this.mapEditorState.currentTileLayer?.forEachTile(
        { x: paramsT.x, y: paramsT.y, w: paramsT.w, h: paramsT.h },
        (id) => {
          if (seen.get(id)) {
            return;
          }

          this.removeCategory(id, paramsT.category)
          seen.set(id, true);
        });
    }

    // issue empty update to UI components can refresh
    this.mapEditorState.update({});

    return undefined;
  }

  private removeCategory(id: number, category: string | undefined) {
    let tileDef = resourceLib.getTileById(id);
    if (tileDef === undefined) {
      return;
    }

    if (tileDef.props.categories === undefined) {
      tileDef.props.categories = {};
    }

    if (category === undefined) {
      return;
    }

    delete tileDef.props.categories[category];
    resourceLib.updateTile(tileDef);
  }
}

export type DeleteTileParams = {
  tile: number;
}

export class DeleteTileDef extends GenericEditorFuncDef {
  private static funcName: string = 'deleteTile';

  public constructor(mapEditorState: MapEditorState) {
    super(DeleteTileDef.funcName, mapEditorState);
  }

  public help(): string {
    let s = 'Delete composite tile.' + this.helpUsage() + '\r\n';
    return s;
  }

  public createParamDefs(): ParamDef[] {
    return [
      { name: 'tile', t: ParamType._int, optional: false },
    ];
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as DeleteTileParams;

    if (paramsT.tile === undefined) {
      return 'Error: region is not selected';
    }

    resourceLib.deleteTile(paramsT.tile);
  }
}

export type AddTileSetParams = {
  id: string;
  url: string;
  w: number;
  h: number;
}

export function addTileSet(args: { id: string, url: string, w: number, h: number }) {

  if (args.id === undefined || args.url === undefined) {
    printHelp(addTileSet as PoshFunction);
    return;
  }

  setTimeout(() => {
    let image = new Image();

    image.addEventListener('load', function () { onImageLoaded(image, args) });
    image.addEventListener('error', function () { onImageError(args.url) });
    let s = window.location.origin + args.url;
    image.src = window.location.origin + args.url;
  });

  return undefined;
}

function onImageError(url: string) {
  console.log("Cannot load image");
  terminal?.printError('Cannot load image : ' + url);
}

async function onImageLoaded(image: any, params: AddTileSetParams) {
  console.log("image loaded");
  let width: number = image.width;
  let height: number = image.height;
  terminal?.printError(`Image ${width} ${height}`);

  let cellWidth = params.w ?? 32;
  let cellHeight = params.h ?? 32;

  await addTileSetNet({
    id: params.id,
    url: params.url,
    gridWidth: Math.floor(width / cellWidth),
    gridHeight: Math.floor(height / cellHeight),
    cellWidth: cellWidth,
    cellHeight: cellHeight,
    startTileId: 0
  });
}

export function listTileSet(args: { id: string }) {
  let s = '';
  let sep = false;
  resourceLib.forEachSpriteSheet((x) => {
    if (sep) s += ' ';
    s += x.id;
    sep = true;
  });

  terminal?.print(s);
}

export function selectTileSet(args: { id: string }) {
  let atlas = resourceLib.getSpriteSheetById(args.id);
  if (atlas === undefined) {
    terminal?.printError('Unknown tileset ' + args.id);
    return;
  }

  // this.mapEditorState.update({ tileSet: atlas });

  return undefined;
}

export function registerTileCommands() {
  registerFunction('addTileSet', ['id:string', 'url:string', 'w:int', 'h:int'], addTileSet, 'Add tileset.');
  registerFunction('listTileSet', [], listTileSet, 'List all tilesets.');
  registerFunction('selectTileSet', ['id:string'], selectTileSet, 'Select tileset.');
}
