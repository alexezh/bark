import { BufferGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { GridSize } from "../posh/pos";
import { VoxelGeometryWriter } from "./voxelgeometrywriter";
import { VoxelModel } from "./voxelmodel";

export type MapBlock = {
  model: VoxelModel;
  frame: number;
}

export type MapBlockCoord = {
  model: VoxelModel;
  idx: number;
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
}

export class MapLayer {
  private size!: GridSize;
  private blockSize: number;
  private layerZ: number;
  private blocks!: (MapBlock | undefined)[];
  private _mesh!: Mesh;
  private geometry!: BufferGeometry;
  private material: MeshPhongMaterial;

  public get staticMesh(): Mesh { return this._mesh; }

  public constructor(material: MeshPhongMaterial, layerZ: number, blockSize: number) {
    this.material = material;
    this.blockSize = blockSize;
    this.size = { w: 10, h: 10 };
    this.layerZ = layerZ;
    this.blocks = new Array(this.size.w * this.size.h);
  }

  public load() {

  }

  public fill(tile: VoxelModel) {
    for (let idx = 0; idx < this.blocks.length; idx++) {
      this.blocks[idx] = { model: tile, frame: 0 }
    }
  }

  public build() {
    let writer = new VoxelGeometryWriter();
    for (let y = 0; y < this.size.h; y++) {
      for (let x = 0; x < this.size.w; x++) {
        let pos = y * this.size.w + x;
        let block = this.blocks[pos];
        if (block !== undefined) {
          let model = block.model.frames[block.frame];
          writer.setScale(this.blockSize / model.chunk_sx);
          writer.setPosition(this.blockSize * x, this.blockSize * y, this.layerZ);
          model.build(writer);
        }
      }
    }

    this.geometry = writer.getGeometry();
    this._mesh = new Mesh(this.geometry, this.material);
  }

  // the tricky part is boundaries
  findBlock(point: Vector3): MapBlockCoord | undefined {
    let x = (point.x / this.blockSize) | 0;
    let y = (point.y / this.blockSize) | 0;

    let pos = y * this.size.w + x;
    let block = this.blocks[pos];
    if (block == undefined) {
      return;
    }

    return {
      model: block.model,
      idx: pos,
      x: x * this.blockSize,
      y: y * this.blockSize,
      z: this.layerZ,
      sx: this.blockSize,
      sy: this.blockSize,
      sz: this.blockSize,
    };
  }

  deleteBlock(block: MapBlockCoord) {
    this.blocks[block.idx] = undefined;
  }
}

