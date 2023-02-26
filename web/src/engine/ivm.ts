import { Vector3 } from "three";
import { ICameraLayer } from "../voxel/icameralayer";
import { IGameMap } from "../voxel/igamemap";
import { Sprite3 } from "./sprite3";
import { IRigitBody, IRigitModel } from "./voxelmeshmodel";

export interface IVM {
  get map(): IGameMap;
  attachCamera(camera: ICameraLayer);
  registerMapChanged(target: any, func: () => void);
  loadMap();
  start();
  stop();
  createSprite<T extends Sprite3>(AT: { new(...args: any[]): T; }, uri: string, pos: Vector3, rm: IRigitModel | undefined): Promise<T>;
  removeSprite(sprite: Sprite3);
  forever(func: () => Promise<void>): Promise<void>;
  waitCollide(sprite: Sprite3, timeout: number, collisions: IRigitBody[]): Promise<boolean>;
  sleep(ms: number): Promise<void>;
  send(msg: string): Promise<void>;
  onStart(func: () => Promise<void>);
  onMessage(func: () => Promise<void>);
}

export let vm!: IVM;
export function setVM(val: IVM) {
  vm = val;
}
