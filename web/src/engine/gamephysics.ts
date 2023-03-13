import { IGameCollisionHandler, IGamePhysics, IGamePhysicsInputController, RigitCollisionHandler } from "./igamephysics";
import { IGameMap, MapBlock } from "../voxel/igamemap";
import { IRigitBody } from "./voxelmeshmodel";
import _ from "lodash";
import { BroadphaseCollision } from "./broadphasecollision";
import { WorldCoord3 } from "../voxel/pos3";
import { Vector3 } from "three";
import { MapBlockRigitBody } from "../voxel/mapblockrigitbody";

// manages movement and collisions between world objects
export class GamePhysics implements IGamePhysics {
  private map: IGameMap;
  private bodies: IRigitBody[] = [];
  private broadphase: BroadphaseCollision = new BroadphaseCollision();
  private collisionHandler?: IGameCollisionHandler;
  private input?: IGamePhysicsInputController;
  private _collideHandler: RigitCollisionHandler | undefined;
  private static collideHandlerSymbol = Symbol('CollideHandler');

  public constructor(map: IGameMap) {
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

    let collisions: IRigitBody[] = [];

    for (let o of this.bodies) {
      if (o.inactive) {
        continue;
      }
      let s = o.speed.clone();
      s.multiplyScalar(dt);
      let p = o.position.add(s);

      let intersectBody: IRigitBody | undefined;
      if (this.map.intersectBlocks(o, p, (target: IRigitBody) => {
        // just check if there is a block
        intersectBody = target;
        return true;
      })) {
        o.setSpeed(new Vector3(0, 0, 0));
        o.setCollision(intersectBody!);
        collisions.push(o);
      } else {
        o.onMove(p);
      }
    }

    if (collisions.length > 0) {
      this._collideHandler?.call(this, collisions);
    }

    //let pairs = this.broadphase.getPairs(this.bodies);

    //this.input?.onAfterMove();
  }
}

