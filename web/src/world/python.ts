import { Character } from "../voxel/character";
import { GameMap } from "../voxel/gamemap";

class Object {

}

class BoxedGame {
  private map!: GameMap;
  private char!: Character;
  private boxed!: Object[];
  private _running: boolean;

  public async init(): Promise<boolean> {
    this.map = new GameMap();
    this.map.load();
    this.char = new Character();

    this._running = true;
    this.invokeStart();

    return true;
  }

  private async forever(func: () => Promise<boolean>) {
    while (this._running) {
      await func();
    }
    return true;
  }

  private async dropObject(): Promise<boolean> {
    return true;
  }
}