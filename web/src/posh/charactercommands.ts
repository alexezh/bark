import { gameState } from "../world/igamestate";
import { ParamDef, ParamType } from "./funcdef";
import { GenericEditorFuncDef } from "./genericeditorfuncdef";
import { MapEditorState } from "./mapeditorstate";
import { GridPos } from "./pos";


type AddCharacterParams = {
  name: string;
  skin: string;
}


export class SpawnCharacterDef extends GenericEditorFuncDef {
  private static funcName: string = 'addCharacter';

  public constructor(mapEditorState: MapEditorState) {
    super(SpawnCharacterDef.funcName, mapEditorState);
  }

  public help(): string {
    let s = 'Add character.' + this.helpUsage() + '\r\n';
    return s;
  }

  public createParamDefs(): ParamDef[] {
    return [
      { name: 'name', t: ParamType._string, optional: false },
      { name: 'skin', t: ParamType._string, optional: false },
    ]
  }
  protected evalCore(params: any): string | undefined {
    let paramsT = params as AddCharacterParams;

    gameState.spawnCharacter(paramsT.name, `./assets/characters/${paramsT.skin}.png`);

    return undefined;
  }
}

// spaning pokemons is part of world's physics