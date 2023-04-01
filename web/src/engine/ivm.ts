import { Clock, Vector3 } from "three";
import { ICamera } from "./icamera";
import { IGamePhysics } from "./igamephysics";
import { Sprite3 } from "./sprite3";
import { IRigitBody, VoxelAnimationCollection } from "../voxel/voxelmeshmodel";
import { IDigGame } from "./idiggame";
import { FrameClock } from "./clock";
import { IRigitModel } from "./irigitmodel";
import { IVoxelLevel, IVoxelLevelFile } from "../ui/ivoxelmap";

export interface IInputController {
  start();
  stop();
  onXrSessionChanged(session: XRSession | undefined);
  update(tick: number);
  readInput<T>(): Promise<T>;
}

export interface IVM {
  get level(): IVoxelLevel;
  get physics(): IGamePhysics;
  get canvas(): HTMLElement;
  get clock(): FrameClock;
  get levelFile(): IVoxelLevelFile;
  get camera(): ICamera;

  attachCamera(camera: ICamera): void;
  registerLevelLoaded(target: any, func: () => void): void;
  setController(controller: IInputController);
  loadGame(GT: { new(): IDigGame }): Promise<IDigGame>;

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

  createSprite<T extends Sprite3>(
    AT: { new(...args: any[]): T; }, uri: string, pos: Vector3,
    rm: IRigitModel | undefined,
    ac: VoxelAnimationCollection | undefined): Promise<T>;
  removeSprite(sprite: Sprite3);
  forever(func: () => Promise<void>): Promise<void>;

  // read input; the actual implementation depends on input controller
  readInput(): Promise<any>;

  // wait for any sprites in the list to collide
  // multiple threads can call wait on different groups of sprites
  // as an alternative, app code can register handler on sprite level and
  // get all information there
  waitCollide(sprite: Sprite3[], timeout: number): Promise<Sprite3>;

  createExplosion(pos: Vector3): void;

  sleep(ms: number): Promise<void>;
  send(msg: string): Promise<void>;
  onStart(func: () => Promise<void>);
  onMessage(func: () => Promise<void>);
}

export let vm!: IVM;
export function setVM(val: IVM) {
  vm = val;
}
