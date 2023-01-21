import { ParamDef, ParamType } from "./funcdef";
import { GenericEditorFuncDef } from "./genericeditorfuncdef";
import { MapEditorState } from "./mapeditorstate";

export class BindKeyDef extends GenericEditorFuncDef {
  public static funcName: string = 'bindKey';

  public constructor(mapEditorState: MapEditorState) {
    super(BindKeyDef.funcName, mapEditorState);
  }

  public createParamDefs(): ParamDef[] {
    return [
      { name: 'key', t: ParamType._string, optional: false },
      { name: 'script', t: ParamType._string, optional: false }];
  }

  public help(): string {
    return 'set key bindings.' + this.helpUsage();
  }

  protected evalCore(params: any): string | undefined {
    // this.mapEditorState.invalidateCamera();
    return undefined;
  }
}

export class ShowKeyBindingsDef extends GenericEditorFuncDef {
  public static funcName: string = 'showKeyBindings';
  private keyBindings: { [id: string]: string } = {};

  public constructor(mapEditorState: MapEditorState) {
    super(ShowKeyBindingsDef.funcName, mapEditorState);
  }

  public createParamDefs(): ParamDef[] {
    return [];
  }

  public help(): string {
    return 'Display key bindings.' + this.helpUsage();
  }

  public addKeyBinding(key: string, desc: string) {
    this.keyBindings[key] = desc;
  }

  public descriptKeyBindings(): string {
    let s = '';
    let sep = false;
    for (let key in this.keyBindings) {
      if (sep) {
        s += '\r\n';
      }
      s += `<${key}> : ${this.keyBindings[key]}`;
      sep = true;
    }
    return s;
  }

  protected evalCore(params: any): string | undefined {
    return this.descriptKeyBindings();
  }
}
