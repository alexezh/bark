import { SayAction } from "./iavatarapi";

export enum CatchActionKind {
  leave,
  catch,
  feed
}

export type CatchAction = {
  kind: CatchActionKind
}

export type ThrowBallAction = CatchAction & {
  ball: string;
}

export type FeedAction = CatchAction & {
  item: string;
}

export enum CatchResult {
  ranaway,
  escapedball,
  caught
}

export interface ICatchAPI {
  prompt(s: string): Promise<string>;
  promptMenu(s: string): Promise<string>;
  makeLeaveAction(): CatchAction;
  makeCatchAction(ball: string): ThrowBallAction;
  makeFeedAction(item: string): FeedAction;
}