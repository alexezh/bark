import { Vector3 } from "three";

export enum RigitBodyKind {
  sprite,
  block,
  boundary
}

// interface for physics engine to work with sprites
// from physics perspective, we deal with speed and impulses
// interactivity (keyboard) is done at higher level
// such as when we do wall jump, contact with the wall will 0 the speed
// similarly, the sprite can zero out the speed when reaching position
export interface IRigitBody {
  get id(): number;
  get kind(): RigitBodyKind;
  get inactive(): boolean;
  // owner set by application
  get owner(): any;

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
  get worldSpeed(): Vector3;

  /**
   * set an updated speed (adjusted to possible collision and gravity)
   */
  adjustWorldSpeed(speed: Vector3): void;

  /**
   * returns current position
   */
  get position(): Vector3;
  get size(): Vector3;

  onMove(pos: Vector3): void;
}
