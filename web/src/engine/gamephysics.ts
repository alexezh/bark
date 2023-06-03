import _ from "lodash";
import { IGameCollisionHandler, IGamePhysics, IGamePhysicsInputController, RigitCollisionHandler } from "./igamephysics";
import { IVoxelLevel } from "../ui/ivoxellevel";
import { BroadphaseCollision } from "./broadphasecollision";
import { Vector3 } from "three";
import { IRigitBody } from "../voxel/irigitbody";

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
      let s = o.worldSpeed.clone();

      if (o.gravityFactor === 0 || (s.x === 0 && s.y === 0 && s.z === 0)) {
        continue;
      }

      s.multiplyScalar(dt);
      let p = o.position.clone().add(s);

      if (o.gravityFactor > 0) {
        p = this.detectSurface(o, p, dt);
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
        if (o.name === 'monky') {
          console.log('collided');
        }
        o.adjustWorldSpeed(new Vector3(0, 0, 0));
        collisions.push({ source: o, target: intersectBody! });
      } else {
        if (p.y === 0) {
          console.log('zero');
        }
        o.onMove(p);
      }
    }

    if (collisions.length > 0) {
      this._collideHandler?.call(this, collisions);
    }
  }

  /**
   * adjusts position to surface
   */
  private detectSurface(o: IRigitBody, pos: Vector3, dt: number): Vector3 {
    let dist = this.map.getDistanceY(o, pos);
    if (dist === -100000000) {
      dist = this.map.getDistanceY(o, pos);
    }
    if (dist < 0) {
      //console.log(`fall: ${pos.y} ${dist} ${dt * this.gravity}`);
      pos.setY(pos.y - dt * this.gravity);
    } else if (dist > 0) {
      //console.log('climb:' + dist);
      if (dist < o.maxClimbSpeed) {
        pos.setY(pos.y + dist);
        return pos;
      }
    }
    return pos;
  }
}

