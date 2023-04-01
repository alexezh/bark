import { setFetchAdapter } from "./lib/fetchadapter";
import { FetchAdapterWeb } from "./lib/fetchadapterweb";
import { GameApp } from "./gameapp";

// root object for index code
export var gameApp = new GameApp();
setFetchAdapter(new FetchAdapterWeb());


