import { PokemonProxy } from "./avatarcode";
import { CodeAction, IAvatarAPI } from "./iavatarapi";
import { BattleAction, IBattleAPI } from "./ibattleapi";
import { CatchAction, ICatchAPI } from "./icatchapi";
import { PokemonMove } from "../world/pokemon";
import { PokemonKind } from "../graphics/ipokedex";

export enum CodeCategory {
  avatar = 'avatar',
  pokedex = 'pokedex',
  battle = 'battle',
}

export enum FileCategory {
  avatar = 'avatar',
  pokedex = 'pokedex',
  location = 'location',
  tile = 'tile'
}

export function describeCodeCategory(): string {
  let s = '';

  let sep = false;
  for (let c in CodeCategory) {
    if (sep) {
      s += ';'
    }
    s += c;
    sep = true;
  }
  return s;
}

export interface IAvatarProxy {
  get id(): string;
  get name(): string;
}

export interface IPokemonProxy extends IAvatarProxy {
  get kind(): PokemonKind;
  get hp(): number;
  get hpMax(): number;
  get ownerId(): string | undefined;
  get movesCount(): number;
  moveAt(idx: number): PokemonMove;
}

export interface ICharacterProxy extends IAvatarProxy {
  // total number of pokemons 
  get pokemonCount(): number;
  pokemonAt(idx: number): PokemonProxy;

  // get number of balls of each color
  ballCount(name: string): number;
  // returns array of items
  balls(): IterableIterator<string>;
}

// need batter name. It is really a step code. 
export interface IAvatarCode {
  next(self: IPokemonProxy, abi: IAvatarAPI): CodeAction | undefined;
  battleTurn(self: IPokemonProxy, opponent: IPokemonProxy, api: IBattleAPI): Promise<BattleAction>;
  catchTurn(self: ICharacterProxy, opponent: IPokemonProxy, api: ICatchAPI): Promise<CatchAction>;
}

