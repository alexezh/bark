import { GridPos } from "../posh/pos";
import { MoveDirection } from "../mechanics/iavatarapi";
import { Sprite } from "../engine/Sprite";

export type AvatarProps = {
  id: string;
  layerId?: string;
  pos?: GridPos;
}

export type WireCharacterProps = AvatarProps & {
  skinUrl: string;
  rt: string;
}

export type WirePokemonProps = AvatarProps & {
  pokedexId: string;
  kind: string;
  rt: string;
}

export type WireAvatarProps = {
  character?: WireCharacterProps;
  pokemon?: WirePokemonProps;
}

export enum AvatarGameState {
  move,
  removed,
  battle,
  catch,
  resting,
  suspended
}

export interface IAvatar {
  get props(): AvatarProps;
  get rt(): any;
  set rt(val: any);
  get id(): string;
  get stepDuration(): number;
  dir: MoveDirection;
  get currentPosVersion(): number;

  get currentPos(): GridPos | undefined;
  set currentPos(pos: GridPos | undefined);
  nextPos?: GridPos;
  gameState: AvatarGameState;

  skin?: Sprite;

  onRemoteUpdateCurrentPos(pos: GridPos | undefined): void;
  getCode(): string;
  updateCode(code: string): void;
  updateRuntimeProps(props: any): void;
  attachCamera(func: ((avatar: IAvatar) => void) | undefined): void;
}

