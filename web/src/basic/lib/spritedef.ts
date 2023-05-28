import { Vector3 } from "three";
import { Sprite3 } from "../../engine/sprite3";
import { AstNodeKind, FuncDefNode, ModuleNode, TypeDefNode } from "../ast";
import { addSystemFunc, addSystemType } from "../systemfunc";

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
  sprite.setSpeed(new Vector3(x, y, z));
}

function setAngleXZ(sprite: Sprite3, angleXZ: number) {
  if (angleXZ === undefined) {
    return;
  }

  angleXZ = Math.PI * angleXZ / 180;
  sprite.setAngleXZ(angleXZ);
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
  funcs.push(addSystemFunc(module, 'setAngleXZ', ['sprite: Sprite', 'xz: number'], 'void', false, setAngleXZ));
  funcs.push(addSystemFunc(module, 'changeSpeedBy', ['sprite: Sprite', 'x: number', 'y: number', 'z: number'], 'void', false, changeSpeedBy));
  funcs.push(addSystemFunc(module, 'animate', ['sprite: Sprite', 'name: string'], 'void', false, animate));


  types.push(addSystemType('Animation', Sprite3, ['name: string']));

  return module;
}
