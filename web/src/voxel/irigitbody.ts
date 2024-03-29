import { Vector3 } from "three";
import { IRigitModel } from "../engine/irigitmodel";

export enum RigitBodyKind {
  object,
  block,
  boundary,
  projectile
}

export enum MassKind {
  stationary,
  moveable,
}

export type RigitAABB = {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
  zStart: number;
  zEnd: number;
}

// interface for physics engine to work with sprites
// from physics perspective, we deal with speed and impulses
// interactivity (keyboard) is done at higher level
// such as when we do wall jump, contact with the wall will 0 the speed
// similarly, the sprite can zero out the speed when reaching position
export interface IRigitBody {
  get id(): number;
  get name(): string;
  get rigitKind(): RigitBodyKind;
  // owner set by application
  get owner(): any;
  get rigit(): IRigitModel | undefined;
  get standing(): boolean;

  /**
   * multiplier for gravity. 0 is weightless, not affected by gravity
   * 1 is normal
   */
  get gravityFactor(): number;

  /**
   * max amount this sprite can climb (in pixels) in a second
   */
  get maxClimbSpeed(): number;


  /**
   * speed is in pixels per second before applying gravity or collisions
   * sprite compute speed based on direction
   * physics engine will call adjustWorldSpeed once final compute is done
   */
  getWorldSpeed(): Vector3;

  /**
   * speed relative to current direction
   */
  get relativeSpeed(): Vector3;

  /**
   * preturns current position
   */
  get position(): Vector3;

  /**
   * TODO: need actual rigit size instead of block size
   */
  get modelSize(): Vector3;

  /**
   * speed assigned by physics
   */
  get physicsSpeed(): Vector3;

  /**
   * get aabb of the body
   */
  aabb(pos: Vector3 | undefined): RigitAABB;

  /**
   * set an updated speed (adjusted to possible collision and gravity)
   */
  setPhysicsSpeed(speed: Vector3 | undefined): void;

  /**
   * set by physics engine to indicate that object is standing
   */
  setStanding(standing: boolean): void;

  /**
   * update position from physics engine based on slope, gravity and collision
   */
  onMove(pos: Vector3): void;
}
