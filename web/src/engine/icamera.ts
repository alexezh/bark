import { Scene, Vector3 } from "three";
import { WorldCoord3 } from "../voxel/pos3";

export interface ICamera {
  get scene(): Scene;
  get canvas(): HTMLDivElement;

  get position(): Vector3;
  set position(pos: Vector3);

  scrollBy(pxSize: WorldCoord3): void;
  registerXrSessionHandler(target: any, func: (session: XRSession | undefined) => void): void;
}

