import { setFetchAdapter } from "./lib/fetchadapter";
import { FetchAdapterWeb } from "./lib/fetchadapterweb";
import { GameApp } from "./gameapp";

export var gameApp = new GameApp();
setFetchAdapter(new FetchAdapterWeb());


