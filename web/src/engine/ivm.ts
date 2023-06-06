import { Vector3 } from "three";
import { ICameraLayer } from "./icameralayer";
import { IGamePhysics } from "./igamephysics";
import { Sprite3 } from "./sprite3";
import { FrameClock } from "./clock";
import { IRigitModel } from "./irigitmodel";
import { IVoxelLevel, IVoxelLevelFile } from "../ui/ivoxellevel";
import { FuncDefNode, ModuleNode, OnNode, VarDefNode } from "../basic/ast";
import { ILevelEditor } from "../ui/ileveleditor";
import { IRigitBody, RigitBodyKind } from "../voxel/irigitbody";

export interface IInputController {
  start();
  stop();
  onXrSessionChanged(session: XRSession | undefined);
  update(tick: number);
}

export interface ICodeLoader {
  addUserModule(name: string, text: string | ModuleNode);
  addSystemModule(module: ModuleNode);

  getUserModule(name: string): ModuleNode | undefined;

  systemModules(): Iterable<ModuleNode>;
  userModules(): Iterable<ModuleNode>;
  userFunctions(): Iterable<FuncDefNode>;
  functions(): Iterable<FuncDefNode>;
  vars(): Iterable<VarDefNode>;
  userOns(): Iterable<OnNode>;
  imports(): Iterable<ModuleNode>;

  // returns function of two arguments: loader and runner
  // we are using loader to get module; and runner to register events
  getFunction(): Function;
}

export interface IVMCodeRunner {
  sendMesssage(address: string, msg: any): Promise<void>;
  onLoad(func: () => Promise<void>);
  onStart(func: () => Promise<void>);
  onMessage(address: string, func: (msg: any) => Promise<void>);
}

export interface IVM {
  get level(): IVoxelLevel;
  get physics(): IGamePhysics;
  get canvas(): HTMLElement;
  get clock(): FrameClock;
  get levelFile(): IVoxelLevelFile;
  get camera(): ICameraLayer;
  get loader(): ICodeLoader;
  get runner(): IVMCodeRunner;
  get levelEditor(): ILevelEditor | undefined;

  attachCamera(camera: ICameraLayer): void;
  registerLevelLoaded(target: any, func: () => void): void;
  setController(controller: IInputController);

  /**
   * load game project (including executing bits)
   * returns pointer to game object which then performs final initialization
   * in IDigGame.init
   */
  loadProject(id: string): Promise<void>;

  /**
   * load default level of the game or specific level
   */
  loadLevel(id: string): Promise<void>;
  editLevel();

  /**
   * run the game
   */
  start(): Promise<void>;

  /**
   * stop the game
   * disconnect input handlers
   * remove runtime objects from the scene
   */
  stop(): void;

  /**
   * called every frame to render
   */
  onRenderFrame(): void;

  /**
   * create sprite and adds it to scene
   * does not add it to physics; caller should do this
   */
  createSprite(
    name: string,
    uri: string,
    rm: IRigitModel | undefined,
    rigitKind?: RigitBodyKind): Promise<Sprite3>;

  /**
   * removes sprite from the scene
   */
  removeSprite(sprite: Sprite3);
  forever(func: () => Promise<void>): Promise<void>;

  sendMesssage(address: string, msg: any): Promise<void>;

  // wait for any sprites in the list to collide
  // multiple threads can call wait on different groups of sprites
  // as an alternative, app code can register handler on sprite level and
  // get all information there
  waitCollide(sprite: Sprite3, timeout: number | undefined): Promise<IRigitBody | null>;

  createExplosion(pos: Vector3): void;

  sleep(seconds: number): Promise<void>;
}

export let vm!: IVM;
export function setVM(val: IVM) {
  vm = val;
}
