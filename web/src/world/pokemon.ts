import { Avatar, AvatarPosChanged } from "./avatar";
import { Sprite } from "../graphics/Sprite";
import { resourceLib } from "../graphics/resourceLib";
import { AvatarGameState, AvatarProps, WirePokemonProps } from "./iavatar";
import { gridPosToPxPosSafe } from "../posh/pos";
import { fetchFiles, storeFile, storeFileBackground, updateAvatarRuntimeProps } from "../fetchadapter";
import { codeLoader } from "../mechanics/codeloader";
import { PRNG } from "../mapgen/prng";
import { PokemonKind } from "../graphics/ipokedex";

export enum BallKind {
  red = 'red',
  blue = 'blue',
  black = 'black'
}

export enum BattleMoveType {
  normal = 'normal',
  grass = 'grass',
  poison = 'poison',
  water = 'water'
}

export type PokemonMove = {
  gameMode: AvatarGameState,
  name: string;
  moveType: BattleMoveType;
  // 0-200+
  power: number;
  // percentage 0-100
  accuracy: number;
  // power points needed ???
  pp: number;
}

export type PokemonRuntimeProps = {
  gameState: AvatarGameState,
  name: string;
  ownerId: string | null | undefined;
  hp: number;
  hpMax: number;
  moves: PokemonMove[];
  code: string;
}

export type PokemonProps = AvatarProps & {
  pokedexId: string;
  kind: PokemonKind;
  rt: PokemonRuntimeProps;
}

export enum DamageResult {
  minor,
  effective,
  fainted,
}

// @ts-ignore
let rnd = new PRNG();

export class Pokemon extends Avatar {
  get rt(): PokemonRuntimeProps { return this.pokemonProps.rt; }
  set rt(val: PokemonRuntimeProps) { this.pokemonProps.rt = val; }

  public get pokemonProps() { return this.props as PokemonProps; }
  public get hasOwner() {
    let id = this.pokemonProps.rt.ownerId;
    return !(id === null || id === undefined);
  }

  public constructor(wireProps: WirePokemonProps, posChanged: AvatarPosChanged) {
    wireProps.kind = wireProps.kind ?? PokemonKind.grass;

    let props: PokemonProps = {
      id: wireProps.id,
      layerId: wireProps.layerId,
      pos: wireProps.pos,
      pokedexId: wireProps.pokedexId,
      kind: wireProps.kind as PokemonKind,
      rt: JSON.parse(wireProps.rt)
    }
    super(props, posChanged);

    let pt = resourceLib.pokedex.getPokedexEntry(this.pokemonProps.pokedexId);
    if (pt === undefined) {
      throw 'cannot find pokemon';
    }

    if (this.pokemonProps.rt === undefined || this.pokemonProps.rt === null) {
      this.pokemonProps.rt = {
        gameState: AvatarGameState.move,
        name: this.id,
        ownerId: undefined,
        hp: pt.props.hp,
        hpMax: pt.props.hpMax,
        moves: [],
        code: pt.props.code
      }
    }

    if (this.pokemonProps.rt.gameState === undefined) {
      this.pokemonProps.rt.gameState = AvatarGameState.move;
    }

    if (this.rt.code === null || this.rt.code === undefined) {
      this.rt.code = 'pokedex/code/default';
    }

    if (this.rt.name === undefined) {
      this.rt.name = pt.props.name;
    }

    // we do not have to schedule write; the first change will apply it
  }

  public async load() {
    let pt = resourceLib.pokedex.getPokedexEntry(this.pokemonProps.pokedexId);
    if (pt === undefined) {
      throw 'cannot find pokemon';
    }

    let sheet = await resourceLib.loadSpriteSheet({
      url: pt.props.skinUrl,
      id: pt.props.skinUrl,
      gridWidth: 4,
      gridHeight: 4,
      cellWidth: 64,
      cellHeight: 64,
      startTileId: 0
    });

    this.skin = new Sprite(
      {
        pos: gridPosToPxPosSafe(this.props.pos),
        gridOffset: { x: -16, y: -34 },
        flipH: false,
        costumeIndex: 0
      },
      sheet);

    let files = await fetchFiles(this.rt.code);
    if (files.length > 0) {
      codeLoader.updateCode(files[0].name, files[0].data);
    }
  }

  public updatePokemonRuntimeProps(func: (pokemon: Pokemon) => void) {
    func(this);
    updateAvatarRuntimeProps(this.id, this.pokemonProps.rt);
  }

  public takeDamage(power: number): DamageResult {
    if (power >= this.rt.hp) {
      this.rt.hp = 0;
      return DamageResult.fainted;
    }

    this.rt.hp -= power;

    return DamageResult.effective;
  }

  public tryCatch(ball: BallKind): boolean {
    let r = rnd.nextRange(0, 1);
    return r > 0.5;
  }
}