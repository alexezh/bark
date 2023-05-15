import { IVMCodeRunner } from "../engine/ivm";
import { ModuleNode } from "./ast";

export type MessageHandler = (msg: any) => Promise<void>;
export type StartHandler = () => Promise<void>;
export type LoadHandler = () => Promise<void>;

export type RuntimeModule = { [key: string]: Function };

export class CodeRunner implements IVMCodeRunner {
  private readonly _startHandlers: StartHandler[] = [];
  private readonly _loadHandlers: StartHandler[] = [];

  private readonly _systemModules: Map<string, ModuleNode> = new Map<string, ModuleNode>();
  private readonly _userModules: Map<string, ModuleNode> = new Map<string, ModuleNode>();

  // we are going to copy/write of handler array
  // so it is safe to enumerate even if handler changes it
  private _messageHandlers: Map<string, MessageHandler[]> = new Map<string, MessageHandler[]>;

  public async load(): Promise<void> {
    // invoke game root function
    // it will register handlers which we invoke next
    //create();

    // first tell game to load
    for (let h of this._loadHandlers) {
      await h();
    }
  }

  public reset() {
    this._startHandlers.length = 0;
    this._loadHandlers.length = 0;
  }

  public async sendMesssage(address: string, msg: any): Promise<void> {
    let handlers = this._messageHandlers.get(address);
    if (handlers === undefined) {
      return;
    }

    setTimeout(async () => {
      for (let h of handlers!) {
        h(msg);
      }
    });
  }

  public onMessage(address: string, func: MessageHandler) {
    let handlers = this._messageHandlers.get(address);
    if (handlers === undefined) {
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

  public async invokeOnStart(): Promise<void> {
    // first tell game to load
    for (let h of this._startHandlers) {
      await h();
    }
  }
}

