import { Vector3 } from "three";
import AsyncEventSource from "../AsyncEventSource";
import { ICameraLayer } from "../voxel/icameralayer";
import { IGameMap } from "../voxel/igamemap";
import { animator } from "./animator";
import { GameMap } from "./gamemap";
import { GamePhysics } from "./gamephysics";
import { IDigGame } from "./idiggame";
import { IGamePhysics, RigitCollisionHandler } from "./igamephysics";
import { IVM, setVM } from "./ivm";
import { Sprite3 } from "./sprite3";
import { Ticker } from "./ticker";
import { IRigitBody, IRigitModel } from "./voxelmeshmodel";

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
  private _map!: IGameMap;
  private _camera?: ICameraLayer;
  private _game?: IDigGame;
  private _collisions: WeakMap<IRigitBody, CollisionWaiter> = new WeakMap<IRigitBody, CollisionWaiter>;

  private readonly onMapChanged: AsyncEventSource<boolean> = new AsyncEventSource();
  private readonly _startHandlers: StartHandler[] = [];

  // we are going to copy/write of handler array
  // so it is safe to enumerate even if handler changes it
  private _messageHandlers: Map<string, MessageHandler[]> = new Map<string, MessageHandler[]>;
  //private _sprites: Map

  public get physics(): IGamePhysics { return this._physics; }
  public get map(): IGameMap { return this._map; }

  public constructor(canvas: HTMLElement) {
    this._canvas = canvas;
  }

  public get canvas(): HTMLElement { return this._canvas; }

  public attachCamera(camera: ICameraLayer) {
    this._camera = camera;

    if (this._map !== undefined) {
      this.loadScene();
    }
  }

  public registerMapChanged(target: any, func: (val: boolean) => void) {
    this.onMapChanged.add(target, func);
    if (this._map !== undefined) {
      this.loadScene();
      this.onMapChanged.invoke(true);
    }
  }

  public async loadGame(GT: { new(): IDigGame }): Promise<IDigGame> {
    let game = new GT();
    await game.init();
    this._game = game;
    return game;
  }

  public async loadMap(id: string): Promise<void> {
    this._map = new GameMap();
    await this._map.load(id);
    this._physics = new GamePhysics(this._map);
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

  public update(dt: number) {
    this.physics.update(dt);
  }

  public async createSprite<T extends Sprite3>(AT: { new(...args: any[]): T; }, uri: string, pos: Vector3, rm: IRigitModel | undefined = undefined): Promise<T> {
    let s = new AT(pos);
    await s.load(uri);

    this.physics.addRigitObject(s, undefined);
    s.addToScene(this._camera!.scene);
    //gameState.scene 
    // gameApp.scene.
    return s;
  }

  public async removeSprite(sprite: Sprite3) {
    this.physics.removeRigitObject(sprite);
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
    this.sleep(seconds);
    return p;
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

    // TODO: we should clear the previous scene
    this._map.loadScene(this._camera.scene);
  }
}

export function createVM(canvas: HTMLElement) {
  setVM(new VM(canvas));
}
