import { AstNodeKind, FuncDefNode, ModuleNode } from "./ast";
import { JsWriter } from "./jswriter";

export class ModuleCache {
  private modules: Map<string, { [key: string]: Function }> = new Map<string, { [key: string]: Function }>();

  public
  public registerSystemModule(name: string, ast: ModuleNode) {
    let module: { [key: string]: Function } = {};
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

  public writeModuleVars(loaderVar: string, writer: JsWriter) {
    for (let module of this.modules) {
      writer.append(`let ${module[0]} = ${loaderVar}.getModule(\'${module[0]}\');`);
    }
  }
}
