import { Scene, Vector3 } from "three";
import { WorldProps } from "../fetchadapter";
import { MapBlockCoord } from "../engine/maplayer";
import { VoxelPos3, VoxelSize3, WorldCoord3, WorldSize3 } from "./pos3";
import { VoxelModel } from "./voxelmodel";

export type MapProps = {
  id: string;
  gridWidth: number;
  gridHeight: number;
  cellWidth: number;
  cellHeight: number;
  humanStepDuration: number;
}

export interface IGameMap {
  //readonly props: MapProps;

  load(id: string): Promise<boolean>;
  loadScene(scene: Scene);

  findBlock(point: Vector3): MapBlockCoord | undefined;
  deleteBlock(block: MapBlockCoord);
  addBlock(pos: VoxelPos3, block: VoxelModel);

  voxelSizeToWorldSize(gridSize: VoxelSize3): WorldSize3;
  voxelPosToWorldPos(gridPos: VoxelPos3): WorldCoord3;

  //  readonly physics: IGamePhysics;
  //  readonly mechanics: IGameMechanics;
  //  setViewport(pxRect: PxRect): void;
}