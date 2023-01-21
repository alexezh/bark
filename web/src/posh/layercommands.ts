import { AstNode, AstNodeKind, stringParam } from "./ast";
import { ParamDef, ParamType } from "./funcdef";
import { GenericEditorFuncDef } from "./genericeditorfuncdef";
import { MapEditorState } from "./mapeditorstate";
import { greenText, resetColor } from "./termcolors";

export type LayerParams = {
  layer: string | undefined;
}

export class SelectLayerDef extends GenericEditorFuncDef {
  public constructor(mapEditorState: MapEditorState) {
    super('selectLayer', mapEditorState);
  }

  public createParamDefs(): ParamDef[] {
    return [{ name: 'layer', t: ParamType._string, optional: false }]
  }

  public help(): string {
    return 'select layer to edit.' + this.helpUsage();
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as LayerParams;
    this.mapEditorState.selectLayer(paramsT.layer!);
    return undefined;
  }
}

export class ShowLayerCoreDef extends GenericEditorFuncDef {
  private show: boolean;
  public constructor(name: string, show: boolean, mapEditorState: MapEditorState) {
    super(name, mapEditorState);
    this.show = show;
  }

  public createParamDefs(): ParamDef[] {
    return [{ name: 'layer', t: ParamType._string, optional: false, default: () => undefined }]
  }

  public help(): string {
    return 'show layer(s).' + this.helpUsage();
  }

  protected evalCore(params: any): string | undefined {
    let paramsT = params as LayerParams;

    // if no parameter, display visible
    if (paramsT.layer === undefined) {
      let s: string = 'visible:';
      this.mapEditorState.world?.forEachLayer(undefined, (x) => {
        if (x.visible) {
          s += x.id + ' ';
        }
      });

      return s;
    } else {
      this.mapEditorState.showLayer(paramsT.layer, this.show);
      return undefined;
    }
  }
}

export class ShowLayerDef extends ShowLayerCoreDef {
  public constructor(mapEditorState: MapEditorState) {
    super('showLayer', true, mapEditorState);
  }

  public help(): string {
    return `show layer(s).Use ${greenText}${this.name} <layer>${resetColor} `;
  }
}

export class HideLayerDef extends ShowLayerCoreDef {
  public constructor(mapEditorState: MapEditorState) {
    super('hideLayer', false, mapEditorState);
  }

  public help(): string {
    return `hide layer(s).Use ${greenText}${this.name} <layer>[<layer>]${resetColor} `;
  }
}
