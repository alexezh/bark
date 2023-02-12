import { AstNode, AstNodeKind, formatAst, PtCall, PtObj, PtSequence } from "./ast";
import AsyncEventSource from "../AsyncEventSource";
import { buildFuncAst, FuncDef } from "./funcdef";
import { evalFunction } from "./poshregistry";

/*
export type FuncDefs = {
  name: string;
  help: string;
  category: string;
  func: (ctx: ReplContext, args: AstNode[]) => string | undefined;
}
*/

export interface IRepl {
  getFunc(s: string): FuncDef;
  evalFunc<T>(name: string, x: T): string | undefined;
  onPrint: ((s: string) => void) | undefined;
  evalAst(ast: AstNode, noEcho?: boolean): void;
  getVar(name: string): any | undefined;
  setVar(name: string, value: any | undefined): void;
  onVarChanged(target: any, func: (evt: VarChangedEvent) => void): void;
}

export type VarChangedEvent = {

}

export class Repl implements IRepl {

  private readonly funcDefs: Map<string, FuncDef> = new Map<string, FuncDef>();
  public readonly vars: { [id: string]: any } = {}
  // TODO: looks ugly
  public onPrint: ((s: string) => void) | undefined;
  private varChangedSource: AsyncEventSource<VarChangedEvent> = new AsyncEventSource<VarChangedEvent>();

  public constructor() {
  }

  public addFunc(funcDef: FuncDef) {
    this.funcDefs.set(funcDef.name, funcDef);
  }

  public getFunc(s: string): FuncDef {
    let func = this.funcDefs.get(s);
    if (func === undefined) {
      throw 'incorrect function';
    }
    return func;
  }


  public evalFunc<T>(name: string, x: T): string | undefined {
    let func = this.getFunc(name);
    let s: string | undefined;
    if (func !== undefined) {
      let ast = func.createAst<T>(x);
      s = this.evalAst(ast);
      if (s !== undefined) {
        if (this.onPrint !== undefined) {
          this.onPrint(s);
        }
      }
    } else {
    }

    return s;
  }

  public getVar(name: string): any | undefined {
    return this.vars[name];
  }

  public setVar(name: string, value: any | undefined): void {
    if (value !== undefined) {
      this.vars[name] = value;
    } else {
      delete this.vars[name];
    }

    // for now invoke all parameters
    this.varChangedSource.invoke({});
  }

  public evalAst(ast: AstNode, noEcho?: boolean): string | undefined {
    if (noEcho === undefined || noEcho === false) {
      if (this.onPrint !== undefined) {
        this.onPrint(formatAst(ast));
      }
    }

    return this.evalAstWorker(ast);
  }

  public help(filter: string | undefined): string | undefined {
    let s: string;
    if (filter === undefined) {
      s = 'Commands by category: ';
      let addSep = false;
      this.funcDefs.forEach((value, key) => {
        if (addSep) {
          s = s + `;${value.name}`;
        } else {
          s = value.name;
          addSep = true;
        }
      });
    }
    else {
      s = '';
      let funcDef = this.funcDefs.get(filter);
      if (funcDef === undefined) {
        return this.unknownCommand(filter);
      }

      s = funcDef.help();
    }

    return s;
  }

  public onVarChanged(target: any, func: (evt: VarChangedEvent) => void): void {
    this.varChangedSource.add(target, func);
  }

  public processLine(s: string): string | undefined {
    try {
      // @ts-ignore
      let parseTree = resourceLib.parser?.parse(s);
      let ast = this.buildAst(parseTree);

      return this.evalAstWorker(ast);
    }
    catch (error) {
      return error?.toString();
    }
  }

  private evalAstWorker(ast: AstNode): string | undefined {
    if (ast.kind === AstNodeKind.Sequence) {
      let s: string | undefined = undefined;

      // return result of last expression
      for (let i = 0; i < ast.children.length; i++) {
        s = this.evalAstWorker(ast.children[i]);
      }

      return s;
    } else if (ast.kind === AstNodeKind.Func) {
      let funcDef = this.funcDefs.get(ast.name);
      if (funcDef !== undefined) {
        return funcDef.eval(ast);
      } else {
        return evalFunction(ast);
      }
    } else {
      throw 'unknown ast node';
    }
  }

  private buildAst(parseTree: object): AstNode {
    let ptObj = parseTree as PtObj;

    if (ptObj.kind === "sequence") {
      return this.buildSequenceAst(parseTree as PtSequence);
    } else if (ptObj.kind === "call") {
      let ptCall = parseTree as PtCall;
      return this.buildFuncAst(ptCall);
    } else {
      throw 'unknown node';
    }
  }

  private buildSequenceAst(ptSequence: PtSequence): AstNode {
    let ast = new AstNode(AstNodeKind.Sequence, '', undefined);
    for (let i = 0; i < ptSequence.expressions.length; i++) {
      ast.children.push(this.buildAst(ptSequence.expressions[i]));
    }
    return ast;
  }

  private buildFuncAst(ptCall: PtCall): AstNode {
    // @ts-ignore
    let ast = new AstNode(AstNodeKind.Func, ptCall.func.name, undefined);

    let funcDef = this.funcDefs.get(ast.name);
    if (funcDef === undefined) {
      return buildFuncAst(ptCall);
    }

    let paramsDef = funcDef.getParamDefs();
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

  private unknownCommand(s: string): string {
    return `Unknown command ${s}`;
  }
}