import { StaticCubeModel } from "../../engine/avatars/staticcubemodel";
import { vm } from "../../engine/ivm";
import { Sprite3 } from "../../engine/sprite3";
import { AstNodeKind, FuncDefNode, ModuleNode, TypeDefNode } from "../ast";
import { addSystemFunc, addSystemType } from "../systemfunc";
import { MapBlockRigitBody, MapBoundaryRigitBody } from "../../voxel/mapblockrigitbody";
import { Vector3 } from "three";
import { MoveController2D, IMoveEvent2D, MoveEvent2D } from "../../engine/movecontroller2d";
import { Mammal4Model } from "../../engine/avatars/mammal4";
import { ThirdPersonController } from "../../engine/thirdpersoncontroller";
import { RigitBodyKind } from "../../voxel/irigitbody";


function createCubeSprite(name: string, uri: string): Promise<IDigSprite> {
  return vm.createSprite(name, uri, new StaticCubeModel());
}

function createMammal4Sprite(name: string, uri: string): Promise<IDigSprite> {
  return vm.createSprite(name, uri, new Mammal4Model());
}

function removeSprite(sprite: IDigSprite) {
  return vm.removeSprite(sprite as Sprite3);
}

function loadLevel(name: string): Promise<void> {
  return vm.loadLevel(name);
}

async function waitCollide(sprite: IDigSprite, timeout: number): Promise<Sprite3 | MapBlockRigitBody | MapBoundaryRigitBody | null> {
  //vm.createSprite()
  let collide = await vm.waitCollide(sprite as Sprite3, timeout);
  if (collide === null) {
    return null;
  } else if (collide.kind === RigitBodyKind.sprite) {
    return collide as Sprite3;
  } else if (collide.kind === RigitBodyKind.block) {
    return collide as MapBlockRigitBody;
  } else if (collide.kind === RigitBodyKind.boundary) {
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

function setMoveController2D(keySpeedX: number,
  keySpeedZ: number,
  thumbSpeedX: number,
  thumbSpeedZ: number,
  timeoutSeconds: number) {

  // create controller and options such as repeat rate and so on
  vm.setController(new ThirdPersonController({
    keySpeedX: keySpeedX,
    keySpeedZ: keySpeedZ,
    keySpeedXZ: 5,
    thumbSpeedX: thumbSpeedX,
    thumbSpeedZ: thumbSpeedZ,
    timeoutSeconds: timeoutSeconds
  }));
}

function readInput(): Promise<IMoveEvent2D> {
  return vm.readInput();
}

function setThirdPersonCamera(sprite: Sprite3, x: number, y: number, z: number): void {
  vm.camera.setThirdPersonCamera(sprite, new Vector3(x, y, z));
}

export function createSystemModule(): ModuleNode {
  let funcs: FuncDefNode[] = [];
  let types: TypeDefNode[] = [];

  let module: ModuleNode = {
    kind: AstNodeKind.module,
    name: 'System',
    types: types,
    procs: funcs,
    on: []
  }

  funcs.push(addSystemFunc(module, 'waitCollide', ['sprite: Sprite', 'timeout: number'], 'Sprite | Block | null', true, waitCollide));
  funcs.push(addSystemFunc(module, 'sendMessage', ['address: string', 'text: string'], 'void', true, sendMessage));
  funcs.push(addSystemFunc(module, 'sleep', ['delay: number'], 'void', true, sleep));

  funcs.push(addSystemFunc(module, 'setMoveController2D', [
    'keySpeedX:number',
    'keySpeedZ:number',
    'thumbSpeedX:number',
    'thumbSpeedZ:number',
    'timeoutSeconds:number'], 'void', false, setMoveController2D));
  funcs.push(addSystemFunc(module, 'createCubeSprite', ['name:string', 'url:string'], 'Sprite', true, createCubeSprite));
  funcs.push(addSystemFunc(module, 'createMammal4Sprite', ['name:string', 'url:string'], 'Sprite', true, createMammal4Sprite));
  funcs.push(addSystemFunc(module, 'removeSprite', ['sprite:Sprite'], 'void', false, removeSprite));
  funcs.push(addSystemFunc(module, 'loadLevel', ['name:string'], 'void', true, loadLevel));
  funcs.push(addSystemFunc(module, 'deleteBlock', ['block:Block'], 'void', false, deleteBlock));
  funcs.push(addSystemFunc(module, 'createExplosion', ['x: number', 'y: number', 'z: number'], 'void', false, createExplosion));
  funcs.push(addSystemFunc(module, 'readInput', [], 'MoveEvent2D', true, readInput));
  funcs.push(addSystemFunc(module, 'setThirdPersonCamera', ['sprite: Sprite', 'x: number', 'y: number', 'z:number'], 'void', false, setThirdPersonCamera));


  types.push(addSystemType('MoveEvent2D', MoveEvent2D, ['speedX: number', 'speedZ: number']));
  types.push(addSystemType('Sprite', Sprite3, ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));
  types.push(addSystemType('Block', MapBlockRigitBody, ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));
  types.push(addSystemType('Boundary', MapBoundaryRigitBody, ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));

  return module;
}

function setGravity(val: number) {

}

export function createPhysicsModule(): ModuleNode {
  let funcs: FuncDefNode[] = [];
  let types: TypeDefNode[] = [];

  let module: ModuleNode = {
    kind: AstNodeKind.module,
    name: 'Physics',
    types: types,
    procs: funcs,
    on: []
  }

  funcs.push(addSystemFunc(module, 'setGravity', ['value: number'], 'void', true, setGravity));

  return module;
}

