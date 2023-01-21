import { CharacterProps } from "../world/character";
import { ICharacterProxy, IPokemonProxy } from "./iavatarcode";
import { PokemonMove, PokemonProps } from "../world/pokemon";
import { PokemonKind } from "../graphics/ipokedex";

export class PokemonProxy implements IPokemonProxy {
  private props: PokemonProps;

  public constructor(obj: PokemonProps) {
    this.props = obj;
  }
  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.rt.name;
  }
  get kind(): PokemonKind {
    return this.props.kind;
  }
  get hp(): number {
    return this.props.rt.hp;
  }
  get hpMax(): number {
    return this.props.rt.hpMax;
  }
  get ownerId(): string | undefined {
    if (this.props.rt.ownerId === null) {
      return undefined;
    }

    return this.props.rt.ownerId;
  }

  get movesCount(): number {
    return this.props.rt.moves.length;
  }
  moveAt(idx: number): PokemonMove {
    return this.props.rt.moves[idx];
  }
}

export class CharacterProxy implements ICharacterProxy {
  private props: CharacterProps;

  public constructor(obj: CharacterProps) {
    this.props = obj;
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.rt.name;
  }
  get pokemonCount(): number {
    throw new Error("Method not implemented.");
  }
  pokemonAt(idx: number): PokemonProxy {
    throw new Error("Method not implemented.");
  }

  ballCount(name: string): number {
    let ball = (this.props.rt.balls as any)[name];
    if (ball === undefined) {
      return 0;
    }
    return ball;
  }

  // returns array of items
  *balls(): IterableIterator<string> {
    for (var k in this.props.rt.balls) {
      yield k;
    }
  }
}