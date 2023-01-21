import { AstNode, AstNodeKind, intParam, PtCall, stringParam } from "./ast";
import { getFunction } from "./poshregistry";
import { greenText, resetColor } from "./termcolors";

export enum FuncCategory {
  edit,
  ui,
  help
}

export enum ParamType {
  _int,
  _real,
  _string,
  _boolean
}

export function paramTypeFromString(s: string) {
  switch (s) {
    case 'string': return ParamType._string;
    case 'int': return ParamType._int;
    case 'boolean': return ParamType._boolean;
    case 'real': return ParamType._real;
    default: throw Error(`incorrect type ${s}`);
  }
}

export type ParamDef = {
  name: string;
  t: ParamType;
  optional: boolean;
  default?: any;
}

export class FuncDef {
  public readonly name: string;
  public readonly category: FuncCategory;

  public constructor(name: string, category: FuncCategory) {
    this.name = name;
    this.category = category;
  }

  public getParamDefs(): ParamDef[] {
    return [];
  }

  public help(): string { return ""; }

  public eval(ast: AstNode): string | undefined {
    return undefined;
  }

  // parse string representation into node.
  // returns undefined if input does not have all info
  // returns error string if input is incorrect
  // once we have grammar, this will go away
  public parse(parts: string[]): AstNode | string | undefined {
    return undefined;
  }

  public createAst<T>(x: T): AstNode {
    throw 'not implemented';
  }
}

export class GenericFuncDef extends FuncDef {
  private params: ParamDef[] | undefined;

  public constructor(name: string, category: FuncCategory) {
    super(name, category);
  }

  // we cannot pass this to constructor, but some of our methods require it
  public getParamDefs(): ParamDef[] {
    if (this.params !== undefined) {
      return this.params;
    }

    this.params = this.createParamDefs();
    return this.params;
  }

  protected createParamDefs(): ParamDef[] {
    return [];
  }

  public help(): string { return this.helpUsage(); }

  public helpUsage(): string {
    let params = this.getParamDefs();
    let o = `Use ${greenText}${this.name} `;
    for (let i = 0; i < this.params!.length; i++) {
      if (i != 0) {
        o += ' ';
      }
      let param = this.params![i];
      if (param.optional) {
        o += `<${param.name}>`;
      } else {
        o += param.name;
      }
    }
    o += `${resetColor}`;
    return o;
  }

  // make a type out of parameters and pass it to execution
  public eval(ast: AstNode): string | undefined {
    let params: { [id: string]: any } = {};
    for (let i = 0; i < ast.children.length; i++) {
      let astParam = ast.children[i];
      params[astParam.name] = astParam.value;
    }
    return this.evalCore(params);
  }

  protected evalCore(params: any): string | undefined {
    return undefined;
  }

  public createAst<T>(x: T): AstNode {
    let params = this.getParamDefs();
    let ast = new AstNode(AstNodeKind.Func, this.name, undefined);
    for (let i = 0; i < this.params!.length; i++) {
      let param = this.params![i];
      // @ts-ignore
      let val = x[param.name];
      if (val === undefined) {
        val = param.default();
      }

      let childAst = new AstNode(AstNodeKind.Param, param.name, val);
      ast.children.push(childAst);
    }

    return ast;
  }

  private makeParam(param: ParamDef, val: string): AstNode {
    if (param.t === ParamType._int) {
      return intParam(param.name, val);
    } else {
      return stringParam(param.name, val);
    }
  }
}


export function combineParams(a: ParamDef[], b: ParamDef[]) {
  return a.concat(b);
}

export function buildFuncAst(ptCall: PtCall): AstNode {
  // @ts-ignore
  let ast = new AstNode(AstNodeKind.Func, ptCall.func.name, undefined);

  let poshFunc = getFunction(ast.name);
  if (poshFunc === undefined) {
    throw Error('Unknown command ' + ast.name);
  }

  let paramsDef = poshFunc.params;
  let idx = 0;
  for (; idx < ptCall.params.length; idx++) {
    let ptParam = ptCall.params[idx] as any;

    let paramDef = paramsDef[idx];

    if (ptParam.type == 'Literal') {
      let astParam = new AstNode(AstNodeKind.Param, paramDef.name, ptParam.value)
      ast.children.push(astParam);
    } else if (ptParam.type == 'Identifier') {
      // for now we keep things as parameters
      // later we can differentiate between variables and other thigns
      let astParam = new AstNode(AstNodeKind.Param, paramDef.name, ptParam.name)
      ast.children.push(astParam);
    } else {
      throw 'unknow type';
    }
  }

  if (idx < paramsDef.length) {
    for (; idx < paramsDef.length; idx++) {
      let param = paramsDef[idx];
      let value: any;
      if (param.default !== undefined) {
        if (typeof param.default === 'function') {
          value = param.default();
        } else {
          value = param.default;
        }
      }
      let paramAst = new AstNode(AstNodeKind.Param, param.name, value);
      ast.children.push(paramAst);
    }
  }

  return ast;
}