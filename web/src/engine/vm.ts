import { Vector3 } from "three";
import AsyncEventSource from "../lib/AsyncEventSource";
import { ICamera } from "./icamera";
import { animator } from "./animator";
import { FrameClock } from "./clock";
import { VoxelLevel } from "./voxellevel";
import { GamePhysics } from "./gamephysics";
import { IDigGame } from "./idiggame";
import { IGamePhysics } from "./igamephysics";
import { IInputController, IVM, setVM } from "./ivm";
import { Sprite3 } from "./sprite3";
import { Ticker } from "./ticker";
import { IRigitBody, VoxelAnimationCollection } from "../voxel/voxelmeshmodel";
import { IRigitModel } from "./irigitmodel";
import { ParticlePool } from "../voxel/particles";
import { IVoxelLevel, IVoxelLevelFile } from "../ui/ivoxelmap";
import { VoxelLevelFile } from "./voxellevelfile";
import { LevelEditor } from "../ui/leveleditor";
import { BoxedGame } from "../python";
import { WireProjectConfig, wireGetObject } from "../lib/fetchadapter";
import { modelCache } from "../voxel/voxelmodelcache";

export type MessageHandler = (msg: string) => Promise<void>;
export type StartHandler = () => Promise<void>;

type CollisionWaiter = {
  // if resolve is undefined, there is no waiter
  // possibly waiter was already completed
  resolve: ((res: IRigitBody | null) => void) | undefined;
  // array of objects sprite collided with
  targets: IRigitBody[];
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
  private readonly _createDefaultProject: () => Promise<void>;
  private readonly _sprites: Map<number, Sprite3> = new Map<number, Sprite3>();
  /**
   * maps sprite waiting for collision to waiters
   */
  private readonly _collisions: WeakMap<IRigitBody, CollisionWaiter> = new WeakMap<IRigitBody, CollisionWaiter>;
  public readonly clock!: FrameClock;
  private inputController: IInputController | undefined;
  private levelEditor: LevelEditor | undefined = undefined;

  private readonly onLevelLoaded: AsyncEventSource<boolean> = new AsyncEventSource();
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

  public constructor(canvas: HTMLElement, createDefaultProject: () => Promise<void>) {
    this._canvas = canvas;
    this.clock = new FrameClock();
    this._createDefaultProject = createDefaultProject;
  }

  public get canvas(): HTMLElement { return this._canvas; }
  public get camera(): ICamera {
    if (this._camera === undefined) throw new Error('not loaded');
    return this._camera;
  }

  public attachCamera(camera: ICamera) {
    this._camera = camera;
    this._camera.registerXrSessionHandler(this, this.onXrSessionChanged.bind(this));
  }

  public registerLevelLoaded(target: any, func: (val: boolean) => void) {
    this.onLevelLoaded.add(target, func);
  }

  public setController(controller: IInputController) {
    this.inputController = controller;
    return controller;
  }

  public async loadProject(id: string): Promise<IDigGame> {

    let projectConfig = await wireGetObject<WireProjectConfig>('config');
    if (projectConfig === undefined) {
      await this._createDefaultProject();
    }

    await modelCache.load();

    // for now create BoxedGame (as code) but use different projectId
    let game = new BoxedGame();
    await game.init();
    this._game = game;
    return game;
  }

  public async loadLevel(id: string): Promise<void> {
    this._levelFile = new VoxelLevelFile('levels/' + id);
    await this._levelFile.load(false);

    this._level = new VoxelLevel(this.levelFile);
    await this._level.load();

    this._physics = new GamePhysics(this._level);
    this._physics.setCollideHandler(this.onCollide.bind(this));

    this.loadScene();
    this.onLevelLoaded.invoke(true);
  }

  public async start(): Promise<void> {
    if (this._game === undefined) {
      throw new Error('game is not loaded');
    }

    if (this._running) {
      console.log('VM: already running');
      return;
    }

    console.log('VM: start');
    this.levelEditor?.dispose();
    this.levelEditor = undefined;
    this.camera.setEditor(undefined);

    this.inputController?.start();
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
    this.inputController?.stop();
    this._game!.stop();
    this.clock.stop();
    this._running = false;
  }

  public editLevel(): void {
    console.log('editLevel');

    this.stop();

    this.levelEditor = new LevelEditor(this.camera, this.level);
    this.camera.setEditor(this.levelEditor);
  }

  public onRenderFrame() {
    if (!this._running) {
      return;
    }

    this.clock.tick();
    this.inputController?.update(this.clock.delta)
    this.physics.update(this.clock.delta);
    this.particles.update(this.clock.tick, this.clock.delta)
    let tick = this.clock.lastTick;
    for (let s of this._sprites) {
      s[1].onRender(tick);
    }
  }

  public async createSprite(
    name: string,
    uri: string,
    rm: IRigitModel | undefined = undefined): Promise<Sprite3> {

    let s = new Sprite3(name, rm);
    await s.load(uri);

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

  public readInput(): Promise<any> {
    if (this.inputController === undefined) {
      throw new Error('attach input');
    }

    return this.inputController!.readInput();
  }

  public waitCollide(sprite: Sprite3, seconds: number): Promise<IRigitBody | null> {
    let waiter = this._collisions.get(sprite);
    if (waiter !== undefined && waiter.targets.length > 0) {
      let target = waiter.targets.shift()!;

      return new Promise<IRigitBody>((resolve) => {
        resolve(target);
      });
    }

    if (waiter === undefined) {
      waiter = { resolve: undefined, targets: [] };
      this._collisions.set(sprite, waiter);
    }

    let p: Promise<IRigitBody | null> = new Promise<IRigitBody | null>((resolve) => {
      waiter!.resolve = (target: IRigitBody | null) => {
        resolve(target);
      }
    });

    setTimeout(() => {
      // if we have not resolved waiter yet, resolve it
      if (waiter!.resolve !== undefined) {
        waiter!.resolve(null);
        waiter!.resolve = undefined;
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

  public onCollide(collections: { source: IRigitBody, target: IRigitBody }[]) {
    // record collisions
    for (let c of collections) {
      let waiter = this._collisions.get(c.source);
      if (waiter !== undefined) {
        if (waiter.resolve !== undefined) {
          waiter.resolve(c.target);
          // reset waiter after first resolve
          waiter.resolve = undefined;
        } else {
          waiter.targets.push(c.target);
        }
      } else {
        let waiter: CollisionWaiter = { resolve: undefined, targets: [] }
        waiter.targets.push(c.target);
        this._collisions.set(c.source, waiter);
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

  private onXrSessionChanged(session: XRSession | undefined) {
    this.inputController?.onXrSessionChanged(session);
  }
}

export function createVM(canvas: HTMLElement, createDefaultProject: () => Promise<void>) {
  setVM(new VM(canvas, createDefaultProject));
}
