import _ from "lodash";
import { IGameCollisionHandler, IGamePhysics, IGamePhysicsInputController, RigitCollisionHandler } from "./igamephysics";
import { IVoxelLevel } from "../ui/ivoxellevel";
import { BroadphaseCollision } from "./broadphasecollision";
import { Vector3 } from "three";
import { IRigitBody, RigitBodyKind } from "../voxel/irigitbody";
import { infiniteDown } from "./voxellevel";
import { MapBoundaryRigitBody } from "../voxel/mapblockrigitbody";

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
    // clone speed so we can apply dt to it
    let s = o.getWorldSpeed();

    if (o.gravityFactor === 0 || (s.x === 0 && s.y === 0 && s.z === 0)) {
      return;
    }

    s.multiplyScalar(dt);
    let p = o.position.clone().add(s);

    let deltaSpeedY: number | undefined;
    let intersectBody: IRigitBody | undefined;
    let intersectHeight: number | undefined;
    let collided = false;

    // first check if we collided with surface and we can level
    /*
    if (o.gravityFactor > 0) {
      let delta = this.detectSurface(o, p, dt);
      if (delta.deltaPosY != 0) {
        p.y += delta.deltaPosY;
      }
      deltaSpeedY = delta.deltaSpeedY;

      if (delta.collided) {
        intersectBody = new MapBoundaryRigitBody(new Vector3(o.position.x, 0, o.position.z), new Vector3(0, 0, 0));
        collided = true;
      }
    }
    */

    // if we only collide with sprites, skip collision check
    collided = this.level.intersectBlocks(o, p, (target: IRigitBody, levelHeight: number) => {
      // just check if there is a block
      intersectBody = target;
      intersectHeight = levelHeight;
      return true;
    });

    // when we stand on surface, we constantly trying to move down
    // and going back up. We do not want to notify about collision for such
    // trivial cases.
    let standing = false;

    if (collided) {
      console.log('collided: ' + intersectHeight! + ' ' + o.name);
      if (o.rigitKind === RigitBodyKind.object) {
        if (p.y + o.maxClimbSpeed > intersectHeight!) {
          p.y = intersectHeight!;
          collided = false;
          standing = true;
        }
      }
    }

    if (collided) {
      // if we collide, we do not move; but we keep user speed untouched??
      o.setPhysicsSpeed(undefined);
      collisions.push({ source: o, target: intersectBody! });
    } else {
      o.onMove(p);

      // gravity !!!
      if (!standing) {
        o.setPhysicsSpeed(new Vector3(0, o.physicsSpeed.y - dt * this.gravity * o.gravityFactor, 0));
        if (o.name === 'pl') {
          console.log('Pl: ' + o.position.x + ' ' + o.position.z + ' ' + o.relativeSpeed.y + ' ' + o.physicsSpeed.y);
        }
      } else {
        o.setPhysicsSpeed(undefined);
      }
    }
  }

  /**
   * adjusts position to surface
   * updates pos and speed if needed
   */
  private detectSurface(o: IRigitBody, pos: Vector3, dt: number): { deltaPosY: number, deltaSpeedY: number, collided: boolean } {
    let dist = this.level.getDistanceY(o, pos);

    // if we are above the ground, apply gravity
    if (dist > 0) {
      if (dist === infiniteDown) {
        //console.log(`fall: ${pos.y} ${dist} ${dt * this.gravity}`);
        return {
          deltaPosY: 0,
          deltaSpeedY: -dt * this.gravity * o.gravityFactor,
          collided: false
        }
      }

      // if we are falling, update our speed. On the next round, we will recompute position
      // and then we will level on the floor
      return {
        deltaPosY: 0,
        deltaSpeedY: -dt * this.gravity * o.gravityFactor,
        collided: false
      }
    } else if (dist < 0) {
      // console.log('climb:' + dist);

      // we need to climb to surface; if we do not collide with map, just move all the way
      if (dist < o.maxClimbSpeed && o.rigitKind === RigitBodyKind.object) {
        return {
          deltaPosY: -dist,
          deltaSpeedY: 0,
          collided: false
        }
      } else {
        return {
          deltaPosY: 0,
          deltaSpeedY: 0,
          collided: true
        }
      }
    }

    return { deltaPosY: 0, deltaSpeedY: 0, collided: false };
  }
}

