import { BufferGeometry, Group, Mesh, MeshPhongMaterial, Scene, Vector3 } from "three";
import { GridSize } from "../lib/pos";
import { MapBlock, MapBlockCoord } from "../ui/ivoxellevel";
import { BlockPos3, WorldCoord3 } from "../voxel/pos3";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { VoxelModel, VoxelModelFrame } from "../voxel/voxelmodel";
import { slice } from "lodash";

/**
 * single layer (y coordinate) of a level
 */
export class MeshLevelLayer {
  private size!: GridSize;
  private blockSize: number;
  private blocks!: (MapBlock | undefined)[];
  //private _mesh!: Mesh;
  //private geometry!: BufferGeometry;
  private _mesh: Mesh[] = [];
  private _meshDirty: boolean[] = [];
  private material: MeshPhongMaterial;
  public dirty: boolean = true;
  private sliceCount: number;
  private sliceZSize: number;

  // Z coordinate of layer in pixels
  public readonly layerY: number;

  public constructor(material: MeshPhongMaterial, size: GridSize, layerY: number, blockSize: number) {
    this.material = material;
    this.blockSize = blockSize;
    this.size = size;

    let totalCount = this.size.h * this.size.w;
    this.sliceCount = Math.floor(totalCount / 400) + 1;
    this.sliceZSize = Math.floor(this.size.h / this.sliceCount);

    this.layerY = layerY;
    this.blocks = new Array(this.size.w * this.size.h);
  }

  public build() {
    this._mesh.length = 0;
    this._meshDirty.length = 0;

    for (let i = 0; i < this.sliceCount; i++) {
      this._mesh.push(this.buildSlice(i));
      this._meshDirty.push(false);
    }

    this.dirty = false;
  }

  private buildSlice(sliceIdx: number): Mesh {
    let maxZ = Math.min((sliceIdx + 1) * this.sliceZSize, this.size.h);

    let vCount = 0;
    let cCount = 0;
    let blocks = 0;
    for (let z = sliceIdx * this.sliceZSize; z < maxZ; z++) {
      for (let x = 0; x < this.size.w; x++) {
        let pos = z * this.size.w + x;
        let block = this.blocks[pos];
        if (block !== undefined) {
          let model = block.model.frames[block.frame];
          blocks += 1;
          vCount += model.verticeCount;
          cCount += model.colorCount;
        }
      }
    }

    console.log('buildSlice ' + blocks);
    let writer: VoxelGeometryWriter = new VoxelGeometryWriter(vCount, cCount, 6);

    for (let z = sliceIdx * this.sliceZSize; z < maxZ; z++) {
      for (let x = 0; x < this.size.w; x++) {
        let pos = z * this.size.w + x;
        let block = this.blocks[pos];
        if (block !== undefined) {
          let model = block.model.frames[block.frame];
          writer!.setScale(this.blockSize / model.chunk_sx);
          writer!.setPosition(this.blockSize * x, this.blockSize * this.layerY, this.blockSize * z);
          model.build(writer!);
        }
      }
    }
    let geometry = writer.getGeometry();
    return new Mesh(geometry, this.material);
  }

  // use instance mesh for common things
  // use groups of N for other blocks

  //public get staticMesh(): Group { return this._mesh; }
  public addToScene(scene: Scene) {
    for (let m of this._mesh) {
      scene.add(m);
    }
  }

  public removeFromScene(scene: Scene) {
    for (let m of this._mesh) {
      scene.remove(m);
    }
  }

  public updateScene(scene: Scene) {
    for (let idx = 0; idx < this._mesh.length; idx++) {
      if (this._meshDirty[idx]) {
        scene.remove(this._mesh[idx]);
        this._mesh[idx] = this.buildSlice(idx);
        scene.add(this._mesh[idx]);
        this._meshDirty[idx] = false;
      }
    }
    this.dirty = false;
  }

  public getHeight(point: WorldCoord3): number {
    let x = (point.x / this.blockSize) | 0;
    let z = (point.z / this.blockSize) | 0;

    let idx = z * this.size.w + x;
    let block = this.blocks[idx];
    if (block === undefined) {
      return 0;
    }

    let frame: VoxelModelFrame = block.model.frames[block.frame];
    if (!frame) {
      return 0;
    }

    let height = frame.getHeight((point.x | 0) - x * this.blockSize, (point.z | 0) - z * this.blockSize);

    return height;
  }

  /**
   * return block by point coord
   */
  public getBlockByPoint(point: WorldCoord3): MapBlockCoord | undefined {
    let x = (point.x / this.blockSize) | 0;
    let z = (point.z / this.blockSize) | 0;

    let pos = z * this.size.w + x;
    let block = this.blocks[pos];
    if (block === undefined) {
      return undefined;
    }

    return {
      model: block.model,
      frame: (block) ? block.frame : 0,
      idx: pos,
      mapPos: {
        x: x,
        y: this.layerY,
        z: z,
      },
      mapSize: {
        sx: 1,
        sy: 1,
        sz: 1
      }
    };
  }

  public getBlockByPos(xBlock: number, zBlock: number): MapBlockCoord | undefined {
    let idx = zBlock * this.size.w + xBlock;
    let b = this.blocks[idx];
    if (b === undefined) {
      return undefined;
    }
    return {
      model: b!.model,
      frame: b!.frame,
      idx: idx,
      mapPos: {
        x: xBlock,
        z: zBlock,
        y: this.layerY,
      },
      mapSize: {
        sx: 1,
        sy: 1,
        sz: 1
      }
    };
  }

  public deleteBlock(block: MapBlockCoord) {
    this.blocks[block.idx] = undefined;
    let sliceIdx = Math.floor(block.mapPos.z / this.sliceZSize);
    this._meshDirty[sliceIdx] = true;
    this.dirty = true;
  }

  public deleteBlockByPos(xPos: number, zPos: number) {
    this.blocks[zPos * this.size.w + xPos] = undefined;
    let sliceIdx = Math.floor(zPos / this.sliceZSize);
    this._meshDirty[sliceIdx] = true;
    this.dirty = true;
  }

  public addBlock(pos: BlockPos3, block: VoxelModel) {
    let idx = pos.z * this.size.w + pos.x;
    this.blocks[idx] = { model: block, frame: 0, topmost: false };
    let sliceIdx = Math.floor(pos.z / this.sliceZSize);
    this._meshDirty[sliceIdx] = true;
    this.dirty = true;
  }
}

