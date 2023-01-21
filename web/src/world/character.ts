import { throws } from "assert";
import _ from "lodash";
import { fetchFiles, storeFile, storeFileBackground, updateAvatarRuntimeProps } from "../fetchadapter";
import { gridPosToPxPosSafe } from "../posh/pos";
import { Avatar, AvatarPosChanged } from "./avatar";
import { codeLoader } from "../mechanics/codeloader";
import { AvatarGameState, AvatarProps, WireCharacterProps } from "./iavatar";
import { Pokemon } from "./pokemon";
import { resourceLib } from "../graphics/resourceLib";
import { Sprite } from "../graphics/Sprite";

export type BallBag = {
  red: number,
  blue: number,
  black: number
}

export function createBallBag(): BallBag {
  return { red: 0, blue: 0, black: 0 }
}

export type FoodBag = {
  berry: number,
  banana: number,
}

export function createFoodBag(): FoodBag {
  return { berry: 0, banana: 0 }
}

export type CharacterRuntimeProps = {
  gameState: AvatarGameState,
  name: string;
  balls: BallBag,
  food: FoodBag,
  activePokemons: string[];
  restingPokemons: string[];
  code: string;
}

export type CharacterProps = AvatarProps & {
  skinUrl: string;
  rt: CharacterRuntimeProps;
}

export class Character extends Avatar {
  get rt(): CharacterRuntimeProps { return this.characterProps.rt; }
  set rt(val: CharacterRuntimeProps) { this.characterProps.rt = val; }

  public get characterProps() { return this.props as CharacterProps }

  public constructor(wireProps: WireCharacterProps, posChanged: AvatarPosChanged) {

    let props: CharacterProps = {
      id: wireProps.id,
      layerId: wireProps.layerId,
      pos: wireProps.pos,
      skinUrl: wireProps.skinUrl,
      rt: JSON.parse(wireProps.rt)
    }

    super(props, posChanged);

    // make sure arrays are populated
    if (this.characterProps.rt === undefined || this.characterProps.rt === null) {
      this.characterProps.rt = {
        gameState: AvatarGameState.move,
        name: this.id,
        activePokemons: [],
        restingPokemons: [],
        food: createFoodBag(),
        balls: createBallBag(),
        code: "avatar/defaultbot",
      }
    }

    if (this.characterProps.rt.gameState === undefined) {
      this.characterProps.rt.gameState = AvatarGameState.move;
    }

    if (this.characterProps.rt.food === undefined) {
      this.characterProps.rt.food = createFoodBag();
    }

    if (this.characterProps.rt.balls === undefined) {
      this.characterProps.rt.balls = createBallBag();
    }
  }

  public async load() {
    let sheet = await resourceLib.loadSpriteSheet({
      url: this.characterProps.skinUrl,
      id: this.characterProps.skinUrl,
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

    if (this.rt.code === null || this.rt.code === undefined) {
      this.rt.code = 'avatar/' + this.props.id;
    }

    let files = await fetchFiles(this.rt.code);
    if (files.length > 0) {
      codeLoader.updateCode(files[0].name, files[0].data);
    }
  }

  public restPokemon(a2: Pokemon) {
    a2.updatePokemonRuntimeProps((pokemon: Pokemon) => {
      a2.gameState = AvatarGameState.resting;
      a2.clearLayer();
    });

    _.remove(this.characterProps.rt.activePokemons, (x) => x === a2.id);
    this.characterProps.rt.restingPokemons.push(a2.id);
    updateAvatarRuntimeProps(this.id, this.characterProps.rt);
  }

  public caughtPokemon(pokemon: Pokemon) {
    pokemon.updatePokemonRuntimeProps((pokemon: Pokemon) => {
      pokemon.gameState = AvatarGameState.resting;
      pokemon.clearLayer();
      pokemon.rt.ownerId = this.props.id;
    });

    this.characterProps.rt.restingPokemons.push(pokemon.id);
    updateAvatarRuntimeProps(this.id, this.characterProps.rt);
  }
}
