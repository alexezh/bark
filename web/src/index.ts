import { setFetchAdapter } from "./fetchadapter";
import { FetchAdapterWeb } from "./fetchadapterweb";
import { createVoxelGame, game } from "./voxel/main";

//export var gameApp = new GameApp();
//gameApp.run();
export function initGame(canvas: HTMLElement) {
  //createDefaultEngine(canvas);
  createVoxelGame();
}


