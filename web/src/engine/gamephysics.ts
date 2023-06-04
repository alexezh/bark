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
  private broadphase: BroadphaseCollision = new BroadphaseCollision();
  private gravity: number = 10;
  private collisionHandler?: IGameCollisionHandler;
  private input?: IGamePhysicsInputController;
  private _collideHandler: RigitCollisionHandler | undefined;
  private static collideHandlerSymbol = Symbol('CollideHandler');

  public constructor(map: IVoxelLevel) {
    this.map = map;
  }

  public attachInputController(handler?: IGamePhysicsInputController) {
    this.input = handler;
  }

  public attachCollisionHandler(handler?: IGameCollisionHandler) {
    this.collisionHandler = handler;
  }

  public addRigitObject(ro: IRigitBody): void {
    this.bodies.push(ro);
  }

  public setCollideHandler(func: RigitCollisionHandler | undefined) {
    this._collideHandler = func;
  }

  public removeRigitObject(ro: IRigitBody): void {
    // ATT: we do not expect this happen often
    _.remove(this.bodies, (x: IRigitBody) => { return x === ro });
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

    for (let o of this.bodies) {
      // clone speed so we can apply dt to it
      let s = o.worldSpeed.clone();

      if (o.gravityFactor === 0 || (s.x === 0 && s.y === 0 && s.z === 0)) {
        continue;
      }

      s.multiplyScalar(dt);
      let p = o.position.clone().add(s);

      let newSpeed: Vector3 | undefined = undefined;
      if (o.gravityFactor > 0) {
        let delta = this.detectSurface(o, p, dt);
        if (delta.deltaPosY != 0) {
          p.setY(p.y + delta.deltaPosY);
        }
        if (delta.deltaSpeedY != 0) {
          newSpeed = o.worldSpeed.clone();
          newSpeed.setY(newSpeed.y + delta.deltaSpeedY);
        }
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
        o.setPhysicsSpeed(new Vector3(0, 0, 0));
        collisions.push({ source: o, target: intersectBody! });
      } else {
        o.onMove(p);
        if (newSpeed) {
          o.setPhysicsSpeed(newSpeed);
        }
      }
    }

    if (collisions.length > 0) {
      this._collideHandler?.call(this, collisions);
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
        console.log(`fall: ${pos.y} ${dist} ${dt * this.gravity}`);
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

