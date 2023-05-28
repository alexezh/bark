import { VoxelModel } from "../voxel/voxelmodel";
import { KeyBinder, MEvent } from "./keybinder";

export interface ILevelEditor {
  //  attach(camera: ICameraControl, input: KeyBinder): void;
  //  detach(): void;
  onMouseDown(evt: MEvent): boolean;
  onMouseUp(evt: MEvent): boolean;
  onMouseMove(evt: MEvent): boolean;

  selectBlock(model: VoxelModel): void;
  copyBlock(): void;
  cutBlock(): void;
  clearBlock(): void;
  pasteBlock(): void;
}

