import { GridPos } from "../posh/pos";
import { IAvatar } from "./iavatar";
import { IGameMap } from "./igamemap";
import { Pokemon } from "./pokemon";

export interface IGameState {
  gameMap?: IGameMap;
  //avatarCollection: AvatarCollection;
  onLoaded: boolean;
  load(): Promise<boolean>;
  spawnPokemon(pokedexId: string, layerId: string, pos: GridPos): Promise<IAvatar>;
  spawnCharacter(name: string, skinUrl: string): void;

  removePokemon(p: Pokemon): void;
}

export function setGameState(state: IGameState) {
  gameState = state;
}

export var gameState: IGameState;