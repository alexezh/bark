import { Ticker as PixiTicker } from "pixijs";
import { IGamePhysics } from "../graphics/igamephysics";
import { AvatarCollection } from "../world/avatarcollection";
import { IAvatar } from "../world/iavatar";
import { IGameMap } from "../world/igamemap";
import { GameMechanics } from "./gamemechanics";

export interface IGameMechanics {
  start(ticker: PixiTicker): unknown;
  addLiveAvatar(avatar: IAvatar): void;
  removeLiveAvatar(avatar: IAvatar): void;
}

export let gameMechanics: IGameMechanics;
export function createGameMechanics(map: IGameMap, physics: IGamePhysics, avatarCollection: AvatarCollection): IGameMechanics {
  gameMechanics = new GameMechanics(map, physics, avatarCollection);
  return gameMechanics;
}