import { IGameCollisionHandler, IGamePhysics, IGamePhysicsInputController, RigitCollisionHandler } from "./igamephysics";
import { IGameMap } from "../voxel/igamemap";
import { IRigitBody } from "./voxelmeshmodel";
import _ from "lodash";

// manages movement and collisions between world objects
export class GamePhysics implements IGamePhysics {
  private map: IGameMap;
  private bodies: IRigitBody[] = [];
  private collisionHandler?: IGameCollisionHandler;
  private lastTick: number = 0;
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

  public async update(tick: number): Promise<void> {
    let dt = tick - this.lastTick;
    if (dt <= 0) {
      return;
    }

    await this.input?.onBeforeMove(tick);

    dt = dt / 1000;

    for (let o of this.bodies) {
      let s = o.speed;
      s.divideScalar(dt);
      let p = o.position;
      o.onMove(p.add(s));
    }

    this.lastTick = tick;
    this.input?.onAfterMove();
  }
}

