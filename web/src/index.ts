import { setFetchAdapter } from "./fetchadapter";
import { FetchAdapterWeb } from "./fetchadapterweb";
import { GameApp } from "./gameapp";

export var gameApp = new GameApp();
export function initGame(canvas: HTMLDivElement) {
  //createDefaultEngine(canvas);
  setFetchAdapter(new FetchAdapterWeb());
  gameApp.setContainer(canvas);

  setTimeout(() => gameApp.run());
}


