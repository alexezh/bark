import { terminal } from "../ui/igameterminal";
import { AstNode } from "./ast";
import { ParamDef, paramTypeFromString } from "./funcdef";
import { greenText, resetColor } from "./termcolors";

export type PoshFunction = {
  params: ParamDef[],
  help: string | undefined,
  (args: any): void,
}
let funcs: Map<string, PoshFunction> = new Map<string, PoshFunction>();

// the last argument is actual function
export function registerFunction(name: string, args: string[], func: (args: any) => void, help: string | undefined = undefined) {
  let params: ParamDef[] = [];
  for (let i = 0; i < args.length; i++) {
    let paramDesc = args[i];
    if (!(typeof paramDesc === 'string')) {
      throw Error(incorrectArgError(paramDesc));
    }

    let parts = paramDesc.split(':');
    if (parts.length !== 2) {
      throw Error(incorrectArgError(paramDesc));
    }

    let t = paramTypeFromString(parts[1]);
    params.push({
      name: parts[0],
      t: t,
      optional: true,
      default: undefined
    });
  }

  let pfunc = func as PoshFunction;
  pfunc.params = params;
  pfunc.help = help;

  //pfunc.params = params;
  funcs.set(name, pfunc);
}

export function getFunction(name: string): PoshFunction | undefined {
  return funcs.get(name);
}

// ATT: not sure that I need AST apart from saving things
export function evalFunction(ast: AstNode): string | undefined {
  let func = funcs.get(ast.name);
  if (func === undefined) {
    terminal?.print('Cannot find function ' + ast.name);
    return undefined;
  }

  let args: { [id: string]: any } = {};
  for (let i = 0; i < ast.children.length; i++) {
    let astParam = ast.children[i];
    args[astParam.name] = astParam.value;
  }

  func(args);

  return undefined;
}

export function printHelp(func: PoshFunction) {
  if (func.help === undefined) {
    return;
  }

  terminal?.print(func.help + makeUsageString(func.name, func.params));
}

function makeUsageString(name: string, params: ParamDef[]): string {
  let o = `Use ${greenText}${name} `;
  for (let i = 0; i < params!.length; i++) {
    if (i != 0) {
      o += ' ';
    }
    let param = params![i];
    if (param.optional) {
      o += `<${param.name}>`;
    } else {
      o += param.name;
    }
  }
  o += `${resetColor}`;
  return o;
}

function incorrectArgError(param: any): string {
  return `Invalid argument ${param}. Use name:type format`;
}

export function printEditModeError() {
  terminal?.printError('Functionality only available in edit mode');
}

export function printNoRegion() {
  terminal?.printError('Region is not selected');
}