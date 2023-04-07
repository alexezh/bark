import { BufferGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { GridSize } from "../posh/pos";
import { MapBlock, MapBlockCoord } from "../ui/ivoxelmap";
import { BlockPos3 } from "../voxel/pos3";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { VoxelModel } from "../voxel/voxelmodel";

export class MapLayer {
  private size!: GridSize;
  private blockSize: number;
  private blocks!: (MapBlock | undefined)[];
  private _mesh!: Mesh;
  private geometry!: BufferGeometry;
  private material: MeshPhongMaterial;
  public dirty: boolean = true;

  // Z coordinate of layer in pixels
  public readonly layerY: number;

  public get staticMesh(): Mesh { return this._mesh; }

  public constructor(material: MeshPhongMaterial, size: GridSize, layerZ: number, blockSize: number) {
    this.material = material;
    this.blockSize = blockSize;
    this.size = size;
    this.layerY = layerZ;
    this.blocks = new Array(this.size.w * this.size.h);
  }

  public load() {

  }

  public build() {
    let count = 0;
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
          count++;
        }
      }
    }

    console.log(`MapLayer: meshes: ${count}`);
    this.geometry = writer.getGeometry();
    this._mesh = new Mesh(this.geometry, this.material);
    this.dirty = false;
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
    this.dirty = true;
  }

  public deleteBlockByCoord(x: number, z: number) {
    this.blocks[z * this.size.w + x] = undefined;
    this.dirty = true;
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

  public addBlock(pos: BlockPos3, block: VoxelModel) {
    let idx = pos.z * this.size.w + pos.x;
    this.blocks[idx] = { model: block, frame: 0, topmost: false };
    this.dirty = true;
  }
}

