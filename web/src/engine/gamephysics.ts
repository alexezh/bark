import _ from "lodash";
import { IGameCollisionHandler, IGamePhysics, IGamePhysicsInputController, RigitCollisionHandler } from "./igamephysics";
import { IVoxelLevel } from "../ui/ivoxellevel";
import { BroadphaseCollision } from "./broadphasecollision";
import { Vector3 } from "three";
import { IRigitBody } from "../voxel/irigitbody";
import { infiniteDown } from "./voxellevel";

// manages movement and collisions between world objects
export class GamePhysics implements IGamePhysics {
  private map: IVoxelLevel;
  private bodies: IRigitBody[] = [];
  private projectiles: IRigitBody[] = [];
  private broadphase: BroadphaseCollision = new BroadphaseCollision();
  private gravity: number = 10;
  private _collideHandler: RigitCollisionHandler | undefined;
  private static collideHandlerSymbol = Symbol('CollideHandler');

  public constructor(map: IVoxelLevel) {
    this.map = map;
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
    if (o.gravityFactor > 0) {
      let delta = this.detectSurface(o, p, dt);
      if (delta.deltaPosY != 0) {
        p.y += delta.deltaPosY;
      }
      deltaSpeedY = delta.deltaSpeedY;
    }

    // check if intersecs with the map
    let intersectBody: IRigitBody | undefined;
    let collided = this.map.intersectBlocks(o, p, (target: IRigitBody) => {
      // just check if there is a block
      intersectBody = target;
      return true;
    });

    // when we stand on surface, we constantly trying to move down
    // and going back up. We do not want to notify about collision for such
    // trivial cases. 
    if (collided) {
      // if we collide, we do not move; but we keep user speed untouched??
      o.setPhysicsSpeed(undefined);
      collisions.push({ source: o, target: intersectBody! });
    } else {
      o.onMove(p);
      if (deltaSpeedY !== undefined) {
        o.setPhysicsSpeed(new Vector3(0, o.physicsSpeed.y + deltaSpeedY, 0));
      } else {
        o.setPhysicsSpeed(undefined);
      }
    }
  }

  /**
   * adjusts position to surface
   * updates pos and speed if needed
   */
  private detectSurface(o: IRigitBody, pos: Vector3, dt: number): { deltaPosY: number, deltaSpeedY: number } {
    let dist = this.map.getDistanceY(o, pos);
    if (dist < 0) {
      if (dist === infiniteDown) {
        //console.log(`fall: ${pos.y} ${dist} ${dt * this.gravity}`);
      }
      return {
        deltaPosY: -dt * this.gravity,
        deltaSpeedY: -dt * this.gravity
      }
    } else if (dist > 0) {
      //console.log('climb:' + dist);
      if (dist < o.maxClimbSpeed) {
        return {
          deltaPosY: dist,
          deltaSpeedY: 0
        }
      }
    }
    return { deltaPosY: 0, deltaSpeedY: 0 };
  }
}

