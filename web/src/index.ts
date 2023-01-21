import { setFetchAdapter } from "./fetchadapter";
import { FetchAdapterWeb } from "./fetchadapterweb";
import { GameApp } from "./gameapp";

setFetchAdapter(new FetchAdapterWeb());

export var gameApp = new GameApp();
gameApp.run();

