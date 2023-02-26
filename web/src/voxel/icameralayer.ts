import { Scene } from "three";
import { WorldCoord3 } from "./pos3";

export interface ICameraLayer {
  get scene(): Scene;
  //loadMap(map: IGameMap);
  refresh(): void;
  scrollBy(pxSize: WorldCoord3): void;
  //    ensureVisible(pos: GridPos): void;
}

