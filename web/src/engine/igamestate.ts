import AsyncEventSource from "../AsyncEventSource";
import { GridPos } from "../posh/pos";
import { IGameMap } from "../voxel/igamemap";
import { IAvatar } from "./iavatar";

export interface IGameState {
  map: IGameMap | undefined;
  //avatarCollection: AvatarCollection;
  onLoaded: boolean;
  load(): Promise<boolean>;
  readonly mapLoaded: AsyncEventSource<boolean>;
  spawnCharacter(name: string, skinUrl: string): void;
}

export function setGameState(state: IGameState) {
  gameState = state;
}

export var gameState: IGameState;