import { ICameraLayer } from "../voxel/icameracontrol";
import { KeyBinder, MEvent } from "./keybinder";

export interface IMapEditor {
  //  attach(camera: ICameraControl, input: KeyBinder): void;
  //  detach(): void;
  onMouseDown(evt: MEvent): boolean;
  onMouseUp(evt: MEvent): boolean;
  onMouseMove(evt: MEvent): boolean;
}

