import { AstNodeKind, FuncDefNode, ModuleNode, ParamDefNode, StatementNode } from "../ast";
import { addSystemFunc } from "../systemfunc";


export function createMath(): ModuleNode {
  let funcs: FuncDefNode[] = [];

  funcs.push(addSystemFunc('min', ['v1:number', 'v2:number'], 'number', false, Math.min));
  funcs.push(addSystemFunc('max', ['v1:number', 'v2:number'], 'number', false, Math.max));

  return {
    kind: AstNodeKind.module,
    name: 'Math',
    types: [],
    children: funcs
  }
}