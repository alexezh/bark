import { setFetchAdapter } from "./fetchadapter";
import { FetchAdapterWeb } from "./fetchadapterweb";
import { createDefaultEngine, runGame } from "./voxel";

setFetchAdapter(new FetchAdapterWeb());

//export var gameApp = new GameApp();
//gameApp.run();
export function initGame(canvas: HTMLElement) {
  //createDefaultEngine(canvas);
  runGame(canvas);
}


