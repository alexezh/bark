import { BufferAttribute, BufferGeometry, MeshPhongMaterial, Vector3 } from "three";
import { VoxelGeometryWriter } from "./voxelgeometrywriter";

export type VoxelPoint = {
  x: number;
  y: number;
  z: number;
  color: number;
}

export type VoxelFile = {
  frames: VoxelFileFrame[];
}

// collection of N^3 points; pretty expensive and needs to be optimized
export type VoxelFileFrame = {
  data: VoxelPoint[];
  sx: number;
  sy: number;
  sz: number;
}

export function makeVoxelPoint(buffer: Uint8Array, i: number): VoxelPoint {
  return {
    x: buffer[i++] & 0xFF,
    y: buffer[i++] & 0xFF,
    z: buffer[i++] & 0xFF,
    color: buffer[i] & 0xFF
  };
}

export class VoxelModel {
  public readonly voxUri: string;
  public readonly thumbnailUri: string;
  public readonly id: number;
  public readonly scale: number;
  public readonly frames: VoxelModelFrame[] = [];

  public constructor(id: number, voxUri: string, thumbnailUri: string, scale: number) {
    this.voxUri = voxUri;
    this.thumbnailUri = thumbnailUri;
    this.id = id;
    this.scale = scale;
  }

  // return model size in pixels (scaled)
  public get size(): Vector3 {
    let frame = this.frames[0];
    return new Vector3(frame.chunk_sx * this.scale | 0, frame.chunk_sy, frame.chunk_sz);
  }
}

// voxel model builds geometry which can be used to build geometry
export class VoxelModelFrame {
  private readonly data: VoxelFileFrame;

  // copy of data.sx valyes
  public chunk_sx: number;
  public chunk_sy: number;
  public chunk_sz: number;
  public stride_z: number;

  // blocks populated from model
  public wireframe = false;

  // we do not know how many elements we will have; so use array for now
  private v: number[] = [];

  /**
   * one color per 6 points
   */
  private c: number[] = [];

  private heightMap: Int8Array;

  public get verticeCount(): number { return this.v.length }
  public get colorCount(): number { return this.c.length }

  private constructor(data: VoxelFileFrame) {
    this.data = data;
    this.heightMap = new Int8Array(data.sx * data.sz);

    this.chunk_sx = data.sx;
    this.chunk_sy = data.sy;
    this.chunk_sz = data.sz;
    this.stride_z = this.chunk_sx * this.chunk_sy;
  }

  public static load(data: VoxelFileFrame): VoxelModelFrame {
    let model = new VoxelModelFrame(data);

    console.log(`loaded frame: ${model.chunk_sx} ${model.chunk_sy} ${model.chunk_sz}`);

    // 3d array takes too much space and we do not really need it
    let voxels = new Uint32Array(model.stride_z * model.chunk_sz);

    for (let i = 0; i < model.data.data.length; i++) {
      let d = model.data.data[i];
      let blockIdx = (d.x | 0) + ((d.y | 0) * model.chunk_sx) + ((d.z | 0) * model.stride_z);
      voxels[blockIdx] = d.color | 0x00000080;
    }

    model.loadModel(voxels);
    model.loadHeightMap(voxels);

    return model;
  }

  static sameColor(block1: number, block2: number): boolean {
    if ((block1 & 0xFFFFFF00) == (block2 & 0xFFFFFF00) && block1 != 0 && block2 != 0) {
      return true;
    }
    return false;
  };

  private getIdx(x: number, y: number, z: number): number {
    return z * this.stride_z + y * this.chunk_sx + x;
  }

  public getHeight(x: number, z: number) {
    return this.heightMap[z * this.chunk_sx + x];
  }

  public build(writer: VoxelGeometryWriter) {
    writer.appendVertices(this.v);
    writer.appendColors(this.c);
  }

  private loadHeightMap(voxels: Uint32Array) {
    for (var x = 0; x < this.chunk_sx; x++) {
      for (var z = 0; z < this.chunk_sz; z++) {
        // do y coord last in reverse order
        for (var y = this.chunk_sy - 1; y >= 0; y--) {
          let blockIdx = this.getIdx(x, y, z);
          if (voxels[blockIdx] !== 0) {
            this.heightMap[z * this.chunk_sx + x] = y;
            break;
          }
        }
      }
    }
  }

  // build geometry for the model
  private loadModel(voxels: Uint32Array) {
    var r = 0;
    var g = 0;
    var b = 0;

    // Reset faces
    for (var x = 0; x < this.chunk_sx; x++) {
      for (var y = 0; y < this.chunk_sy; y++) {
        for (var z = 0; z < this.chunk_sz; z++) {
          let blockIdx = this.getIdx(x, y, z);
          // use 8th bit to indicate that there is block
          voxels[blockIdx] &= 0xFFFFFF80;
        }
      }
    }

    for (var x = 0; x < this.chunk_sx; x++) {
      for (var y = 0; y < this.chunk_sy; y++) {
        for (var z = 0; z < this.chunk_sz; z++) {
          let blockIdx = this.getIdx(x, y, z);
          if (voxels[blockIdx] == 0) {
            continue; // Skip empty blocks
          }

          var left = 0, right = 0, above = 0, front = 0, back = 0, below = 0;
          if (z > 0) {
            if (voxels[blockIdx - this.stride_z] != 0) {
              back = 1;
              voxels[blockIdx] = voxels[blockIdx] | 0x10;
            }
          }

          if (z < this.chunk_sz - 1) {
            if (voxels[blockIdx + this.stride_z] != 0) {
              front = 1;
              voxels[blockIdx] = voxels[blockIdx] | 0x1;
            }
          }

          if (x > 0) {
            if (voxels[blockIdx - 1] != 0) {
              left = 1;
              voxels[blockIdx] = voxels[blockIdx] | 0x8;
            }
          }

          if (x < this.chunk_sx - 1) {
            if (voxels[blockIdx + 1] != 0) {
              right = 1;
              voxels[blockIdx] = voxels[blockIdx] | 0x4;
            }
          }

          if (y > 0) {
            if (voxels[blockIdx - this.chunk_sx] != 0) {
              below = 1;
              voxels[blockIdx] = voxels[blockIdx] | 0x20; // bit 6 
            }
          }

          if (y < this.chunk_sy - 1) {
            if (voxels[blockIdx + this.chunk_sx] != 0) {
              above = 1;
              voxels[blockIdx] = voxels[blockIdx] | 0x2;
            }
          }

          if (front == 1 && left == 1 && right == 1 && above == 1 && back == 1 && below == 1) {
            continue; // block is hidden (object)
          }

          // Draw blocks

          // Only draw below if we are an object
          if (!below) {
            // Get below (bit 6)
            if ((voxels[blockIdx] & 0x20) == 0) {
              var maxX = 0;
              var maxZ = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((voxels[blockIdx_] & 0x20) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpZ = 0;
                for (var z_ = z; z_ < this.chunk_sz; z_++) {
                  let blockIdx_ = this.getIdx(x_, y, z_);
                  if ((voxels[blockIdx_] & 0x20) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                    tmpZ++;
                  } else {
                    break;
                  }
                }
                if (tmpZ < maxZ || maxZ == 0) {
                  maxZ = tmpZ;
                }
              }
              for (var x_ = x; x_ < x + maxX; x_++) {
                for (var z_ = z; z_ < z + maxZ; z_++) {
                  let blockIdx_ = this.getIdx(x_, y, z_);
                  voxels[blockIdx_] = voxels[blockIdx_] | 0x20;
                }
              }

              this.appendVertice(x, y, z + maxZ);
              this.appendVertice(x + maxX, y, z + maxZ);
              this.appendVertice(x, y, z);

              this.appendVertice(x, y, z);
              this.appendVertice(x + maxX, y, z + maxZ);
              this.appendVertice(x + maxX, y, z);

              r = ((voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((voxels[blockIdx] >> 8) & 0xFF) / 255;
              this.appendColor(r, g, b);
            }
          }

          if (!above) {
            // Get above (0010)
            if ((voxels[blockIdx] & 0x2) == 0) {
              var maxX = 0;
              var maxZ = 0;
              var end = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((voxels[blockIdx_] & 0x2) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpZ = 0;
                for (var z_ = z; z_ < this.chunk_sz; z_++) {
                  let blockIdx_ = this.getIdx(x_, y, z_);
                  if ((voxels[blockIdx_] & 0x2) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                    tmpZ++;
                  } else {
                    break;
                  }
                }
                if (tmpZ < maxZ || maxZ == 0) {
                  maxZ = tmpZ;
                }
              }
              for (var x_ = x; x_ < x + maxX; x_++) {
                for (var z_ = z; z_ < z + maxZ; z_++) {
                  let blockIdx_ = this.getIdx(x_, y, z_);
                  voxels[blockIdx_] = voxels[blockIdx_] | 0x2;
                }
              }

              this.appendVertice(x + maxX, y + 1, z + maxZ);
              this.appendVertice(x, y + 1, z);
              this.appendVertice(x, y + 1, z + maxZ);

              this.appendVertice(x + maxX, y + 1, z + maxZ);
              this.appendVertice(x + maxX, y + 1, z);
              this.appendVertice(x, y + 1, z);

              r = ((voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((voxels[blockIdx] >> 8) & 0xFF) / 255;
              this.appendColor(r, g, b);
            }
          }
          if (!back) {
            // back  10000
            // this.shadow_blocks.push([x, y, z]);
            if ((voxels[blockIdx] & 0x10) == 0) {
              var maxX = 0;
              var maxY = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((voxels[blockIdx_] & 0x10) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x_, y_, z);
                  if ((voxels[blockIdx_] & 0x10) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                    tmpY++;
                  } else {
                    break;
                  }
                }
                if (tmpY < maxY || maxY == 0) {
                  maxY = tmpY;
                }
              }
              for (var x_ = x; x_ < x + maxX; x_++) {
                for (var y_ = y; y_ < y + maxY; y_++) {
                  let blockIdx_ = this.getIdx(x_, y_, z);
                  voxels[blockIdx_] = voxels[blockIdx_] | 0x10;
                }
              }

              this.appendVertice(x + maxX, y + maxY, z);
              this.appendVertice(x + maxX, y, z);
              this.appendVertice(x, y, z);

              this.appendVertice(x + maxX, y + maxY, z);
              this.appendVertice(x, y, z);
              this.appendVertice(x, y + maxY, z);

              r = ((voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((voxels[blockIdx] >> 8) & 0xFF) / 255;
              this.appendColor(r, g, b);
            }
          }
          if (!front) {
            // front 0001
            if ((voxels[blockIdx] & 0x1) == 0) {
              let maxX = 0;
              let maxY = 0;

              for (let x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((voxels[blockIdx_] & 0x1) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x_, y_, z);
                  if ((voxels[blockIdx_] & 0x1) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                    tmpY++;
                  } else {
                    break;
                  }
                }
                if (tmpY < maxY || maxY == 0) {
                  maxY = tmpY;
                }
              }
              for (var x_ = x; x_ < x + maxX; x_++) {
                for (var y_ = y; y_ < y + maxY; y_++) {
                  let blockIdx_ = this.getIdx(x_, y_, z);
                  voxels[blockIdx_] = voxels[blockIdx_] | 0x1;
                }
              }

              this.appendVertice(x + maxX, y + maxY, z + 1);
              this.appendVertice(x, y + maxY, z + 1);
              this.appendVertice(x, y, z + 1);

              this.appendVertice(x + maxX, y + maxY, z + 1);
              this.appendVertice(x, y, z + 1);
              this.appendVertice(x + maxX, y, z + 1);

              r = ((voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((voxels[blockIdx] >> 8) & 0xFF) / 255;
              this.appendColor(r, g, b);
            }
          }
          if (!left) {
            if ((voxels[blockIdx] & 0x8) == 0) {
              var maxZ = 0;
              var maxY = 0;

              for (var z_ = z; z_ < this.chunk_sz; z_++) {
                let blockIdx_ = this.getIdx(x, y, z_);
                // Check not drawn + same color
                if ((voxels[blockIdx_] & 0x8) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                  maxZ++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x, y_, z_);
                  if ((voxels[blockIdx_] & 0x8) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                    tmpY++;
                  } else {
                    break;
                  }
                }
                if (tmpY < maxY || maxY == 0) {
                  maxY = tmpY;
                }
              }
              for (var z_ = z; z_ < z + maxZ; z_++) {
                for (var y_ = y; y_ < y + maxY; y_++) {
                  let blockIdx_ = this.getIdx(x, y_, z_);
                  voxels[blockIdx_] = voxels[blockIdx_] | 0x8;
                }
              }

              this.appendVertice(x, y, z);
              this.appendVertice(x, y, z + maxZ);
              this.appendVertice(x, y + maxY, z + maxZ);

              this.appendVertice(x, y, z);
              this.appendVertice(x, y + maxY, z + maxZ);
              this.appendVertice(x, y + maxY, z);

              r = ((voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((voxels[blockIdx] >> 8) & 0xFF) / 255;
              this.appendColor(r, g, b);
            }
          }
          if (!right) {
            if ((voxels[blockIdx] & 0x4) == 0) {
              var maxZ = 0;
              var maxY = 0;

              for (var z_ = z; z_ < this.chunk_sz; z_++) {
                let blockIdx_ = this.getIdx(x, y, z_);
                // Check not drawn + same color
                if ((voxels[blockIdx_] & 0x4) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                  maxZ++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x, y_, z_);
                  if ((voxels[blockIdx_] & 0x4) == 0 && VoxelModelFrame.sameColor(voxels[blockIdx_], voxels[blockIdx])) {
                    tmpY++;
                  } else {
                    break;
                  }
                }
                if (tmpY < maxY || maxY == 0) {
                  maxY = tmpY;
                }
              }
              for (var z_ = z; z_ < z + maxZ; z_++) {
                for (var y_ = y; y_ < y + maxY; y_++) {
                  let blockIdx_ = this.getIdx(x, y_, z_);
                  voxels[blockIdx_] = voxels[blockIdx_] | 0x4;
                }
              }

              this.appendVertice(x + 1, y, z);
              this.appendVertice(x + 1, y + maxY, z + maxZ);
              this.appendVertice(x + 1, y, z + maxZ);

              this.appendVertice(x + 1, y + maxY, z + maxZ);
              this.appendVertice(x + 1, y, z);
              this.appendVertice(x + 1, y + maxY, z);

              r = ((voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((voxels[blockIdx] >> 8) & 0xFF) / 255;
              this.appendColor(r, g, b);
            }
          }
        }
      }
    }
  };

  private appendVertice(x: number, y: number, z: number) {
    this.v.push(x);
    this.v.push(y);
    this.v.push(z);
  }

  private appendColor(r: number, g: number, b: number) {
    this.c.push(r);
    this.c.push(g);
    this.c.push(b);
  }
}
