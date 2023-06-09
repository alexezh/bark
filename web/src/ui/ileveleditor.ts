import { VoxelModel } from "../voxel/voxelmodel";
import { KeyBinder, MEvent } from "./keybinder";

export interface ILevelEditor {
  //  attach(camera: ICameraControl, input: KeyBinder): void;
  //  detach(): void;
  selectBlock(model: VoxelModel): void;
  copyBlock(): void;
  cutBlock(): void;
  clearBlock(): void;
  pasteBlock(): void;
  rotateXZ(): void;
  flipX(): void;
  flipZ(): void;
}

