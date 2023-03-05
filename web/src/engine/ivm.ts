import { Vector3 } from "three";
import { ICameraLayer } from "../voxel/icameralayer";
import { IGameMap } from "../voxel/igamemap";
import { IGamePhysics } from "./igamephysics";
import { Sprite3 } from "./sprite3";
import { IRigitBody, IRigitModel } from "./voxelmeshmodel";
import { IDigGame } from "./idiggame";

export interface IVM {
  get map(): IGameMap;
  get physics(): IGamePhysics;
  get canvas(): HTMLElement;

  attachCamera(camera: ICameraLayer): void;
  registerMapChanged(target: any, func: () => void): void;
  loadGame(GT: { new(): IDigGame }): Promise<IDigGame>;

  loadMap(id: string): Promise<void>;
  start(): Promise<void>;
  stop(): void;
  update(dt: number): void;
  createSprite<T extends Sprite3>(AT: { new(...args: any[]): T; }, uri: string, pos: Vector3, rm: IRigitModel | undefined): Promise<T>;
  removeSprite(sprite: Sprite3);
  forever(func: () => Promise<void>): Promise<void>;

  // wait for any sprites in the list to collide
  // multiple threads can call wait on different groups of sprites
  // as an alternative, app code can register handler on sprite level and
  // get all information there
  waitCollide(sprite: Sprite3[], timeout: number): Promise<Sprite3>;

  sleep(ms: number): Promise<void>;
  send(msg: string): Promise<void>;
  onStart(func: () => Promise<void>);
  onMessage(func: () => Promise<void>);
}

export let vm!: IVM;
export function setVM(val: IVM) {
  vm = val;
}
