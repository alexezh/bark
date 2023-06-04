import { Vector3 } from "three";
import { Sprite3 } from "../../engine/sprite3";
import { AstNodeKind, FuncDefNode, ModuleNode, TypeDefNode } from "../ast";
import { addSystemFunc, addSystemType, createModuleNode } from "./systemfunc";
import { StaticCubeModel } from "../../engine/avatars/staticcubemodel";
import { Mammal4Model } from "../../engine/avatars/mammal4";
import { vm } from "../../engine/ivm";
import { createSystemModule } from "./systemdef";
import { MoveEvent2D } from "../../engine/movecontroller2d";
import { MapBlockRigitBody, MapBoundaryRigitBody } from "../../voxel/mapblockrigitbody";

type DigAnimation = {
  sprite: Sprite3;
  name: string;
}

function createProjectile(uri: string, scale?: number): Promise<IDigSprite> {
  return vm.createSprite('', uri, new StaticCubeModel(scale ?? 1.0));
}

function createCubeSprite(name: string, uri: string, scale?: number): Promise<IDigSprite> {
  return vm.createSprite(name, uri, new StaticCubeModel(scale ?? 1.0));
}

function createMammal4Sprite(name: string, uri: string, scale?: number): Promise<IDigSprite> {
  return vm.createSprite(name, uri, new Mammal4Model(scale ?? 1.0));
}

function removeSprite(sprite: IDigSprite) {
  return vm.removeSprite(sprite as Sprite3);
}

function addAnimation(sprite: Sprite3, name: string): DigAnimation {
  sprite.rigit.addAnimation(name);
  return {
    sprite: sprite,
    name: name
  }
}

function animate(sprite: Sprite3, name: string) {
  sprite.rigit.animate(name);
}

function addFrame(animation: DigAnimation, idx: number, duration: number) {
  animation.sprite.rigit.addFrame(animation.name, idx, duration);
}

function setPosition(sprite: Sprite3, x: number, y: number, z: number) {
  sprite.setPosition(new Vector3(x, y, z));
}

function setSpeed(sprite: Sprite3, x: number, y: number, z: number) {
  sprite.setRelativeSpeed(new Vector3(x, y, z));
}

function changeSpeedBy(sprite: Sprite3, x: number, y: number, z: number) {
  let speed = sprite.relativeSpeed.clone();
  sprite.setRelativeSpeed(speed.add(new Vector3(x, y, z)));
}

function setAngleXZ(sprite: Sprite3, angleXZ: number) {
  if (angleXZ === undefined) {
    return;
  }

  angleXZ = Math.PI * angleXZ / 180;
  sprite.setDirectionXZ(angleXZ);
}

export function createSpriteModule(): ModuleNode {

  let module = createModuleNode('Sprite');

  module.funcs.push(addSystemFunc(module, 'createCubeSprite', ['name:string', 'url:string', 'scale:number'], 'Sprite', true, createCubeSprite));
  module.funcs.push(addSystemFunc(module, 'createMammal4Sprite', ['name:string', 'url:string', 'scale:number'], 'Sprite', true, createMammal4Sprite));
  module.funcs.push(addSystemFunc(module, 'removeSprite', ['sprite:Sprite'], 'void', false, removeSprite));
  module.funcs.push(addSystemFunc(module, 'createProjectile', ['url:string', 'scale:number'], 'Sprite', true, createProjectile));

  module.funcs.push(addSystemFunc(module, 'addAnimation', ['sprite: Sprite', 'name: string'], 'Animation', false, addAnimation));
  module.funcs.push(addSystemFunc(module, 'addFrame', ['sprite: Sprite', 'animation: Animation', 'index: number', "duration: number"], 'void', false, addFrame));
  module.funcs.push(addSystemFunc(module, 'setPosition', ['sprite: Sprite', 'x: number', 'y: number', 'z: number'], 'void', false, setPosition));
  module.funcs.push(addSystemFunc(module, 'setSpeed', ['sprite: Sprite', 'x: number', 'y: number', 'z: number'], 'void', false, setSpeed));
  module.funcs.push(addSystemFunc(module, 'setAngleXZ', ['sprite: Sprite', 'xz: number'], 'void', false, setAngleXZ));
  module.funcs.push(addSystemFunc(module, 'changeSpeedBy', ['sprite: Sprite', 'x: number', 'y: number', 'z: number'], 'void', false, changeSpeedBy));
  module.funcs.push(addSystemFunc(module, 'animate', ['sprite: Sprite', 'name: string'], 'void', false, animate));

  module.types.push(addSystemType('Animation', Sprite3, ['name: string']));
  module.types.push(addSystemType('Sprite', Sprite3, ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));
  module.types.push(addSystemType('Block', MapBlockRigitBody, ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));
  module.types.push(addSystemType('Boundary', MapBoundaryRigitBody, ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));

  return module;
}
