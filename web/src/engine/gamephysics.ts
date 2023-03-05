import { IGameCollisionHandler, IGamePhysics, IGamePhysicsInputController, RigitCollisionHandler } from "./igamephysics";
import { IGameMap, MapBlock } from "../voxel/igamemap";
import { IRigitBody } from "./voxelmeshmodel";
import _ from "lodash";
import { BroadphaseCollision } from "./broadphasecollision";
import { WorldCoord3 } from "../voxel/pos3";

// manages movement and collisions between world objects
export class GamePhysics implements IGamePhysics {
  private map: IGameMap;
  private bodies: IRigitBody[] = [];
  private broadphase: BroadphaseCollision = new BroadphaseCollision();
  private collisionHandler?: IGameCollisionHandler;
  private input?: IGamePhysicsInputController;
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

  public addRigitObject(ro: IRigitBody, onCollide: RigitCollisionHandler | undefined): void {
    this.bodies.push(ro);
    this.setCollideHandler(ro, onCollide);
  }

  public setCollideHandler(ro: IRigitBody, func: RigitCollisionHandler | undefined) {
    // @ts-ignore
    ro[this.collisionHandler] = func;
  }

  public removeRigitObject(ro: IRigitBody): void {
    // ATT: we do not expect this happen often
    _.remove(this.bodies, (x: IRigitBody) => { return x === ro });
  }

  public async update(dt: number): Promise<void> {
    if (dt <= 0) {
      return;
    }

    await this.input?.onBeforeMove(dt);

    for (let o of this.bodies) {
      if (o.inactive) {
        continue;
      }
      let s = o.speed;
      s.multiplyScalar(dt);
      let p = o.position.add(s);

      o.onMove(p);
      let intersectBlock: MapBlock | undefined;
      let intersectPos: WorldCoord3 | undefined;
      if (this.map.intersectBlocks(o, p, (block: MapBlock, blockPos: WorldCoord3) => {
        // just check if there is a block
        intersectBlock = block;
        intersectPos = blockPos;
        return true;
      })) {
        
      }
    }

    let pairs = this.broadphase.getPairs(this.bodies);

    this.input?.onAfterMove();
  }
}

