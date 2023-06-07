import { vm } from "../../engine/ivm";
import { IRigitBody } from "../../voxel/irigitbody";
import { ModuleNode } from "../ast";
import { addSystemFunc, createModuleNode } from "./systemfunc";

function setGravity(val: number) {
  vm.physics.setGravity(val);
}

function isStanding(sprite: IRigitBody): boolean {
  return sprite.standing;
}

export function createPhysicsModule(): ModuleNode {
  let module = createModuleNode('Physics')

  module.funcs.push(addSystemFunc(module, 'setGravity', ['value: number'], 'void', false, setGravity));
  module.funcs.push(addSystemFunc(module, 'isStanding', ['sprite: Sprite'], 'boolean', false, isStanding));

  return module;
}

