import { Repl } from "./repl";
import { FuncCategory, GenericFuncDef, ParamDef, ParamType } from "./funcdef";
import { showKeyBindingsDef } from "./mapeditcommands";

export class HelpDef extends GenericFuncDef {
  private repl: Repl;
  public constructor(repl: Repl) {
    super('help', FuncCategory.help);
    this.repl = repl;
  }

  public help(): string {
    let s = '';

    s += 'Keyboard shortcuts:\r\n';
    s += showKeyBindingsDef?.descriptKeyBindings();

    s += '\r\nAll commands\r\n';
    s += this.repl.help(undefined);

    return s;
  }

  public createParamDefs(): ParamDef[] {
    return [
      { name: 'command', t: ParamType._string, optional: false, default: undefined },
    ]
  }

  protected evalCore(params: any): string | undefined {
    if (params.command === undefined) {
      return this.help();
    } else {
      let funcDef = this.repl.getFunc(params.command as string);
      return funcDef.help();
    }
  }
}