import { terminal } from "../ui/igameterminal";
import { gameState } from "../world/igamestate";
import { ParamDef, ParamType } from "./funcdef";
import { GenericEditorFuncDef } from "./genericeditorfuncdef";
import { MapEditorState } from "./mapeditorstate";
import { PoshFunction, printHelp, registerFunction } from "./poshregistry";

export function teleport(args: { id: string, x: number, y: number }) {
  if (args.id === undefined || args.x === undefined || args.y === undefined) {
    printHelp(teleport as PoshFunction);
    return;
  }
  /*
    let avatar = gameState.avatarCollection.getAvatar(args.id);
    if (avatar === undefined) {
      terminal?.printError('Invalid avatar:' + args.id);
      return;
    }
  */
  //avatar.currentPos = { x: args.x, y: args.y };
  //terminal?.refresh();

  return undefined;
}

export function registerMoveCommands() {
  registerFunction('teleport', ['id:string', 'x:int', 'y:int'], teleport, 'teleport avatar.');
}

/*

if distance to city < x
  

when see pokemon:x
  catch x

catch:
  while distance(x) < distance(x, -1) 
    if(distance(x) > 1) 
      move to X
    else
      attack x

attack

when next to x
  attack x

attack:
when my turn: 

*/