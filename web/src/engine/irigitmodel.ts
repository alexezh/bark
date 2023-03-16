import { Vector3 } from "three";
import { VoxelMeshModel } from "../voxel/voxelmeshmodel";

export interface IRigitModel {
  move(pos: Vector3, parts: VoxelMeshModel): void;
  update(): void;
  onRender(speed: Vector3, parts: VoxelMeshModel);
}

