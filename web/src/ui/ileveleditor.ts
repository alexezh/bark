import { VoxelModel } from "../voxel/voxelmodel";

export class BlockRegister {
  public model: VoxelModel | undefined;
}

let blockRegister: BlockRegister = new BlockRegister();

export function setBlockRegister(model: VoxelModel | undefined) {
  blockRegister.model = model;
}

export function getBlockRegister(): VoxelModel | undefined {
  return blockRegister.model;
}

export interface ILevelEditor {
  //  attach(camera: ICameraControl, input: KeyBinder): void;
  //  detach(): void;
  copyBlock(): void;
  cutBlock(): void;
  clearBlock(): void;
  pasteBlock(): void;
  rotateXZ(): void;
  flipX(): void;
  flipZ(): void;
}

