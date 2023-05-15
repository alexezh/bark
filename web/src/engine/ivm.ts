import { Vector3 } from "three";
import { ICamera } from "./icamera";
import { IGamePhysics } from "./igamephysics";
import { Sprite3 } from "./sprite3";
import { IRigitBody, VoxelAnimationCollection } from "../voxel/voxelmeshmodel";
import { FrameClock } from "./clock";
import { IRigitModel } from "./irigitmodel";
import { IVoxelLevel, IVoxelLevelFile } from "../ui/ivoxelmap";
import { FuncDefNode, ModuleNode, OnNode } from "../basic/ast";
import { JsWriter } from "../basic/jswriter";

export interface IInputController {
  start();
  stop();
  onXrSessionChanged(session: XRSession | undefined);
  update(tick: number);
  readInput<T>(): Promise<T>;
}

export interface ICodeLoader {
  addUserModule(name: string, text: string);
  addSystemModule(name: string, module: ModuleNode);

  systemModules(): Iterable<ModuleNode>;
  userFunctions(): Iterable<FuncDefNode>;
  functions(): Iterable<FuncDefNode>;
  userOns(): Iterable<OnNode>;
  imports(): Iterable<ModuleNode>;

  getFunction(): Function;
}

export interface IVMCodeRunner {
  sendMesssage(address: string, msg: any): Promise<void>;
  onLoad(func: () => Promise<void>);
  onStart(func: () => Promise<void>);
  onMessage(address: string, func: (msg: any) => Promise<void>);
}

export interface IVM extends IVMCodeRunner {
  get level(): IVoxelLevel;
  get physics(): IGamePhysics;
  get canvas(): HTMLElement;
  get clock(): FrameClock;
  get levelFile(): IVoxelLevelFile;
  get camera(): ICamera;

  attachCamera(camera: ICamera): void;
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

  createSprite(
    name: string,
    uri: string,
    rm: IRigitModel | undefined): Promise<Sprite3>;
  removeSprite(sprite: Sprite3);
  forever(func: () => Promise<void>): Promise<void>;

  // read input; the actual implementation depends on input controller
  readInput(): Promise<any>;

  // wait for any sprites in the list to collide
  // multiple threads can call wait on different groups of sprites
  // as an alternative, app code can register handler on sprite level and
  // get all information there
  waitCollide(sprite: Sprite3, timeout: number): Promise<IRigitBody | null>;

  createExplosion(pos: Vector3): void;

  sleep(ms: number): Promise<void>;
}

export let vm!: IVM;
export function setVM(val: IVM) {
  vm = val;
}
