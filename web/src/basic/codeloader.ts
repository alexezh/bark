import { ICodeLoader, IVMCodeRunner } from "../engine/ivm";
import { AstNodeKind, FuncDefNode, ModuleNode, OnNode } from "./ast";
import { parseModule } from "./basic";
import { BasicParser } from "./basicparser";
import { JsWriter } from "./jswriter";
import { BasicLexer } from "./lexer";
import { validateModule } from "./checker";
import { transpile } from "./basictranspiler";

export class CodeLoader implements ICodeLoader {
  private readonly _systemModules: Map<string, ModuleNode> = new Map<string, ModuleNode>();
  private readonly _userModules: Map<string, ModuleNode> = new Map<string, ModuleNode>();
  private readonly modules: Map<string, { [key: string]: Function }> = new Map<string, { [key: string]: Function }>();

  public addSystemModule(name: string, ast: ModuleNode) {
    let module: { [key: string]: Function } = {};

    this._systemModules.set(name, ast);
    for (let item of ast.procs) {
      if (item.kind === AstNodeKind.funcDef) {
        let funcDef = item as FuncDefNode;
        module[funcDef.name.value] = funcDef.body as Function;
      }
    }
    this.modules.set(name, module);
  }

  public addUserModule(name: string, text: string) {
    let tokenize = BasicLexer.load(text);
    let parser = new BasicParser(tokenize);
    let ast = parseModule(parser);
    this._userModules.set(name, ast);
  }

  public *systemModules(): Iterable<ModuleNode> {
    for (let m of this._systemModules) {
      yield m[1];
    }
  }

  public *userFunctions(): Iterable<FuncDefNode> {
    for (let m of this._userModules) {
      for (let node of m[1].procs) {
        yield node[1];
      }
    }
  }

  public *functions(): Iterable<FuncDefNode> {
    for (let m of this._systemModules) {
      for (let node of m[1].procs) {
        yield node[1];
      }
    }
    for (let m of this._userModules) {
      for (let node of m[1].procs) {
        yield node[1];
      }
    }
  }

  public *userOns(): Iterable<OnNode> {
    for (let m of this._userModules) {
      for (let node of m[1].on) {
        yield node[1];
      }
    }
  }

  public *imports(): Iterable<ModuleNode> {
    for (let m of this._systemModules) {
      yield m[1];
    }
  }

  public getModule(name: string): { [key: string]: Function } {
    let value = this.modules.get(name);
    if (value === undefined) {
      throw 'Cannot find module:' + name;
    }
    return value;
  }

  public getFunction(): Function {
    for (let m of this._systemModules) {
      validateModule(m[1], this);
    }
    let js = transpile(undefined, this);

    //let val = js(this);
    return js;
  }
}
