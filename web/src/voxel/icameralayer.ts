import { Scene, Vector3 } from "three";
import { WorldCoord3 } from "./pos3";

export interface ICameraLayer {
  get scene(): Scene;
  get position(): Vector3;

  //loadMap(map: IGameMap);
  refresh(): void;
  scrollBy(pxSize: WorldCoord3): void;
  setPosition(pos: Vector3);
  //    ensureVisible(pos: GridPos): void;
}

