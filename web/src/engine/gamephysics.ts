import _ from "lodash";
import { IGameCollisionHandler, IGamePhysics, IGamePhysicsInputController, RigitCollisionHandler } from "./igamephysics";
import { IVoxelLevel } from "../ui/ivoxellevel";
import { BroadphaseCollision } from "./broadphasecollision";
import { Vector3 } from "three";
import { IRigitBody, RigitBodyKind } from "../voxel/irigitbody";
import { infiniteDown, infiniteUp } from "./voxellevel";
import { MapBoundaryRigitBody } from "../voxel/mapblockrigitbody";

export const epsilon = 0.01;
export const nepsilon = -0.01;

// manages movement and collisions between world objects
export class GamePhysics implements IGamePhysics {
  private level: IVoxelLevel;
  private bodies: IRigitBody[] = [];
  private projectiles: IRigitBody[] = [];
  private broadphase: BroadphaseCollision = new BroadphaseCollision();
  private gravity: number = 20;
  private _collideHandler: RigitCollisionHandler | undefined;
  private static collideHandlerSymbol = Symbol('CollideHandler');
  public constructor(level: IVoxelLevel) {
    this.level = level;
  }

  public setGravity(val: number): void {
    this.gravity = val;
  }

  public addRigitObject(ro: IRigitBody): void {
    this.bodies.push(ro);
  }

  public removeRigitObject(ro: IRigitBody): void {
    // ATT: we do not expect this happen often
    _.remove(this.bodies, (x: IRigitBody) => { return x === ro });
  }

  public addProjectile(ro: IRigitBody): void {
    this.projectiles.push(ro);
  }

  public removeProjectile(ro: IRigitBody): void {
    // ATT: we do not expect this happen often
    _.remove(this.projectiles, (x: IRigitBody) => { return x === ro });
  }

  public setCollideHandler(func: RigitCollisionHandler | undefined) {
    this._collideHandler = func;
  }

  public update(dt: number): void {
    if (dt <= 0) {
      return;
    }

    this.handleMapCollisions(dt);

    // now check collisiopn of bodies
    let pairs = this.broadphase.getPairs(this.bodies);
    for (let pair in pairs) {

    }
    //this.input?.onAfterMove();
  }

  private handleMapCollisions(dt: number) {
    let collisions: { source: IRigitBody, target: IRigitBody }[] = [];

    for (let o of this.projectiles) {
      this.handleMapCollision(o, dt, collisions)
    }

    for (let o of this.bodies) {
      this.handleMapCollision(o, dt, collisions)
    }

    if (collisions.length > 0) {
      this._collideHandler?.call(this, collisions);
    }
  }

  private handleMapCollision(o: IRigitBody, dt: number, collisions: { source: IRigitBody, target: IRigitBody }[]) {
    if (o.gravityFactor === 0) {
      return;
    }

    // we expect speed to be mutable
    let s = o.getWorldSpeed();

    // if we are standing and speed is 0, nothing to do
    //if (o.rigitKind === RigitBodyKind.object && o.standing && s.x === 0 && s.y === 0 && s.z === 0) {
    //  return;
    //}

    s.multiplyScalar(dt);
    let p = o.position.clone().add(s);

    let collided = false;

    // if we only collide with sprites, skip collision check
    let distance = this.level.getDistanceY(o, p);

    // when we stand on surface, we constantly trying to move down
    // and going back up. We do not want to notify about collision for such
    // trivial cases.
    let standing = o.standing;

    if (distance.distance < nepsilon) {
      // for objects, climb back if we are not too deep
      if (o.rigitKind === RigitBodyKind.object) {
        if (o.maxClimbSpeed > Math.abs(distance.distance)) {
          //console.log('standing: ' + intersectHeight! + ' ' + o.name);
          p.y -= distance.distance;
          collided = false;
          standing = true;
        } else {
          collided = true;
        }
      } else {
        collided = true;
      }
    } else if (distance.distance > epsilon) {
      // if we above and we were standing previous round, see if we can get down
      // by applying gravity
      let gravityDy = dt * this.gravity * o.gravityFactor;
      if (o.rigitKind === RigitBodyKind.object) {
        if (distance.distance <= gravityDy) {
          p.y -= distance.distance;
          standing = true;
        } else {
          p.y -= gravityDy;
        }
      }
    }

    //console.log('coord:' + p.y + ' ' + distance.distance);

    if (collided) {
      // if we collide, we do not move; but we keep user speed untouched??
      o.setPhysicsSpeed(undefined);
      collisions.push({ source: o, target: distance.intersectBody! });
    } else {
      o.onMove(p);

      // gravity !!!
      if (!standing) {
        //if (o.standing) {
        //console.log('not standing');
        //}
        o.setStanding(false);
        o.setPhysicsSpeed(new Vector3(0, o.physicsSpeed.y - dt * this.gravity * o.gravityFactor, 0));
        //if (o.name === 'pl') {
        //  console.log('Pl: ' + o.position.x + ' ' + o.position.z + ' ' + o.relativeSpeed.y + ' ' + o.physicsSpeed.y);
        //}
      } else {
        //console.log('standing');
        o.setStanding(true);
        o.setPhysicsSpeed(undefined);
      }
    }
  }
}

