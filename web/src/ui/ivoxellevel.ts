import { MeshPhongMaterial, Scene, Vector3 } from "three";
import { BlockPos3, BlockSize3, WorldCoord3, WorldSize3 } from "../voxel/pos3";
import { VoxelModel } from "../voxel/voxelmodel";
import { MapBlockRigitBody } from "../voxel/mapblockrigitbody";
import { IRigitBody } from "../voxel/irigitbody";

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
  // topmost: boolean;
}

export type MapBlockCoord = {
  model: VoxelModel;
  frame: number;

  /**
   * block index in the array (as z * width + x)
   */
  idx: number;
  mapPos: BlockPos3;
  mapSize: BlockSize3;
}

export type FileMapBlockDef = {
  blockId: number;
  uri: string;
}

export type FileMapBlock = {
  blockId: number;
  x: number;
  y: number;
  z: number;
}

export type WireCamera = {
  xPos: number;
  yPos: number;
  zPos: number;
  xLook: number;
  yLook: number;
  zLook: number;
  xRotation: number;
  yRotation: number;
  zRotation: number;
}

export type WireLevelInfo = {
  xMap: number;
  yMap: number;
  zMap: number;
}

export interface IVoxelLevelFile {
  get cameraPosition(): Vector3;
  set cameraPosition(value: Vector3);
  get mapSize(): BlockSize3;
  get blocks(): ReadonlyMap<number, FileMapBlock>;

  registerOnChangeCamera(func: () => void);
  registerOnChangeBlock(func: (blocks: FileMapBlock[]) => void);

  load(isTest: boolean): Promise<void>;
  deleteBlock(pos: BlockPos3);
  addBlock(pos: BlockPos3, blockId: number);
}

export interface IVoxelLevel {
  //readonly props: MapProps;
  get worldSize(): WorldSize3;
  get blockSize(): BlockSize3;
  get file(): IVoxelLevelFile;
  get floorLevel(): number;

  // called when game started; at this point properties become non-persisted
  onStart();

  // called when game stopped. properties reset to edit values
  onStop();

  /**
   * load level from current file
   */
  load(): Promise<boolean>;

  /**
   * load level into scene
   */
  loadScene(scene: Scene, editMode: boolean);

  /**
   * finds block by point; returns undefined if there is no block
   */
  getBlockByPoint(point: Vector3): MapBlockCoord | undefined;

  getBlockByPos(x: number, y: number, z: number): MapBlockCoord | undefined;

  /**
 * deletes block to runtime representation; not saved
 */
  deleteBlock(block: MapBlockCoord | MapBlockRigitBody);

  /**
   * adds block to runtime representation; not saved
   */
  addBlock(pos: BlockPos3, block: VoxelModel);

  rotateBlockXZ(block: MapBlockCoord);

  // todo: add map objects and sprites here

  blockSizeToWorldSize(gridSize: BlockSize3): WorldSize3;
  blockPosToWorldPos(gridPos: BlockPos3): WorldCoord3;

  worldPosToBlockPos(pos: WorldCoord3): BlockPos3;

  // intersects sprite with block
  // creates rigit body for each interesecting block
  // intersectBlocks(
  //   ro: IRigitBody,
  //   pos: WorldCoord3): boolean;


  /**
    * get distance from bottom of body to surface
    * positive distance is we are above the surface
   */
  getDistanceY(ro: IRigitBody, pos: Vector3): { intersectBody?: IRigitBody, height: number, distance: number };

  //  readonly physics: IGamePhysics;
  //  readonly mechanics: IGameMechanics;
  //  setViewport(pxRect: PxRect): void;
}

export let defaultMaterial: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xffffff, vertexColors: true });
