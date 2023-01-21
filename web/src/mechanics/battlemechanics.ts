import _ from "lodash";
import { terminal } from "../ui/igameterminal";
import { PokemonProxy } from "./avatarcode";
import { Character } from "../world/character";
import { codeLoader, printCodeException } from "./codeloader";
import { BattleAPI } from "./gamemechanics";
import { AvatarGameState, IAvatar } from "../world/iavatar";
import { BattleAction, BattleActionKind, BattleAttackAction, BattleAttackResult } from "./ibattleapi";
import { gameState } from "../world/igamestate";
import { DamageResult, Pokemon } from "../world/pokemon";

export type BattleToken = {
  a1: Pokemon;
  a2: Pokemon;
  p1: PokemonProxy;
  p2: PokemonProxy;
  pending: Promise<BattleAction> | undefined;
  currentMover: PokemonProxy | undefined;
}

let battles: BattleToken[] = [];

export function startBattle(a1: IAvatar, a2: IAvatar) {
  if (a1.gameState !== AvatarGameState.move || a2.gameState !== AvatarGameState.move) {
    console.log('not in move mode');
    return;
  }

  a1.gameState = AvatarGameState.battle;
  a2.gameState = AvatarGameState.battle;

  battles.push({
    a1: a1 as Pokemon,
    a2: a2 as Pokemon,
    p1: new PokemonProxy((a1 as Pokemon).pokemonProps),
    p2: new PokemonProxy((a2 as Pokemon).pokemonProps),
    pending: undefined,
    currentMover: undefined
  });

  terminal!.print(`start battle ${a1.rt.name} and ${a2.rt.name}`);
}

export function runBattles() {
  let api = new BattleAPI();
  for (let b of battles) {
    runBattleTurn(api, b);
  }
}

function runBattleTurn(api: BattleAPI, token: BattleToken) {
  if (token.pending !== undefined) {
    return;
  }

  let opponent: PokemonProxy;
  if (token.currentMover === undefined || token.currentMover === token.p2) {
    token.currentMover = token.p1;
    opponent = token.p2;
  }
  else {
    token.currentMover = token.p2;
    opponent = token.p1;
  }

  let self = (token.currentMover === token.p1) ? token.a2 : token.a1;
  let codeObj = codeLoader.getCode(self.rt.code);
  try {
    token.pending = codeObj?.battleTurn(token.currentMover, opponent, api);
    token.pending?.then((action) => onCompleteBattleTurn(token, action))
  }
  catch (e) {
    printCodeException(token.currentMover!.name, e);
    _.remove(battles, (x) => x === token);
  }
}

function processBattleAttack(self: Pokemon, opponent: Pokemon, action: BattleAttackAction): BattleAttackResult {

  let move = _.find(self.pokemonProps.rt.moves, (x) => x.name === action.moveId);
  if (move === undefined) {
    terminal?.printError('cannot find move: ' + action.moveId);
    throw Error('Invalid argument');
  }

  let res = opponent.takeDamage(move.power);
  if (res === DamageResult.fainted) {
    terminal?.print(`${opponent.rt.name} fainted`);
    return BattleAttackResult.fainted;
  }

  terminal?.print(`${opponent.rt.name}'s hit was ${res.toString()}`);

  return BattleAttackResult.continue;
}

function onCompleteBattleTurn(token: BattleToken, action: BattleAction) {
  token.pending = undefined;
  if (action === undefined || action.kind === BattleActionKind.run) {
    endBattle(token);
  } else if (action.kind == BattleActionKind.attack) {
    let opponent = (token.currentMover === token.p1) ? token.a2 : token.a1;

    let res = processBattleAttack(
      (token.currentMover === token.p1) ? token.a1 : token.a2,
      opponent,
      action as BattleAttackAction);

    if (res === BattleAttackResult.fainted) {
      if (token.a2.hasOwner) {
        let owner = gameState.avatarCollection.getAvatar(token.a2.rt.ownerId);
        (owner as Character)?.restPokemon(token.a2);
      } else {
        gameState.removePokemon(token.a2);
        opponent.gameState = AvatarGameState.removed;
      }
      endBattle(token);
      terminal!.print(`${token.p2.name} fainted`);
    }
  }
}

function endBattle(token: BattleToken) {
  if (token.a1.gameState === AvatarGameState.battle)
    token.a1.gameState = AvatarGameState.move;
  if (token.a2.gameState === AvatarGameState.battle)
    token.a2.gameState = AvatarGameState.move;
  _.remove(battles, (x) => x === token);
  terminal!.print(`end battle ${token.p1.name} and ${token.p2.name}`);
}
