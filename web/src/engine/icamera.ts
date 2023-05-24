import { PerspectiveCamera, Scene, Vector3 } from "three";
import { WorldCoord3 } from "../voxel/pos3";
import { ILevelEditor } from "../ui/ileveleditor";
import { PxSize } from "../lib/pos";

export interface ICamera {
  get scene(): Scene;
  get camera(): PerspectiveCamera;
  get canvas(): HTMLDivElement;
  get viewSize(): PxSize;

  get position(): Vector3;
  set position(pos: Vector3);

  setThirdPersonCamera(): void;
  scrollBy(pxSize: WorldCoord3): void;
  registerXrSessionHandler(target: any, func: (session: XRSession | undefined) => void): void;

  setEditor(editor: ILevelEditor | undefined);
}

