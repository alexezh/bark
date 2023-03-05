import { Scene, Vector3 } from "three";
import { WorldProps } from "../fetchadapter";
import { MapPos3, MapSize3, WorldCoord3, WorldSize3 } from "./pos3";
import { VoxelModel } from "./voxelmodel";
import { IRigitBody } from "../engine/voxelmeshmodel";

export type MapProps = {
  id: string;
  gridWidth: number;
  gridHeight: number;
  cellWidth: number;
  cellHeight: number;
  humanStepDuration: number;
}

export type MapBlock = {
  model: VoxelModel;
  frame: number;
  // true if block is top most (no other blocks)
  topmost: boolean;
}

export type MapBlockCoord = {
  model: VoxelModel | undefined;
  idx: number;
  mapPos: MapPos3;
  mapSize: MapSize3;
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

  intersectBlocks(
    ro: IRigitBody,
    pos: WorldCoord3,
    func: (block: MapBlock, blockPos: WorldCoord3) => boolean): boolean;

  //  readonly physics: IGamePhysics;
  //  readonly mechanics: IGameMechanics;
  //  setViewport(pxRect: PxRect): void;
}