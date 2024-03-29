import { vm } from "../../engine/ivm";
import { Sprite3 } from "../../engine/sprite3";
import { ModuleNode } from "../ast";
import { addSystemFunc, createModuleNode } from "./systemfunc";
import { MapBlockRigitBody, MapBoundaryRigitBody } from "../../voxel/mapblockrigitbody";
import { Vector3 } from "three";
import { RigitBodyKind } from "../../voxel/irigitbody";


function loadLevel(name: string): Promise<void> {
  return vm.loadLevel(name);
}

/**
 * restarts app by running stop/start
 */
function restart() {
  setTimeout(async () => {
    vm.stop();
    await vm.start();
  });
}

async function waitCollide(sprite: IDigSprite, timeout: number): Promise<Sprite3 | MapBlockRigitBody | MapBoundaryRigitBody | null> {
  //vm.createSprite()
  let collide = await vm.waitCollide(sprite as Sprite3, timeout);
  if (collide === null) {
    return null;
  } else if (collide.rigitKind === RigitBodyKind.object) {
    return collide as Sprite3;
  } else if (collide.rigitKind === RigitBodyKind.block) {
    return collide as MapBlockRigitBody;
  } else if (collide.rigitKind === RigitBodyKind.boundary) {
    return collide as MapBoundaryRigitBody;
  } else {
    return null;
  }
}

function sleep(delay: number): Promise<void> {
  return vm.sleep(delay);
}

function deleteBlock(block: MapBlockRigitBody) {
  vm.level.deleteBlock(block);
}

function createExplosion(x: number, y: number, z: number) {
  vm.createExplosion(new Vector3(x, y, z));
}

async function sendMessage(address: string, text: string): Promise<void> {
  vm.sendMesssage(address, text);
}

export function createSystemModule(): ModuleNode {

  let module = createModuleNode('System');

  module.funcs.push(addSystemFunc(module, 'waitCollide', ['sprite: Sprite', 'timeout: number'], 'Sprite | Block | null', true, waitCollide));
  module.funcs.push(addSystemFunc(module, 'sendMessage', ['address: string', 'text: string'], 'void', true, sendMessage));
  module.funcs.push(addSystemFunc(module, 'sleep', ['delay: number'], 'void', true, sleep));
  module.funcs.push(addSystemFunc(module, 'spawn', ['func: function(Sprite):void', '...any[]'], 'void', true, sleep));
  module.funcs.push(addSystemFunc(module, 'log', ['text: string'], 'void', false, console.log));

  module.funcs.push(addSystemFunc(module, 'restart', [], 'void', true, restart));
  module.funcs.push(addSystemFunc(module, 'loadLevel', ['name:string'], 'void', true, loadLevel));
  module.funcs.push(addSystemFunc(module, 'deleteBlock', ['block:Block'], 'void', false, deleteBlock));
  module.funcs.push(addSystemFunc(module, 'createExplosion', ['x: number', 'y: number', 'z: number'], 'void', false, createExplosion));

  return module;
}

