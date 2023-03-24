import { Scene, Vector3 } from "three";
import { WorldCoord3 } from "./pos3";

export interface ICameraLayer {
  get scene(): Scene;

  scrollBy(pxSize: WorldCoord3): void;
}

