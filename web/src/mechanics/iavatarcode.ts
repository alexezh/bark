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

export interface ICharacterProxy extends IAvatarProxy {
  // total number of pokemons 
  get pokemonCount(): number;
  pokemonAt(idx: number): any;

  // get number of balls of each color
  ballCount(name: string): number;
  // returns array of items
  balls(): IterableIterator<string>;
}

// need batter name. It is really a step code. 
export interface IAvatarCode {
}

