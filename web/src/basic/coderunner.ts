import { ICodeLoader, ICodeRunner as ICodeRunner } from "../engine/ivm";

export type MessageHandler = (...args: any[]) => Promise<void>;
export type StartHandler = () => Promise<void>;
export type LoadHandler = () => Promise<void>;

export type RuntimeModule = { [key: string]: Function };

export class CodeRunner implements ICodeRunner {
  private readonly _startHandlers: StartHandler[] = [];
  private readonly _loadHandlers: StartHandler[] = [];

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
}

