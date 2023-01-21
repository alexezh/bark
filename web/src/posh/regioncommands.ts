import { storeFile } from "../fetchadapter";
import { gameState } from "../world/igamestate";
import { TileLayer } from "../world/tilelayer";
import { ParamType, ParamDef, combineParams } from "./funcdef";
import { CoordinateParams, coordinateParamsToRect, createCoordinateParams, GenericEditorFuncDef } from "./genericeditorfuncdef";
import { mapEditorState, MapEditorState } from "./mapeditorstate";
import { GridRect } from "./pos";
import { printEditModeError, printNoRegion, registerFunction } from "./poshregistry";
import { Repl } from "./repl";

export type FillRegionParams = CoordinateParams & {
  tile: number | undefined;
}

export class FillRegionDef extends GenericEditorFuncDef {
  public static funcName: string = 'fillRegion';
  private repl: Repl;

  public constructor(mapEditorState: MapEditorState, repl: Repl) {
    super(FillRegionDef.funcName, mapEditorState);
    this.repl = repl;
  }

  public createParamDefs(): ParamDef[] {
    return combineParams([
      { name: 'tile', t: ParamType._int, optional: false },
    ], createCoordinateParams(this))
  }

  public help(): string {
    return 'fill region with tile.' + this.helpUsage();
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as FillRegionParams;
    //if (ast.children[0].name == 'tileId') {

    let layer = this.mapEditorState.currentTileLayer;
    if (layer === undefined) {
      return;
    }

    if (paramsT.tile === undefined) {
      return 'tile is not set';
    }

    layer.startEdit();
    layer.fillRegion({ x: paramsT.x, y: paramsT.y, w: paramsT.w, h: paramsT.h }, paramsT.tile);
    layer.endEdit();

    this.mapEditorState.invalidateCamera();

    return undefined;
  }
  /*
    public setTile(tileId: number, x: number, y: number) {
      let tileLayer: TileLayer;
      let tile = resourceLib.getTileById(tileId);
  
      if (tile !== undefined) {
        if (tile.layer === undefined) {
          tileLayer = this.layerMap['ground'] as TileLayer;
        } else {
          tileLayer = this.layerMap[tile.layer] as TileLayer;
        }
  
        tileLayer.setTile(x, y, tile.id);
      }
    }
  
    public copyBlock(block: TileBlock, x: number, y: number) {
      this.startEdit();
      let idx = 0;
      for (let i = 0; i < block.h; i++) {
        for (let j = 0; j < block.w; j++) {
          this.setTile(block.tiles[idx], x + j, y + i);
          idx++;
        }
      }
      this.endEdit();
    }
  */
}

export class CutRegionDef extends GenericEditorFuncDef {
  public static funcName: string = 'cutRegion';

  public constructor(mapEditorState: MapEditorState) {
    super(CutRegionDef.funcName, mapEditorState);
  }

  public createParamDefs(): ParamDef[] {
    return createCoordinateParams(this);
  }

  public help(): string {
    return 'clear region.' + this.helpUsage();
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as CoordinateParams;
    let layer = this.mapEditorState.currentTileLayer;
    if (layer === undefined) {
      return this.help();
    }

    layer.startEdit();
    let tileBuffer = layer.getRegion(coordinateParamsToRect(paramsT));
    this.mapEditorState.update({ tileClipboard: tileBuffer });
    layer.clearRegion(coordinateParamsToRect(paramsT));
    layer.endEdit();

    this.mapEditorState.invalidateCamera();
    return undefined;
  }
}

export class CopyRegionDef extends GenericEditorFuncDef {
  public static funcName: string = 'copyRegion';

  public constructor(mapEditorState: MapEditorState) {
    super(CopyRegionDef.funcName, mapEditorState);
  }

  public createParamDefs(): ParamDef[] {
    return createCoordinateParams(this);
  }

  public help(): string {
    return 'clear region.' + this.helpUsage();
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as CoordinateParams;
    let layer = this.mapEditorState.currentTileLayer;
    if (layer === undefined) {
      return this.help();
    }

    let tileBuffer = layer.getRegion(coordinateParamsToRect(paramsT));
    this.mapEditorState.update({ tileClipboard: tileBuffer });
    this.mapEditorState.invalidateCamera();

    return undefined;
  }
}

export class PasteRegionDef extends GenericEditorFuncDef {
  public static funcName: string = 'pasteRegion';
  private repl: Repl;

  public constructor(mapEditorState: MapEditorState, repl: Repl) {
    super(PasteRegionDef.funcName, mapEditorState);
    this.repl = repl;
  }

  public createParamDefs(): ParamDef[] {
    return createCoordinateParams(this);
  }

  public help(): string {
    return 'paste clipboard buffer.' + this.helpUsage();
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as CoordinateParams;

    let layer = this.mapEditorState.currentTileLayer;
    if (layer === undefined || this.mapEditorState.tileClipboard === undefined) {
      return this.help();
    }

    let s: string | undefined = undefined;
    let pasteCoord = coordinateParamsToRect(paramsT);
    let pasteBuffer = this.mapEditorState.tileClipboard;

    if (this.mapEditorState.tileClipboard.tiles.length <= 32 * 32) {
      let current = layer.getRegion({ x: pasteCoord.x, y: pasteCoord.y, w: pasteBuffer.w, h: pasteBuffer.h });
      let o = {
        w: pasteBuffer.w,
        h: pasteBuffer.h,
        current: current.tiles,
        replace: pasteBuffer.tiles
      }

      s = JSON.stringify(o);
    }

    setTimeout(async () => {
      layer!.startEdit();
      await layer!.updateRegion(pasteCoord, pasteBuffer);
      layer!.endEdit();
    });

    // save result of paste
    this.repl.setVar('$', s);

    this.mapEditorState.invalidateCamera();

    return undefined;
  }
}

export class SelectRegionDef extends GenericEditorFuncDef {
  private static funcName: string = 'selectRegion';

  public constructor(mapEditorState: MapEditorState) {
    super(SelectRegionDef.funcName, mapEditorState);
  }

  public createParamDefs(): ParamDef[] {
    return createCoordinateParams(this);
  }

  public help(): string {
    return 'selects region on a map.' + this.helpUsage();
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as CoordinateParams;

    this.mapEditorState.update({ region: coordinateParamsToRect(paramsT) });

    return undefined;
  }
}


export class GetRegionInfoDef extends GenericEditorFuncDef {
  public constructor(mapEditorState: MapEditorState) {
    super('getRegionInfo', mapEditorState);
  }

  public createParamDefs(): ParamDef[] {
    return createCoordinateParams(this);
  }

  public help(): string {
    return 'get information of the region at position.' + this.helpUsage();
  }

  protected evalCore(params: any): string | undefined {
    return undefined;
  }
}

export function saveRegion(args: { name: string }) {
  withRegionAsync(async (layer: TileLayer, region: GridRect) => {
    let tileBuffer = layer.getRegion(region);
    await storeFile('regions/' + name, JSON.stringify(tileBuffer));
    return true;
  });
}

export function loadRegion(args: { name: string }) {
  withRegionAsync(async (layer: TileLayer, region: GridRect) => {
    let tileBuffer = layer.getRegion(region);
    await storeFile('regions/' + name, JSON.stringify(tileBuffer));
    return true;
  });
}

export function registerRegionCommands() {
  registerFunction('saveRegion', ['name:string'], saveRegion);
}

export function withRegionAsync(func: (layer: TileLayer, region: GridRect) => Promise<boolean>): boolean {
  let layer = mapEditorState.currentTileLayer;
  if (layer === undefined) {
    printEditModeError();
    return false;
  }
  let region = mapEditorState.region;
  if (region === undefined) {
    printNoRegion();
    return false;
  }

  setTimeout(async () => {
    await func(layer!, region!);
  });

  return true;
}

export function withRegion(func: (layer: TileLayer, region: GridRect) => void): boolean {
  let layer = mapEditorState.currentTileLayer;
  if (layer === undefined) {
    printEditModeError();
    return false;
  }
  let region = mapEditorState.region;
  if (region === undefined) {
    printNoRegion();
    return false;
  }

  func(layer!, region!);

  return true;
}