import _ from "lodash";
import { terminal } from "../ui/igameterminal";
import { CharacterProxy, PokemonProxy } from "./avatarcode";
import { Character } from "../world/character";
import { codeLoader, printCodeException } from "./codeloader";
import { AvatarGameState } from "../world/iavatar";
import { CatchAction, CatchActionKind, FeedAction, ICatchAPI, ThrowBallAction } from "./icatchapi";
import { gameState } from "../world/igamestate";
import { BallKind, Pokemon } from "../world/pokemon";

export class CatchAPI implements ICatchAPI {
  makeLeaveAction(): CatchAction {
    return { kind: CatchActionKind.leave };
  }
  makeCatchAction(ball: string): ThrowBallAction {
    return { kind: CatchActionKind.catch, ball: ball };
  }
  makeFeedAction(item: string): FeedAction {
    return { kind: CatchActionKind.feed, item: item };
  }
  prompt(s: string): Promise<string> {
    return terminal!.prompt(s);
  }
  promptMenu(s: string): Promise<string> {
    return terminal!.promptMenu(s);
  }
}

export type CatchToken = {
  character: Character;
  pokemon: Pokemon;
  p1: CharacterProxy;
  p2: PokemonProxy;
  pending: Promise<CatchAction> | undefined;
  currentMover: PokemonProxy | CharacterProxy | undefined;
}


let catches: CatchToken[] = [];

export function startCatch(character: Character, pokemon: Pokemon) {
  if (character.gameState !== AvatarGameState.move || pokemon.gameState !== AvatarGameState.move) {
    console.log('not in move mode');
    return;
  }

  character.gameState = AvatarGameState.catch;
  pokemon.gameState = AvatarGameState.catch;

  catches.push({
    character: character,
    pokemon: pokemon,
    p1: new CharacterProxy(character.characterProps),
    p2: new PokemonProxy(pokemon.pokemonProps),
    pending: undefined,
    currentMover: undefined
  });

}

export function runCatch() {
  for (let b of catches) {
    runCatchTurn(b);
  }
}

function runCatchTurn(token: CatchToken) {
  let api = new CatchAPI();
  if (token.pending !== undefined) {
    return;
  }

  let codeObj = codeLoader.getCode(token.character.rt.code);
  try {
    token.pending = codeObj?.catchTurn(token.p1, token.p2, api);
    token.pending?.then((action) => onCompleteCatchTurn(token, action))
  }
  catch (e) {
    printCodeException(token.p1!.name, e);
    _.remove(catches, (x) => x === token);
  }
}

function onCompleteCatchTurn(token: CatchToken, action: CatchAction) {
  token.pending = undefined;
  if (action === undefined || action.kind === CatchActionKind.leave) {
    endCatch(token);
  } else if (action.kind == CatchActionKind.catch) {
    let catchAction = action as ThrowBallAction;
    let ballCount = (token.character.rt.balls as any)[catchAction.ball];
    if (ballCount === undefined || ballCount === 0) {
      terminal?.printError(`You do not have a ${catchAction.ball}`);
      return;
    }

    (token.character.rt.balls as any)[catchAction.ball] = ballCount - 1;
    if (!token.pokemon.tryCatch(catchAction.ball as BallKind)) {
      terminal?.printError(`${token.pokemon.rt.name} escaped the ball`);
      return;
    }

    if (token.pokemon.layer !== undefined) {
      token.pokemon.layer.removeAvatar(token.pokemon);
    }

    token.character.caughtPokemon(token.pokemon);
    terminal?.print(`You cauugh ${token.pokemon.rt.name}`);
    endCatch(token);
  }
}

function endCatch(token: CatchToken) {
  if (token.character.gameState === AvatarGameState.catch)
    token.character.gameState = AvatarGameState.move;
  if (token.pokemon.gameState === AvatarGameState.catch)
    token.pokemon.gameState = AvatarGameState.move;
  _.remove(catches, (x) => x === token);
  terminal!.print(`end catch of ${token.p1.name}`);
}
