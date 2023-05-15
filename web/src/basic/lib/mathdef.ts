//import { randInt } from "three/src/math/MathUtils";
import { AstNodeKind, FuncDefNode, ModuleNode, ParamDefNode, StatementNode } from "../ast";
import { addSystemFunc } from "../systemfunc";


export function createMath(): ModuleNode {
  let funcs: FuncDefNode[] = [];

  funcs.push(addSystemFunc('min', ['v1:number', 'v2:number'], 'number', false, Math.min));
  funcs.push(addSystemFunc('max', ['v1:number', 'v2:number'], 'number', false, Math.max));
  //funcs.push(addSystemFunc('randInt', ['a:number', 'b:number'], 'number', false, randInt));

  return {
    kind: AstNodeKind.module,
    name: 'Math',
    types: [],
    procs: funcs,
    on: []
  }
}