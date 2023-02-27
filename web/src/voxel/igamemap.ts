import { Scene, Vector3 } from "three";
import { WorldProps } from "../fetchadapter";
import { MapBlockCoord } from "../engine/maplayer";
import { WorldCoord3, WorldSize3 } from "./pos3";
import { VoxelModel } from "./voxelmodel";

export type MapPos3 = {
  x: number,
  y: number,
  z: number;
}

export type MapSize3 = {
  sx: number,
  sy: number,
  sz: number;
}

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
  addBlock(pos: MapPos3, block: VoxelModel);

  mapSizeToWorldSize(gridSize: MapSize3): WorldSize3;
  mapPosToWorldPos(gridPos: MapPos3): WorldCoord3;

  //  readonly physics: IGamePhysics;
  //  readonly mechanics: IGameMechanics;
  //  setViewport(pxRect: PxRect): void;
}