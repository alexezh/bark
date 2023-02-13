import { Scene, Vector3 } from "three";
import { WorldProps } from "../fetchadapter";
import { MapBlockCoord } from "./maplayer";
import { GridPos3, GridSize3, WorldCoord3, WorldSize3 } from "./pos3";
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

  load(): Promise<boolean>;
  loadScene(scene: Scene);

  findBlock(point: Vector3): MapBlockCoord | undefined;
  deleteBlock(block: MapBlockCoord);
  addBlock(pos: GridPos3, block: VoxelModel);

  gridSizeToWorldSize(gridSize: GridSize3): WorldSize3;
  gridPosToWorldPos(gridPos: GridPos3): WorldCoord3;

  //  readonly physics: IGamePhysics;
  //  readonly mechanics: IGameMechanics;
  //  setViewport(pxRect: PxRect): void;
}