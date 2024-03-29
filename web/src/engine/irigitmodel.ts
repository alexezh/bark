import { Scene, Vector3 } from "three";
import { VoxelAnimationCollection, VoxelMeshModel } from "../voxel/voxelmeshmodel";
import { RigitAABB } from "../voxel/irigitbody";
import { Coord3 } from "../voxel/pos3";

export interface IRigitModel {
  get size(): Vector3;

  /**
   * array of coordinates which model is standing on
   */
  get bottomPoints(): Coord3[];

  load(uri: string): Promise<void>;
  animate(id: string);
  addAnimation(name: string);
  addFrame(name: string, idx: number, duration: number);
  //animations: VoxelAnimationCollection | undefined

  aabb(pos: Vector3 | undefined): RigitAABB;

  addToScene(scene: Scene);
  removeFromScene(scene: Scene);

  setPosition(pos: Vector3): void;
  setSpeed(speed: Vector3): void;
  setDirectionXZ(angle: number): void;
  setRotationXZ(angle: number): void;
  update(): void;

  // call when we render the model for each frame
  onRenderFrame(tick: number);
}

