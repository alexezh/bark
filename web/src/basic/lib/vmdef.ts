import { StaticCubeModel } from "../../engine/avatars/staticcubemodel";
import { vm } from "../../engine/ivm";
import { Sprite3 } from "../../engine/sprite3";
import { RigitBodyKind } from "../../voxel/voxelmeshmodel";
import { AstNodeKind, FuncDefNode, ModuleNode, TypeDefNode } from "../ast";
import { addSystemFunc, addSystemType } from "../systemfunc";
import { MapBlockRigitBody, MapBoundaryRigitBody } from "../../voxel/mapblockrigitbody";

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

function loadLevel(name: string) {
  vm.loadLevel(name);
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

export function createVmModule(): ModuleNode {
  let funcs: FuncDefNode[] = [];
  let types: TypeDefNode[] = [];

  funcs.push(addSystemFunc('createCubeSprite', ['name:string', 'url:string'], 'Sprite', false, createCubeSprite));
  funcs.push(addSystemFunc('removeSprite', ['sprite:Sprite'], 'void', false, removeSprite));
  funcs.push(addSystemFunc('createLevel', ['name:string'], 'void', false, loadLevel));
  funcs.push(addSystemFunc('waitCollide', ['sprite: Sprite', 'timeout: number'], 'Sprite | Block', true, waitCollide));

  types.push(addSystemType('Sprite', 'Sprite3', ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));
  types.push(addSystemType('Block', 'MapBlockRigitBody', ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));
  types.push(addSystemType('Boundary', 'MapBoundaryRigitBody', ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));

  return {
    kind: AstNodeKind.module,
    name: 'Vm',
    types: types,
    children: funcs
  }
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

export function createSpriteModule(): ModuleNode {
  let funcs: FuncDefNode[] = [];
  let types: TypeDefNode[] = [];

  funcs.push(addSystemFunc('addAnimation', ['sprite: Sprite', 'name: string'], 'Animation', false, addAnimation));
  funcs.push(addSystemFunc('addFrame', ['animation: Animation', 'index: number', "duration: number"], 'void', false, addFrame));

  types.push(addSystemType('Animation', 'DigAnimation', ['name: string']));

  return {
    kind: AstNodeKind.module,
    name: 'Sprite',
    types: types,
    children: funcs
  }
}