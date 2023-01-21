import { IAvatar } from "../world/iavatar";

export interface IBattleCode {
}

export enum BattleActionKind {
  run,
  attack,
  defend
}

export type BattleAction = {
  kind: BattleActionKind
}

export type BattleAttackAction = BattleAction & {
  moveId: string;
}

export enum BattleAttackResult {
  continue,
  retreat,
  fainted
}

export interface IBattleAPI {
  prompt(s: string): Promise<string>;
  makeRunAction(): BattleAction;
  makeAttackAction(moveId: string): BattleAttackAction;
}