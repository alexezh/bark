import { IRigitBody } from "../voxel/irigitbody";
import { IAnimatable } from "./animator";
import { Sprite3 } from "./sprite3";
import { Vector3 } from "three";

export type CreateMoveAnimation = (sprite: Sprite3, pos: Vector3) => IAnimatable;

export interface IGamePhysicsInputController {
  // called before physics evaluates parameters
  // good chance for sprite to handle keyboard
  //onBeforeMove(tick: number);
  //onAfterMove();
}

export type RigitCollisionHandler = (collisions: { source: IRigitBody, target: IRigitBody }[]) => void;

export interface IGamePhysics {
  addRigitObject(ro: IRigitBody, onCollide: RigitCollisionHandler | undefined): void;
  removeRigitObject(ro: IRigitBody): void;
  update(tick: number): void;
  attachInputController(handler?: IGamePhysicsInputController);
  setCollideHandler(func: RigitCollisionHandler | undefined);
  //moveAvatarRemote(sprite: Sprite3, pos: GridPos, func: (props: SpriteMoveAnimationProps) => IAnimatable): boolean;
  //attachCollisionHandler(handler?: IGameCollisionHandler): void;
}

export interface IGameCollisionHandler {
  //onCollision(a1: ICollidable, a2: ICollidable): void;
  // return true if we should continue
  //onLocation(a: IAvatar, loc: MapLocation): boolean;
}
