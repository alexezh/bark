import { randInt } from "three/src/math/MathUtils";
import { AstNodeKind, FuncDefNode, ModuleNode } from "../ast";
import { addSystemFunc, createModuleNode } from "./systemfunc";


export function createMath(): ModuleNode {

  let module = createModuleNode('Math');

  module.funcs.push(addSystemFunc(module, 'min', ['v1:number', 'v2:number'], 'number', false, Math.min));
  module.funcs.push(addSystemFunc(module, 'max', ['v1:number', 'v2:number'], 'number', false, Math.max));
  module.funcs.push(addSystemFunc(module, 'randInt', ['a:number', 'b:number'], 'number', false, randInt));

  return module;
}