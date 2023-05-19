import { StaticCubeModel } from "../../engine/avatars/staticcubemodel";
import { vm } from "../../engine/ivm";
import { Sprite3 } from "../../engine/sprite3";
import { RigitBodyKind } from "../../voxel/voxelmeshmodel";
import { AstNodeKind, FuncDefNode, ModuleNode, TypeDefNode } from "../ast";
import { addSystemFunc, addSystemType } from "../systemfunc";
import { MapBlockRigitBody, MapBoundaryRigitBody } from "../../voxel/mapblockrigitbody";
import { Vector3 } from "three";
import { MoveController2D } from "../../engine/movecontroller2d";

let s = `proc changeSpeed(bomb: Bomb, x: number, y: number, z: number);
proc randInt(mm: number, ma: number);
type Sprite = record 
end
type Bomb = record
  x: number,
  y: number,
  z: number
end
proc waitCollide(sprite: Sprite[], timeout: number);
proc 
`

function createCubeSprite(name: string, uri: string): Promise<IDigSprite> {
  return vm.createSprite(name, uri, new StaticCubeModel());
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

function deleteBlock() {
  //vm.level.deleteBlock();
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
  vm.setController(new MoveController2D({
    keySpeedX: keySpeedX,
    keySpeedZ: keySpeedZ,
    thumbSpeedX: thumbSpeedX,
    thumbSpeedZ: thumbSpeedZ,
    timeoutSeconds: timeoutSeconds
  }));
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
  funcs.push(addSystemFunc(module, 'removeSprite', ['sprite:Sprite'], 'void', false, removeSprite));
  funcs.push(addSystemFunc(module, 'loadLevel', ['name:string'], 'void', true, loadLevel));
  funcs.push(addSystemFunc(module, 'deleteBlock', ['block:block'], 'void', false, deleteBlock));
  funcs.push(addSystemFunc(module, 'createExplosion', ['x: number', 'y: number', 'z: number'], 'void', false, createExplosion));

  types.push(addSystemType('Sprite', Sprite3, ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));
  types.push(addSystemType('Block', MapBlockRigitBody, ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));
  types.push(addSystemType('Boundary', MapBoundaryRigitBody, ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));

  return module;
}

type DigAnimation = {
  sprite: Sprite3;
  name: string;
}

function addAnimation(sprite: Sprite3, name: string): DigAnimation {
  sprite.rigit.addAnimation(name);
  return {
    sprite: sprite,
    name: name
  }
}

function addFrame(animation: DigAnimation, idx: number, duration: number) {
  animation.sprite.rigit.addFrame(animation.name, idx, duration);
}

function setPosition(sprite: Sprite3, x: number, y: number, z: number) {
  sprite.setPosition(new Vector3(x, y, z));
}

function setSpeed(sprite: Sprite3, x: number, y: number, z: number) {
  sprite.setSpeed(new Vector3(x, y, z));
}

function changeSpeedBy(sprite: Sprite3, x: number, y: number, z: number) {
  let speed = sprite.speed.clone();
  sprite.setSpeed(speed.add(new Vector3(x, y, z)));
}

export function createSpriteModule(): ModuleNode {
  let funcs: FuncDefNode[] = [];
  let types: TypeDefNode[] = [];

  let module: ModuleNode = {
    kind: AstNodeKind.module,
    name: 'Sprite',
    types: types,
    procs: funcs,
    on: []
  };

  funcs.push(addSystemFunc(module, 'addAnimation', ['sprite: Sprite', 'name: string'], 'Animation', false, addAnimation));
  funcs.push(addSystemFunc(module, 'addFrame', ['sprite: Sprite', 'animation: Animation', 'index: number', "duration: number"], 'void', false, addFrame));
  funcs.push(addSystemFunc(module, 'setPosition', ['sprite: Sprite', 'x: number', 'y: number', 'z: number'], 'void', false, setPosition));
  funcs.push(addSystemFunc(module, 'setSpeed', ['sprite: Sprite', 'x: number', 'y: number', 'z: number'], 'void', false, setSpeed));
  funcs.push(addSystemFunc(module, 'changeSpeedBy', ['sprite: Sprite', 'x: number', 'y: number', 'z: number'], 'void', false, changeSpeedBy));

  types.push(addSystemType('Animation', Sprite3, ['name: string']));

  return module;
}