import { AstNodeKind, FuncDefNode, ModuleNode } from "./ast";
import { JsWriter } from "./jswriter";

export class ModuleCache {
  private readonly astModules: Map<string, ModuleNode> = new Map<string, ModuleNode>();
  private readonly modules: Map<string, { [key: string]: Function }> = new Map<string, { [key: string]: Function }>();

  public registerSystemModule(name: string, ast: ModuleNode) {
    let module: { [key: string]: Function } = {};

    this.astModules.set(name, ast);
    for (let item of ast.children) {
      if (item.kind === AstNodeKind.funcDef) {
        let funcDef = item as FuncDefNode;
        module[funcDef.name.value] = funcDef.body as Function;
      }
    }
    this.modules.set(name, module);
  }

  public getModule(name: string): { [key: string]: Function } {
    let value = this.modules.get(name);
    if (value === undefined) {
      throw 'Cannot find module:' + name;
    }
    return value;
  }

  public forEachAstModule(func: (node: ModuleNode) => void) {
    for (let x of this.astModules) {
      func(x[1]);
    }
  }

  public writeModuleVars(loaderVar: string, writer: JsWriter) {
    for (let module of this.modules) {
      writer.append(`let ${module[0]} = ${loaderVar}.getModule(\'${module[0]}\');`);
    }
  }
}
