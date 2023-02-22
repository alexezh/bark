import { IAnimatable } from "./animator";
import { Sprite3 } from "./sprite3";
import { ICollidable } from "./icollidable";
import { Vector3 } from "three";

export type CreateMoveAnimation = (sprite: Sprite3, pos: Vector3) => IAnimatable;

export interface IGamePhysics {
  moveSpriteInteractive(sprite3: Sprite3, pos: Vector3, animation: CreateMoveAnimation, canCancel: boolean): void;
  moveSprite(sprite3: Sprite3, pos: Vector3, animation: CreateMoveAnimation): boolean;
  //moveAvatarRemote(sprite: Sprite3, pos: GridPos, func: (props: SpriteMoveAnimationProps) => IAnimatable): boolean;
  attachCollisionHandler(handler?: IGameCollisionHandler): void;
}

export interface IGameCollisionHandler {
  onCollision(a1: ICollidable, a2: ICollidable): void;
  // return true if we should continue
  //onLocation(a: IAvatar, loc: MapLocation): boolean;
}
