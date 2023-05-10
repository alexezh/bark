import { vm } from "../engine/ivm";
import { AstNodeKind, FuncDefNode, ModuleNode } from "./ast";
import { addSystemFunc } from "./systemfunc";

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

export function createVm(): ModuleNode {
  let funcs: FuncDefNode[] = [];

  funcs.push(addSystemFunc('createSprite', ['name:string'], 'Sprite', createSprite));

  return {
    kind: AstNodeKind.module,
    name: 'Vm',
    children: funcs
  }
}