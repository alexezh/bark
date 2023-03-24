import { MeshPhongMaterial, Scene, Vector3 } from "three";
import { MapPos3, MapSize3, WorldCoord3, WorldSize3 } from "../voxel/pos3";
import { VoxelModel } from "../voxel/voxelmodel";
import { IRigitBody } from "../voxel/voxelmeshmodel";

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

export type FileMapBlockDef = {
  id: number;
  uri: string;
}

export type FileMapBlock = {
  id: number;
  x: number;
  y: number;
}

export interface IVoxelMapFile {
  get cameraPosition(): Vector3;
  set cameraPosition(value: Vector3);
  get mapSize(): MapSize3;
  get blockCount(): number;

  registerOnCameraChange(func: () => void);
  registerOnBlockChange(func: () => void);

  load(name: string): Promise<void>;
  getBlock(idx: number): FileMapBlock;
}

export interface IVoxelMap {
  //readonly props: MapProps;

  // called when game started; at this point properties become non-persisted
  onStart();

  // called when game stopped. properties reset to edit values
  onStop();

  load(id: string): Promise<boolean>;
  loadScene(scene: Scene);

  findBlock(point: Vector3): MapBlockCoord | undefined;
  deleteBlock(block: MapBlockCoord);
  addBlock(pos: MapPos3, block: VoxelModel);

  // todo: add map objects and sprites here

  mapSizeToWorldSize(gridSize: MapSize3): WorldSize3;
  mapPosToWorldPos(gridPos: MapPos3): WorldCoord3;

  // intersects sprite with block
  // creates rigit body for each interesecting block
  intersectBlocks(
    ro: IRigitBody,
    pos: WorldCoord3,
    func: (target: IRigitBody) => boolean): boolean;

  //  readonly physics: IGamePhysics;
  //  readonly mechanics: IGameMechanics;
  //  setViewport(pxRect: PxRect): void;
}

export let defaultMaterial: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xffffff, vertexColors: true });
