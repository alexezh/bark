import { Vector3 } from "three";
import { ICameraLayer } from "../voxel/icameralayer";
import { IGameMap } from "../voxel/igamemap";
import { animator } from "./animator";
import { GameMap } from "./gamemap";
import { GamePhysics } from "./gamephysics";
import { IGamePhysics, RigitCollisionHandler } from "./igamephysics";
import { IVM, setVM } from "./ivm";
import { Sprite3 } from "./sprite3";
import { Ticker } from "./ticker";
import { IRigitBody, IRigitModel } from "./voxelmeshmodel";

export type MessageHandler = (msg: string) => Promise<void>;

export class VM implements IVM {
  private _running: boolean = false;
  private _ticker!: Ticker;
  private _physics!: GamePhysics;
  private _canvas: HTMLElement;
  private _map!: IGameMap;
  private _camera?: ICameraLayer;

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
    // load map
  }

  public detachCamera() {
    this._camera = undefined;
  }

  registerMapChanged(target: any, func: () => void) {

  }

  public loadMap() {
    this._map = new GameMap();
    this._map.load('test');
  }

  public start() {
    this._ticker = new Ticker();
    animator.start(this._ticker);
    this._physics = new GamePhysics(this._map);
    this._running = true;
  }

  public stop() {
    animator.stop();
  }

  public async createSprite<T extends Sprite3>(AT: { new(...args: any[]): T; }, uri: string, pos: Vector3, rm: IRigitModel | undefined = undefined): Promise<T> {
    let s = new AT(pos);
    await s.load(uri);

    this.physics.addRigitObject(s, undefined);
    //gameState.scene 
    // gameApp.scene.
    return s;
  }

  public async removeSprite(sprite: Sprite3) {
    this.physics.removeRigitObject(sprite);
  }

  public async forever(func: () => Promise<void>): Promise<void> {
    while (this._running) {
      await func();
    }
  }

  public async waitCollide(sprite: Sprite3, timeout: number, collisions: IRigitBody[]): Promise<boolean> {
    return false;
  }

  public sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  }

  public onMessage(func: () => Promise<void>) {

  }

  public onCollide(ro: IRigitBody, func: RigitCollisionHandler) {
    this.physics.setCollideHandler(ro, func);
  }
}

export function createVM(canvas: HTMLCanvasElement) {
  setVM(new VM(canvas));
}
