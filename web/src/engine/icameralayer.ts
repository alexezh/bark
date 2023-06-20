import { Group, PerspectiveCamera, Scene, Vector3 } from "three";
import { ILevelEditor } from "../ui/ileveleditor";
import { PxSize } from "../lib/pos";
import { Sprite3 } from "./sprite3";

export interface ICameraLayer {
  get scene(): Scene | undefined;
  get camera(): PerspectiveCamera;
  get cameraGroup(): Group;
  get canvas(): HTMLDivElement;
  get viewSize(): PxSize;
  get scale(): number;

  get position(): Vector3;
  set position(pos: Vector3);

  registerXrSessionHandler(target: any, func: (session: XRSession | undefined) => void): void;

  /**
   * allows user to move edits camera with mouse
   */
  editCamera();

  /**
   * reinitializer scene
   */
  createScene();

  setEditor(editor: ILevelEditor | undefined);
}

