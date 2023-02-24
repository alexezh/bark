import { Sprite, Vector3 } from "three";
import { IGameMap } from "../voxel/igamemap";
import { animator } from "./animator";
import { GamePhysics } from "./gamephysics";
import { IGamePhysics, IGamePhysicsInputController, RigitCollisionHandler } from "./igamephysics";
import { Sprite3 } from "./sprite3";
import { Ticker } from "./ticker";
import { IRigitBody } from "./voxelmeshmodel";

export type MessageHandler = (msg: string): Promise<void>;

export class VM {
  private _running: boolean = false;
  private _ticker!: Ticker;
  private _physics!: GamePhysics;
  private _canvas: HTMLElement;
  private _map!: IGameMap;

  // we are going to copy/write of handler array
  // so it is safe to enumerate even if handler changes it
  private _messageHandlers: Map<string, MessageHandler[]> = new Map<string, MessageHandler[]>;
  //private _sprites: Map

  public get physics(): IGamePhysics { return this._physics; }

  public constructor(canvas: HTMLElement) {
    this._canvas = canvas;
  }

  public get canvas(): HTMLElement { return this._canvas; }

  public loadMap() {
    this._map = new GameMap();
    this._map.load();
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

  public async createSprite<T extends Sprite3>(uri: string, pos: Vector3): Promise<T> {
    let s = new T(pos);
    await s.load(uri);

    this.physics.addRigitObject(s, undefined);
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

export let vm: VM = new VM();
