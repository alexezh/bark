import { vm } from "../engine/ivm";
import { AstNodeKind, FuncDefNode, ModuleNode, TypeDefNode } from "./ast";
import { addSystemFunc, addSystemType } from "./systemfunc";

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

function createSprite(name: string) {
  //vm.createSprite()
  console.log('createSprite');
}

function createLevel(name: string) {
  //vm.createSprite()
  console.log('createLevel');
}

async function waitCollide(name: string): Promise<void> {
  //vm.createSprite()
  console.log('waitCollide');
}

export function createVm(): ModuleNode {
  let funcs: FuncDefNode[] = [];
  let types: TypeDefNode[] = [];

  funcs.push(addSystemFunc('createSprite', ['name:string'], 'Sprite', false, createSprite));
  funcs.push(addSystemFunc('createLevel', ['name:string'], 'void', false, createLevel));
  funcs.push(addSystemFunc('waitCollide', ['sprite: Sprite', 'timeout: number'], 'Sprite | Block', true, waitCollide));

  types.push(addSystemType('Sprite', ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));
  types.push(addSystemType('Block', ['x: number', 'y: number', 'z: number', 'name: string', 'id: number']));

  return {
    kind: AstNodeKind.module,
    name: 'Vm',
    types: types,
    children: funcs
  }
}