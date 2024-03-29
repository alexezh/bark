import { Vector3 } from "three";
import AsyncEventSource from "../lib/AsyncEventSource";
import { ICameraLayer } from "./icameralayer";
import { animator } from "./animator";
import { FrameClock } from "./clock";
import { VoxelLevel } from "./voxellevel";
import { GamePhysics } from "./gamephysics";
import { IGamePhysics } from "./igamephysics";
import { ICodeLoader, IInputController, IVM, ICodeRunner, setVM, AppMode } from "./ivm";
import { Sprite3 } from "./sprite3";
import { Ticker } from "./ticker";
import { IRigitModel } from "./irigitmodel";
import { ParticlePool } from "../voxel/particles";
import { IVoxelLevel, IVoxelLevelFile } from "../ui/ivoxellevel";
import { VoxelLevelFile } from "./voxellevelfile";
import { LevelEditor } from "../ui/leveleditor";
import { WireProjectConfig, wireGetObject } from "../lib/fetchadapter";
import { modelCache } from "../voxel/voxelmodelcache";
import { CodeLoader } from "../basic/codeloader";
import { CodeRunner } from "../basic/coderunner";
import { registerSystemModules } from "../basic/lib/all";
import { ILevelEditor } from "../ui/ileveleditor";
import { IRigitBody, RigitBodyKind } from "../voxel/irigitbody";
import SyncEventSource from "../lib/synceventsource";
import { spriteFiles } from "./spritefile";
import { ISpriteFile } from "./ispritefile";
import { boxedBasic2 } from "../python";

type CollisionWaiter = {
  // if resolve is undefined, there is no waiter
  // possibly waiter was already completed
  resolve: ((res: IRigitBody | null) => void) | undefined;
  // array of objects sprite collided with
  targets: IRigitBody[];
}

export class NotRunningError extends Error {

}

export class VM implements IVM {
  private _appMode: AppMode = AppMode.stop;
  private _ticker!: Ticker;
  private _physics!: GamePhysics;
  private _canvas: HTMLElement;
  private _level?: IVoxelLevel;
  private _levelFile?: IVoxelLevelFile;
  private _camera?: ICameraLayer;
  private readonly _createDefaultProject: () => Promise<void>;
  private readonly _sprites: Map<number, Sprite3> = new Map<number, Sprite3>();
  private readonly _runner: CodeRunner = new CodeRunner();
  private readonly _loader: CodeLoader = new CodeLoader();

  /**
   * maps sprite waiting for collision to waiters
   */
  private readonly _collisions: WeakMap<IRigitBody, CollisionWaiter> = new WeakMap<IRigitBody, CollisionWaiter>;
  public readonly clock!: FrameClock;
  private inputController: IInputController | undefined;
  private _levelEditor: LevelEditor | undefined = undefined;

  private readonly onLevelLoaded: AsyncEventSource<boolean> = new AsyncEventSource();
  private readonly onAppModeChanged: SyncEventSource<boolean> = new SyncEventSource();
  public particles!: ParticlePool;

  //private _sprites: Map

  public get levelEditor(): ILevelEditor | undefined { return this._levelEditor }
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
  public get camera(): ICameraLayer {
    if (this._camera === undefined) throw new Error('not loaded');
    return this._camera;
  }

  public get loader(): ICodeLoader { return this._loader; }
  public get runner(): ICodeRunner { return this._runner; }
  public get appMode(): AppMode { return this._appMode; }

  public attachCamera(camera: ICameraLayer) {
    this._camera = camera;
    this._camera.registerXrSessionHandler(this, this.onXrSessionChanged.bind(this));
  }

  public registerLevelLoaded(target: any, func: (val: boolean) => void) {
    this.onLevelLoaded.add(target, func);
  }

  public registerModeChanged(target: any, func: () => void): void {
    this.onAppModeChanged.add(target, func);
  }

  public setController(controller: IInputController) {
    this.inputController = controller;
    return controller;
  }

  public async loadProject(id: string): Promise<void> {

    let projectConfig = await wireGetObject<WireProjectConfig>('config');
    if (projectConfig === undefined) {
      await this._createDefaultProject();
    }

    await spriteFiles.load();

    await modelCache.load();
  }

  /**
   * called from code to load the level; or every time we do to edit mode
   */
  public async loadLevel(id: string): Promise<void> {
    console.log('VM: load level:' + id);

    this._levelFile = new VoxelLevelFile('levels/' + id);
    await this._levelFile.load(false);

    this._level = new VoxelLevel(this.levelFile);
    await this._level.load();

    this._physics = new GamePhysics(this._level);
    this._physics.setCollideHandler(this.onCollide.bind(this));

    this.loadScene(AppMode.run);
    this.onLevelLoaded.invoke(true);
  }

  public async start(): Promise<void> {
    if (this._appMode === AppMode.run) {
      console.log('VM: already running');
      return;
    }

    console.log('VM: start');
    this.resetVm();

    // reload all code. For now we load all user code as single JS function
    // we can switch to load parts later
    registerSystemModules(this._loader);
    this.loader.addUserModule('default', boxedBasic2());
    spriteFiles.loadCode(this._loader);

    //this._loader.addUserModule('default', boxedBasic2())
    await this._runner.load(this._loader);

    // now we are loaded; time to start
    // once we start camera and input, we start game handlers
    this.inputController?.start();
    this.camera.canvas.focus();
    this.clock.start();

    this._ticker = new Ticker();
    animator.start(this._ticker);
    this.setAppMode(AppMode.run);

    this._runner.start();
  }

  private setAppMode(mode: AppMode) {
    this._appMode = mode;
    this.onAppModeChanged.invoke();
  }

  private resetVm() {
    this._levelEditor?.dispose();
    this._levelEditor = undefined;
    this.camera.setEditor(undefined);
    this._runner.reset();
  }

  public stop() {
    console.log('VM: stop');
    animator.stop();
    this.inputController?.stop();
    this.clock.stop();
    this.setAppMode(AppMode.edit);
  }

  public pause() {
    console.log('VM: pause');
    //animator.stop();
    //this.inputController?.stop();
    //this.clock.stop();
    this.setAppMode(AppMode.pause);
  }

  public async sendMesssage(address: string, msg: any): Promise<void> {
    this._runner.sendMesssage(address, msg);
  }

  public edit(): void {
    console.log('edit');

    if (this._appMode === AppMode.edit) {
      return;
    }

    this.stop();
    this.setAppMode(AppMode.edit);
    this.loadScene(AppMode.edit);

    this._levelEditor = new LevelEditor(this.camera, this.level);
    this.camera.setEditor(this._levelEditor);
  }

  public onRenderFrame() {
    if (this._appMode !== AppMode.run) {
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

  public createSprite(
    file: ISpriteFile,
    rm: IRigitModel | undefined = undefined,
    rigitKind?: RigitBodyKind): Sprite3 {

    let s = new Sprite3(file.name, rm, rigitKind);

    this._sprites.set(s.id, s);
    s.addToScene(this._camera!.scene!);

    this._runner.createSprite(file.name, s);

    return s;
  }

  public async removeSprite(sprite: Sprite3) {
    this._sprites.delete(sprite.id);
    sprite.removeFromScene(this._camera!.scene!);
  }

  public async forever(func: () => Promise<void>): Promise<void> {
    while (this._appMode === AppMode.run) {
      await func();
    }
    this.checkRunning();
  }

  public waitCollide(sprite: Sprite3, seconds: number | undefined): Promise<IRigitBody | null> {
    this.checkRunning();
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

    if (seconds) {
      setTimeout(() => {
        // if we have not resolved waiter yet, resolve it
        if (waiter!.resolve !== undefined) {
          waiter!.resolve(null);
          waiter!.resolve = undefined;
        }
      }, seconds * 1000);
    }
    return p;
  }

  public createExplosion(pos: Vector3) {
    this.checkRunning();
    this.particles.explosion(pos.x, pos.y, pos.z, 1, null);
  }

  public sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
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

  private checkRunning() {
    if (this._appMode !== AppMode.run) {
      throw new NotRunningError();
    }
  }

  private loadScene(appMode: AppMode) {
    if (this._camera === undefined) {
      return;
    }

    if (this._level === undefined) {
      throw new Error('not loaded');
    }

    this._camera.createScene();

    // TODO: we should clear the previous scene
    this._level.loadScene(this._camera.scene!, appMode === AppMode.edit);

    this.particles = new ParticlePool(this._camera.scene!, 200, 1);
  }

  private onXrSessionChanged(session: XRSession | undefined) {
    this.inputController?.onXrSessionChanged(session);
  }
}

export function createVM(canvas: HTMLElement, createDefaultProject: () => Promise<void>) {
  setVM(new VM(canvas, createDefaultProject));
}
