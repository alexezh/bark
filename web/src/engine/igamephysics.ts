import { IAnimatable } from "./animator";
import { IAvatar } from "../world/iavatar";
import { MoveDirection } from "../mechanics/iavatarapi";
import { SpriteMoveAnimationProps } from "./spritemoveanimation";
import { GridPos } from "../posh/pos";

export type MoveAvatarParams = {
  avatar: IAvatar;
  dir: MoveDirection;
  animator: (props: SpriteMoveAnimationProps) => IAnimatable
}

export interface IGamePhysics {
  moveAvatarInteractive(params: MoveAvatarParams, canCancel: boolean): void;
  moveAvatar(params: MoveAvatarParams): boolean;
  moveAvatarRemote(avatar: IAvatar, pos: GridPos, func: (props: SpriteMoveAnimationProps) => IAnimatable): boolean;
  attachCollisionHandler(handler?: IGameCollisionHandler): void;
}

export interface IGameCollisionHandler {
  onCollision(a1: IAvatar, a2: IAvatar): void;
  // return true if we should continue
  //onLocation(a: IAvatar, loc: MapLocation): boolean;
}