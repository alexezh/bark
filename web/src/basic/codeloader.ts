import { ICodeLoader, ICodeRunner } from "../engine/ivm";
import { AstNode, AstNodeKind, FuncDefNode, ModuleNode, OnNode, VarDefNode } from "./ast";
import { parseModule } from "./basic";
import { BasicParser } from "./basicparser";
import { JsWriter } from "./jswriter";
import { BasicLexer } from "./lexer";
import { validateModule } from "./checker";
import { transpile } from "./transpiler";

export class CodeLoader implements ICodeLoader {
  private readonly _systemModules: Map<string, ModuleNode> = new Map<string, ModuleNode>();
  private readonly _userModules: Map<string, ModuleNode> = new Map<string, ModuleNode>();
  private readonly modules: Map<string, { [key: string]: Function }> = new Map<string, { [key: string]: Function }>();

  public addSystemModule(ast: ModuleNode) {
    let module: { [key: string]: Function } = {};

    if (!ast.name) {
      throw 'incorrect parameter';
    }

    this._systemModules.set(ast.name, ast);
    for (let item of ast.funcs) {
      let funcDef = item as FuncDefNode;
      if (funcDef.name) {
        module[funcDef.name.value] = funcDef.body as Function;
      }
    }
    for (let tp of ast.types) {
      module[tp.digName.value] = tp.systemType!;//funcDef.body as Function;
    }
    this.modules.set(ast.name, module);
  }

  public addUserModule(name: string, text: string | ModuleNode) {
    if (typeof (text) === 'string') {
      let tokenize = BasicLexer.load(text);
      let parser = new BasicParser(tokenize);
      let ast = parseModule(parser);
      this._userModules.set(name, ast);
    } else {
      this._userModules.set(name, text);
    }
  }

  public updateUserModule(node: AstNode, text: string) {
    let tokenize = BasicLexer.load(text);
    let parser = new BasicParser(tokenize);
    let ast = parseModule(parser);

    // we want to clone lexer and update tokens in lexer... 
    // we are assuming that edit tokens are valid which is reasonable as we start with ast
  }

  public getUserModule(name: string): ModuleNode | undefined {
    return this._userModules.get(name);
  }

  public *systemModules(): Iterable<ModuleNode> {
    for (let m of this._systemModules) {
      yield m[1];
    }
  }

  public *userModules(): Iterable<ModuleNode> {
    for (let m of this._userModules) {
      yield m[1];
    }
  }

  public *userFunctions(): Iterable<FuncDefNode> {
    for (let m of this._userModules) {
      for (let node of m[1].funcs) {
        yield node as FuncDefNode;
      }
    }
  }

  public *functions(): Iterable<FuncDefNode> {
    for (let m of this._systemModules) {
      for (let node of m[1].funcs) {
        yield node as FuncDefNode;
      }
    }
    for (let m of this._userModules) {
      for (let node of m[1].funcs) {
        yield node as FuncDefNode;
      }
    }
  }

  public *vars(): Iterable<VarDefNode> {
    for (let m of this._userModules) {
      for (let node of m[1].vars) {
        yield node;
      }
    }
  }

  public *userOns(): Iterable<OnNode> {
    for (let m of this._userModules) {
      for (let node of m[1].on) {
        yield node as OnNode;
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
    for (let m of this._userModules) {
      validateModule(m[1], this);
    }
    let js = transpile(undefined, this);

    //let val = js(this);
    return js;
  }
}
