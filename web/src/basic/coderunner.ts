import { Sprite } from "three";
import { ICodeLoader, ICodeRunner as ICodeRunner } from "../engine/ivm";
import { Sprite3 } from "../engine/sprite3";

export type MessageHandler = (...args: any[]) => Promise<void>;
export type StartHandler = () => Promise<void>;
export type LoadHandler = () => Promise<void>;
export type CreateSpriteHandler = (sprite: Sprite3) => Promise<void>;

export type RuntimeModule = { [key: string]: Function };

export class CodeRunner implements ICodeRunner {
  private readonly _startHandlers: StartHandler[] = [];
  private readonly _loadHandlers: StartHandler[] = [];
  private readonly _createHandlers = new Map<string, CreateSpriteHandler[]>();

  // we are going to copy/write of handler array
  // so it is safe to enumerate even if handler changes it
  private _messageHandlers: Map<string, MessageHandler[]> = new Map<string, MessageHandler[]>;

  public async load(loader: ICodeLoader | Function): Promise<void> {
    if (loader instanceof Function) {
      loader(this);
    } else {
      let js = loader.getFunction();

      // invoke game root function
      js(loader, this);
    }

    // first tell game to load
    try {
      for (let h of this._loadHandlers) {
        await h();
      }
    }
    catch (e) {
      console.log('Cannot load. Exception: ' + (<Error>e).message)
    }
  }

  public reset() {
    this._startHandlers.length = 0;
    this._loadHandlers.length = 0;
    this._messageHandlers.clear();
    this._createHandlers.clear();
  }

  public async sendMesssage(address: string, ...args: any[]): Promise<void> {
    let handlers = this._messageHandlers.get(address);
    if (handlers === undefined) {
      return;
    }

    setTimeout(async () => {
      try {
        for (let h of handlers!) {
          h(...args);
        }
      }
      catch (e) {
        console.log('Failed to send message')
      }
    });
  }

  public onMessage(address: string, func: MessageHandler) {
    let handlers = this._messageHandlers.get(address);
    if (!handlers) {
      handlers = [];
      this._messageHandlers.set(address, handlers);
    }
    handlers.push(func);
  }

  public onLoad(func: () => Promise<void>) {
    this._loadHandlers.push(func);
  }

  public onStart(func: () => Promise<void>) {
    this._startHandlers.push(func);
  }

  public onCreateSprite(name: string, func: () => Promise<void>) {
    console.log('register create handler ' + name);
    let handlers = this._createHandlers.get(name);
    if (!handlers) {
      handlers = [];
      this._createHandlers.set(name, handlers);
    }
    handlers.push(func);
  }

  /**
   * execute all start handlers
   */
  public async start(): Promise<void> {
    // now start the game
    // allow any start method to run as much as it wants
    for (let h of this._startHandlers) {
      setTimeout(async () => {
        try {
          await h();
        }
        catch (e) {
          console.log('onStart exception:', (e as any).toString());
        }
      });
    }
  }

  public async createSprite(name: string, sprite: Sprite3) {
    let handlers = this._createHandlers.get(name);
    if (!handlers) {
      return;
    }
    for (let h of handlers) {
      await h(sprite);
    }
  }
}

