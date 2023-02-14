import { PxSize } from "../posh/pos";
import { IGameMap } from "./igamemap";
import { WorldCoord3 } from "./pos3";

export interface ICameraLayer {

  //loadMap(map: IGameMap);
  refresh(): void;
  scrollBy(pxSize: WorldCoord3): void;
  //    ensureVisible(pos: GridPos): void;
}

