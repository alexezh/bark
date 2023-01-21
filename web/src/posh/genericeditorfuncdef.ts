import { FuncCategory, GenericFuncDef, ParamDef, ParamType } from "./funcdef";
import { MapEditorState } from "./mapeditorstate";

export class GenericEditorFuncDef extends GenericFuncDef {
  public mapEditorState: MapEditorState;

  public constructor(name: string, mapEditorState: MapEditorState) {
    super(name, FuncCategory.edit);
    this.mapEditorState = mapEditorState;
  }
}

export function createCoordinateParams(funcDef: GenericEditorFuncDef): ParamDef[] {
  return [
    { name: 'x', t: ParamType._int, optional: true, default: () => { return funcDef.mapEditorState.region?.x; } },
    { name: 'y', t: ParamType._int, optional: true, default: () => { return funcDef.mapEditorState.region?.y; } },
    { name: 'w', t: ParamType._int, optional: true, default: () => { return funcDef.mapEditorState.region?.w; } },
    { name: 'h', t: ParamType._int, optional: true, default: () => { return funcDef.mapEditorState.region?.h; } },
  ];
}

export type CoordinateParams = {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function coordinateParamsToRect(params: CoordinateParams) {
  return { x: params.x, y: params.y, w: params.w, h: params.h };
}