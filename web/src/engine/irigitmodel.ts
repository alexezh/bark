import { Scene, Vector3 } from "three";
import { VoxelAnimationCollection, VoxelMeshModel } from "../voxel/voxelmeshmodel";

export interface IRigitModel {
  get size(): Vector3;

  load(uri: string, animations: VoxelAnimationCollection | undefined): Promise<void>;
  animate(id: string);

  addToScene(scene: Scene);
  removeFromScene(scene: Scene);

  setPosition(pos: Vector3): void;
  setDirection(pos: Vector3): void;
  update(): void;

  // call when we render the model for each frame
  onRenderFrame(tick: number);
}

