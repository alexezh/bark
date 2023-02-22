import { IGameMap } from "../voxel/igamemap";
import { animator } from "./animator";
import { GamePhysics } from "./gamephysics";
import { IGamePhysics } from "./igamephysics";
import { Ticker } from "./ticker";

export class VM {
    private _running: boolean = false;
    private _ticker!: Ticker;
    private _physics!: GamePhysics;
  
    public get physics(): IGamePhysics { return this._physics; }

    public start(map: IGameMap) {
      this._ticker = new Ticker();
      animator.start(this._ticker);
      this._physics = new GamePhysics(map);
      this._running = true;
    }

    public stop() {
      animator.stop();
    }
  
    public async forever(func: () => Promise<void>): Promise<void> {
      while (this._running) {
        await func();
      }
    }
  
    public sleep(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));    
    }
  
    public onStart(func: () => Promise<void>) {
  
    }
    public onMessage(func: () => Promise<void>) {
      
    }
    public onKey(func: () => Promise<void>) {
      
    }
}
  
  export let vm: VM = new VM();
    