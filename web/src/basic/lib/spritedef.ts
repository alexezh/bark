import { Vector3 } from "three";
import { Sprite3 } from "../../engine/sprite3";
import { ModuleNode } from "../ast";
import { addSystemFunc, addSystemType, createModuleNode } from "./systemfunc";
import { StaticCubeModel } from "../../engine/avatars/staticcubemodel";
import { Mammal4Model } from "../../engine/avatars/mammal4";
import { vm } from "../../engine/ivm";
import { MapBlockRigitBody, MapBoundaryRigitBody } from "../../voxel/mapblockrigitbody";
import { CollisionOptions } from "../../voxel/irigitbody";

type DigAnimation = {
  sprite: Sprite3;
  name: string;
}

/**
 * projectile is special sprites which collide with other sprites but 
 * not other projectiles
 */
async function createProjectile(baseSprite: Sprite3, uri: string, scale?: number): Promise<IDigSprite> {
  let sprite = await vm.createSprite('pl', uri, new StaticCubeModel(scale ?? 1.0));
  sprite.collisionOptions = CollisionOptions.All;

  // set relative position of projetile based on sprite
  if (baseSprite) {
    sprite.setDirectionXZ(baseSprite.angleXZ);

    let frontPos = new Vector3(0, 0, -baseSprite.size.z / 2);
    frontPos.applyAxisAngle(new Vector3(0, 1, 0), baseSprite.angleXZ);
    frontPos.add(baseSprite.position);

    sprite.setPosition(frontPos);
  }

  vm.physics.addProjectile(sprite);
  return sprite;
}

async function createCubeSprite(name: string, uri: string, scale?: number): Promise<IDigSprite> {
  let sprite = await vm.createSprite(name, uri, new StaticCubeModel(scale ?? 1.0));
  vm.physics.addRigitObject(sprite);
  return sprite;
}

async function createMammal4Sprite(name: string, uri: string, scale?: number): Promise<IDigSprite> {
  let sprite = await vm.createSprite(name, uri, new Mammal4Model(scale ?? 1.0));
  vm.physics.addRigitObject(sprite);
  return sprite;
}

function removeSprite(sprite: IDigSprite) {
  vm.physics.removeRigitObject(sprite as Sprite3);
  return vm.removeSprite(sprite as Sprite3);
}

function removeProjectile(sprite: IDigSprite) {
  vm.removeSprite(sprite as Sprite3);
  vm.physics.removeProjectile(sprite as Sprite3);
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

function rotateModelXZ(sprite: Sprite3, angle: number) {
  sprite.rigit.setRotationXZ(angle);
  //sprite.setPosition(new Vector3(x, y, z));
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
  module.funcs.push(addSystemFunc(module, 'removeProjectile', ['sprite:Sprite'], 'void', false, removeProjectile));

  module.funcs.push(addSystemFunc(module, 'addAnimation', ['sprite: Sprite', 'name: string'], 'Animation', false, addAnimation));
  module.funcs.push(addSystemFunc(module, 'addFrame', ['sprite: Sprite', 'animation: Animation', 'index: number', "duration: number"], 'void', false, addFrame));
  module.funcs.push(addSystemFunc(module, 'rotateModelXZ', ['sprite: Sprite', 'angle: number'], 'void', false, rotateModelXZ));
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
