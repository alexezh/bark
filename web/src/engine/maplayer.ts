import { BufferGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { GridSize } from "../posh/pos";
import { MapBlock, MapBlockCoord } from "../ui/ivoxelmap";
import { MapPos3 } from "../voxel/pos3";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { VoxelModel } from "../voxel/voxelmodel";

export class MapLayer {
  private size!: GridSize;
  private blockSize: number;
  private blocks!: (MapBlock | undefined)[];
  private _mesh!: Mesh;
  private geometry!: BufferGeometry;
  private material: MeshPhongMaterial;

  // Z coordinate of layer in pixels
  public readonly layerY: number;

  public get staticMesh(): Mesh { return this._mesh; }

  public constructor(material: MeshPhongMaterial, layerZ: number, blockSize: number) {
    this.material = material;
    this.blockSize = blockSize;
    this.size = { w: 20, h: 20 };
    this.layerY = layerZ;
    this.blocks = new Array(this.size.w * this.size.h);
  }

  public load() {

  }

  public fill(tile: VoxelModel) {
    for (let idx = 0; idx < this.blocks.length; idx++) {
      this.blocks[idx] = { model: tile, frame: 0, topmost: true }
    }
  }

  public build() {
    let writer = new VoxelGeometryWriter();
    for (let z = 0; z < this.size.h; z++) {
      for (let x = 0; x < this.size.w; x++) {
        let pos = z * this.size.w + x;
        let block = this.blocks[pos];
        if (block !== undefined) {
          let model = block.model.frames[block.frame];
          writer.setScale(this.blockSize / model.chunk_sx);
          writer.setPosition(this.blockSize * x, this.blockSize * this.layerY, this.blockSize * z);
          model.build(writer);
        }
      }
    }

    this.geometry = writer.getGeometry();
    this._mesh = new Mesh(this.geometry, this.material);
  }

  // the tricky part is boundaries
  public findBlock(point: Vector3): MapBlockCoord | undefined {
    let x = (point.x / this.blockSize) | 0;
    let z = (point.z / this.blockSize) | 0;

    let pos = z * this.size.w + x;
    let block = this.blocks[pos];

    return {
      model: block?.model,
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

  public deleteBlock(block: MapBlockCoord) {
    this.blocks[block.idx] = undefined;
  }

  public getBlock(xMap: number, zMap: number): MapBlockCoord | undefined {
    let idx = zMap * this.size.w + xMap;
    let b = this.blocks[idx];
    if (b === undefined) {
      return undefined;
    }
    return {
      model: b?.model,
      idx: idx,
      mapPos: {
        x: xMap,
        z: zMap,
        y: this.layerY,
      },
      mapSize: {
        sx: 1,
        sy: 1,
        sz: 1
      }
    };
  }

  public addBlock(pos: MapPos3, block: VoxelModel) {
    let idx = pos.z * this.size.w + pos.x;
    this.blocks[idx] = { model: block, frame: 0, topmost: false };
  }
}

