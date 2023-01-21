import { terminal } from "../ui/igameterminal";
import { gameState } from "../world/igamestate";
import { resourceLib } from "../graphics/resourceLib";
import { ParamDef, ParamType } from "./funcdef";
import { GenericEditorFuncDef } from "./genericeditorfuncdef";
import { mapEditorState, MapEditorState } from "./mapeditorstate";
import { registerFunction } from "./poshregistry";
import { PokedexProps, PokemonKind } from "../graphics/ipokedex";

export type AddPokemonTypeParams = {
  id: string;
  name: string;
  kind: string;
}

export class AddPokemonTypeDef extends GenericEditorFuncDef {
  private static funcName: string = 'addPokemonType';

  public constructor(mapEditorState: MapEditorState) {
    super(AddPokemonTypeDef.funcName, mapEditorState);
  }

  public help(): string {
    let s = 'Add pokemon to library.' + this.helpUsage() + '\r\n';
    return s;
  }

  public createParamDefs(): ParamDef[] {
    return [
      { name: 'id', t: ParamType._int, optional: false },
      { name: 'name', t: ParamType._string, optional: false },
      { name: 'kind', t: ParamType._string, optional: false },
    ]
  }
  protected evalCore(params: any): string | undefined {
    let paramsT = params as AddPokemonTypeParams;

    let idS = String(paramsT.id).padStart(3, '0');
    let pt: PokedexProps = {
      id: idS,
      name: paramsT.name,
      kind: paramsT.kind as PokemonKind,
      battlerFrontUrl: './assets/battlers/' + idS + '.png',
      battlerBackUrl: './assets/battlers/' + idS + 'b.png',
      iconUrl: './assets/icons/' + idS + '.png',
      skinUrl: './assets/characters/' + idS + '.png',
      hp: 0,
      hpMax: 0,
      code: 'pokedex/code/default',
      moves: []
    }

    resourceLib.pokedex.addPokedexEntry(pt.id, pt);

    return undefined;
  }
}

export type SpawnPokemonParams = {
  pokedexId: number;
  name: string;
}

export function spawnPokemon(args: { pokedexId: number, x: number, y: number }) {

  setTimeout(async () => {
    let idS = String(args.pokedexId).padStart(3, '0');

    let layer = mapEditorState.currentTileLayer;
    if (layer === undefined) {
      terminal?.print(`You can only spawn pokemons in edit mode`);
      return;
    }

    if (args.x === undefined || args.y === undefined) {
      terminal?.print(`Spawn coordinates not defined`);
      return;
    }

    let pokemon = await gameState.spawnPokemon(idS, layer.id, { x: args.x, y: args.y });

    terminal?.print(`Created pokemon ${pokemon.id}`);
  });
}

export function printAvatarInfo(args: { id: string }) {
  let avatar = gameState.avatarCollection.getAvatar(args.id);
  if (avatar === undefined) {
    terminal?.printError('Cannot find avatar ' + args.id);
    return;
  }

  terminal?.print(`Name: ${avatar.rt.name} Id: ${avatar.id} State: ${avatar.gameState} Layer: ${avatar.props.layerId} Position: (${avatar.currentPos?.x}, ${avatar.currentPos?.y})`)
}

export function registerPokemonCommands() {
  registerFunction('printAvatarInfo', ['name:string'], printAvatarInfo);
  registerFunction('spawnPokemon', ['pokedexId:int', 'x:int', 'y:int'], spawnPokemon);
}

