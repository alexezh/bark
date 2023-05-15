//import { randInt } from "three/src/math/MathUtils";
import { AstNodeKind, FuncDefNode, ModuleNode, ParamDefNode, StatementNode } from "../ast";
import { addSystemFunc } from "../systemfunc";


export function createMath(): ModuleNode {
  let funcs: FuncDefNode[] = [];

  let module: ModuleNode = {
    kind: AstNodeKind.module,
    name: 'Math',
    types: [],
    procs: funcs,
    on: []
  };

  funcs.push(addSystemFunc(module, 'min', ['v1:number', 'v2:number'], 'number', false, Math.min));
  funcs.push(addSystemFunc(module, 'max', ['v1:number', 'v2:number'], 'number', false, Math.max));
  //funcs.push(addSystemFunc('randInt', ['a:number', 'b:number'], 'number', false, randInt));

  return module;
}