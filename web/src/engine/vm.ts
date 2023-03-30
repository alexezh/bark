import { Clock, Vector3 } from "three";
import AsyncEventSource from "./AsyncEventSource";
import { ICamera } from "./icamera";
import { animator } from "./animator";
import { FrameClock } from "./clock";
import { VoxelLevel } from "./voxellevel";
import { GamePhysics } from "./gamephysics";
import { IDigGame } from "./idiggame";
import { IGamePhysics, RigitCollisionHandler } from "./igamephysics";
import { IVM, setVM } from "./ivm";
import { Sprite3 } from "./sprite3";
import { Ticker } from "./ticker";
import { IRigitBody, VoxelAnimationCollection } from "../voxel/voxelmeshmodel";
import { IRigitModel } from "./irigitmodel";
import { ParticlePool } from "../voxel/particles";
import { IVoxelLevel, IVoxelLevelFile } from "../ui/ivoxelmap";
import { VoxelLevelFile } from "./voxellevelfile";

export type MessageHandler = (msg: string) => Promise<void>;
export type StartHandler = () => Promise<void>;

type CollisionWaiter = {
  // if resolve is undefined, there is no waiter
  // possibly waiter was already completed
  resolve: ((res: IRigitBody | undefined) => void) | undefined;
}

export class VM implements IVM {
  private _running: boolean = false;
  private _ticker!: Ticker;
  private _physics!: GamePhysics;
  private _canvas: HTMLElement;
  private _level?: IVoxelLevel;
  private _levelFile?: IVoxelLevelFile;
  private _camera?: ICamera;
  private _game?: IDigGame;
  private readonly _sprites: Map<number, Sprite3> = new Map<number, Sprite3>();
  private readonly _collisions: WeakMap<IRigitBody, CollisionWaiter> = new WeakMap<IRigitBody, CollisionWaiter>;
  public readonly clock!: FrameClock;

  private readonly onMapChanged: AsyncEventSource<boolean> = new AsyncEventSource();
  private readonly _startHandlers: StartHandler[] = [];
  public particles!: ParticlePool;

  // we are going to copy/write of handler array
  // so it is safe to enumerate even if handler changes it
  private _messageHandlers: Map<string, MessageHandler[]> = new Map<string, MessageHandler[]>;
  //private _sprites: Map

  public get physics(): IGamePhysics { return this._physics; }
  public get level(): IVoxelLevel {
    if (this._level === undefined) throw new Error('not loaded'); return this._level;
  }
  public get levelFile(): IVoxelLevelFile {
    if (this._levelFile === undefined) throw new Error('not loaded');
    return this._levelFile;
  }

  public constructor(canvas: HTMLElement) {
    this._canvas = canvas;
    this.clock = new FrameClock();
  }

  public get canvas(): HTMLElement { return this._canvas; }
  public get camera(): ICamera {
    if (this._camera === undefined) throw new Error('not loaded');
    return this._camera;
  }

  public attachCamera(camera: ICamera) {
    this._camera = camera;
  }

  public registerMapChanged(target: any, func: (val: boolean) => void) {
    this.onMapChanged.add(target, func);
  }

  public async loadGame(GT: { new(): IDigGame }): Promise<IDigGame> {
    let game = new GT();
    await game.init();
    this._game = game;
    return game;
  }

  public async loadLevel(id: string): Promise<void> {
    //this._levelFile = new VoxelLevelFile('levels/default');
    this._level = new VoxelLevel();
    await this._level.load(id);
    this._physics = new GamePhysics(this._level);
    this._physics.setCollideHandler(this.onCollide.bind(this));

    this.loadScene();
    this.onMapChanged.invoke(true);
  }

  public async start(): Promise<void> {
    if (this._game === undefined) {
      return;
    }
    if (this._running) {
      console.log('VM: already running');
      return;
    }

    console.log('VM: start');
    this.camera.canvas.focus();
    this.clock.start();
    this._game.start();

    this._ticker = new Ticker();
    animator.start(this._ticker);
    this._running = true;

    for (let h of this._startHandlers) {
      await h();
    }
  }

  public stop() {
    console.log('VM: stop');
    animator.stop();
    this._game!.stop();
    this._running = false;
  }

  public onRender() {
    if (!this._running) {
      return;
    }

    this.clock.tick();
    this.physics.update(this.clock.delta);
    this.particles.update(this.clock.tick, this.clock.delta)
    let tick = this.clock.lastTick;
    for (let s of this._sprites) {
      s[1].onRender(tick);
    }
  }

  public async createSprite<T extends Sprite3>(
    AT: { new(...args: any[]): T; },
    uri: string,
    pos: Vector3,
    rm: IRigitModel | undefined = undefined,
    animations: VoxelAnimationCollection | undefined = undefined): Promise<T> {

    let s = new AT(pos);
    await s.load(uri, animations);

    this._sprites.set(s.id, s);
    this.physics.addRigitObject(s, undefined);
    s.addToScene(this._camera!.scene);
    //gameState.scene 
    // gameApp.scene.
    return s;
  }

  public async removeSprite(sprite: Sprite3) {
    this.physics.removeRigitObject(sprite);
    this._sprites.delete(sprite.id);
    sprite.removeFromScene(this._camera!.scene);
  }

  public async forever(func: () => Promise<void>): Promise<void> {
    while (this._running) {
      await func();
    }
  }

  public waitCollide(sprites: Sprite3[], seconds: number): Promise<Sprite3> {
    let waiter: CollisionWaiter = { resolve: undefined };
    let p: Promise<Sprite3> = new Promise<Sprite3>((resolve) => {
      waiter.resolve = (target: IRigitBody | undefined) => {
        resolve(target as Sprite3);
        for (let sprite of sprites) {
          this._collisions.delete(sprite);
        }
      }
    });

    // first check if we have collisions recorded on any sprite
    for (let sprite of sprites) {
      if (this._collisions.get(sprite)) {
        // remove from detection list
        this._collisions.delete(sprite);
        waiter.resolve!(sprite);
        return p;
      }
    }

    // if none of sprites triggered; wait on them
    for (let sprite of sprites) {
      this._collisions.set(sprite, waiter);
    }

    setTimeout(() => {
      // if we have not resolved waiter yet, resolve it
      if (waiter.resolve !== undefined) {
        waiter.resolve(undefined);
        waiter.resolve = undefined;
      }
    }, seconds * 1000);
    return p;
  }

  public createExplosion(pos: Vector3) {
    this.particles.explosion(pos.x, pos.y, pos.z, 1, null);
  }

  public sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  public async send(msg: string): Promise<void> {
    let handlers = this._messageHandlers.get(msg);
    if (handlers === undefined) {
      return;
    }

    setTimeout(async () => {
      for (let h of handlers!) {
        h(msg);
      }
    });
  }

  public onStart(func: () => Promise<void>) {
    this._startHandlers.push(func);
  }

  public onMessage(func: () => Promise<void>) {

  }

  public onCollide(ros: IRigitBody[]) {
    // record collisions
    for (let ro of ros) {
      let waiter = this._collisions.get(ro);
      if (waiter !== undefined && waiter.resolve !== undefined) {
        waiter.resolve(ro);
        // reset waiter after first resolve
        waiter.resolve = undefined;
        this._collisions.delete(ro);
      } else {
        this._collisions.set(ro, { resolve: undefined });
      }
    }
  }

  private loadScene() {
    if (this._camera === undefined) {
      return;
    }

    if (this._level === undefined) {
      throw new Error('not loaded');
    }

    // TODO: we should clear the previous scene
    this._level.loadScene(this._camera.scene);

    this.particles = new ParticlePool(this._camera.scene, 200, 1);
  }
}

export function createVM(canvas: HTMLElement) {
  setVM(new VM(canvas));
}
