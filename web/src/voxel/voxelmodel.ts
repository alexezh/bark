import { TilingSprite } from "pixijs";
import { BufferAttribute, BufferGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { game } from "./main";
import { get_rand } from "./utils";
import { VoxelGeometryWriter } from "./voxelgeometrywriter";

export type VoxelPoint = {
  x: number;
  y: number;
  z: number;
  color: number;
}

export type VoxelFile = {
  name: string;
  frames: VoxelFileFrame[];
}

export type VoxelFileFrame = {
  data: VoxelPoint[];
  sx: number;
  sy: number;
  sz: number;
}

// ATT: swapping y and z
export function makeVoxelPoint(buffer: Uint8Array, i: number): VoxelPoint {
  return {
    x: buffer[i++] & 0xFF,
    y: buffer[i++] & 0xFF,
    z: buffer[i++] & 0xFF,
    color: buffer[i] & 0xFF
  };
}

export class VoxelModel {
  public id: string;
  public frames: VoxelModelFrame[] = [];

  public constructor(id: string) {
    this.id = id;
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
  public voxels: Uint32Array;
  public wireframe = false;
  public geometry!: BufferGeometry;
  public v!: BufferAttribute;
  public c!: BufferAttribute;
  public prev_len = 0;
  public material!: MeshPhongMaterial;

  public constructor(data: VoxelFileFrame) {
    this.data = data;

    this.chunk_sx = data.sx;
    this.chunk_sy = data.sy;
    this.chunk_sz = data.sz;
    this.stride_z = this.chunk_sx * this.chunk_sy;
    this.voxels = new Uint32Array(this.stride_z * this.chunk_sz);

    for (let i = 0; i < this.data.data.length; i++) {
      let d = this.data.data[i];
      let blockIdx = (d.x | 0) + ((d.y | 0) * this.chunk_sx) + ((d.z | 0) * this.stride_z);
      this.voxels[blockIdx] = d.color;
    }
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

  // build geometry for the model
  public build(writer: VoxelGeometryWriter) {
    var r = 0;
    var g = 0;
    var b = 0;

    // Block structure
    // BLOCK: [R-color][G-color][B-color][0][00][back_left_right_above_front]
    //           8bit    8bit     8it   2bit(floodfill)     6bit(faces)

    // Reset faces
    for (var x = 0; x < this.chunk_sx; x++) {
      for (var y = 0; y < this.chunk_sy; y++) {
        for (var z = 0; z < this.chunk_sz; z++) {
          let blockIdx = this.getIdx(x, y, z);
          this.voxels[blockIdx] &= 0xFFFFFF00;
        }
      }
    }

    for (var x = 0; x < this.chunk_sx; x++) {
      for (var y = 0; y < this.chunk_sy; y++) {
        for (var z = 0; z < this.chunk_sz; z++) {
          let blockIdx = this.getIdx(x, y, z);
          if (this.voxels[blockIdx] == 0) {
            continue; // Skip empty blocks
          }

          var left = 0, right = 0, above = 0, front = 0, back = 0, below = 0;
          if (z > 0) {
            if ((this.voxels[blockIdx - this.stride_z] & 0xffffff00) != 0) {
              below = 1;
              this.voxels[blockIdx] = this.voxels[blockIdx] | 0x10;
            }
          }

          if (x > 0) {
            if (this.voxels[blockIdx - 1] != 0) {
              left = 1;
              this.voxels[blockIdx] = this.voxels[blockIdx] | 0x8;
            }
          }

          if (x < this.chunk_sx - 1) {
            if (this.voxels[blockIdx + 1] != 0) {
              right = 1;
              this.voxels[blockIdx] = this.voxels[blockIdx] | 0x4;
            }
          }

          if (y > 0) {
            if (this.voxels[blockIdx - this.chunk_sx] != 0) {
              back = 1;
              this.voxels[blockIdx] = this.voxels[blockIdx] | 0x20; // bit 6 
            }
          }

          if (y < this.chunk_sy - 1) {
            if (this.voxels[blockIdx + this.chunk_sx] != 0) {
              front = 1;
              this.voxels[blockIdx] = this.voxels[blockIdx] | 0x2;
            }
          }
          if (z < this.chunk_sz - 1) {
            if ((this.voxels[blockIdx + this.stride_z] & 0xffffff00) != 0) {
              above = 1;
              this.voxels[blockIdx] = this.voxels[blockIdx] | 0x1;
            }
          }

          if (front == 1 && left == 1 && right == 1 && above == 1 && back == 1 && below == 1) {
            continue; // block is hidden (object)
          }

          // Draw blocks

          // Only draw below if we are an object
          if (!back) {
            // Get below (bit 6)
            if ((this.voxels[blockIdx] & 0x20) == 0) {
              var maxX = 0;
              var maxZ = 0;
              var end = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x20) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpZ = 0;
                for (var z_ = z; z_ < this.chunk_sz; z_++) {
                  let blockIdx_ = this.getIdx(x_, y, z_);
                  if ((this.voxels[blockIdx_] & 0x20) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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
                  this.voxels[blockIdx_] = this.voxels[blockIdx_] | 0x20;
                }
              }
              maxX--;
              maxZ--;

              writer.appendVertice(x + maxX, y - 1, z + (maxZ));
              writer.appendVertice(x - 1, y - 1, z + (maxZ));
              writer.appendVertice(x - 1, y - 1, z - 1);

              writer.appendVertice(x + maxX, y - 1, z + (maxZ));
              writer.appendVertice(x - 1, y - 1, z - 1);
              writer.appendVertice(x + maxX, y - 1, z - 1);

              r = ((this.voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.voxels[blockIdx] >> 8) & 0xFF) / 255;
              writer.appendColor(6, r, g, b);
            }
          }

          if (!front) {
            // Get above (0010)
            if ((this.voxels[blockIdx] & 0x2) == 0) {
              var maxX = 0;
              var maxZ = 0;
              var end = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x2) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpZ = 0;
                for (var z_ = z; z_ < this.chunk_sz; z_++) {
                  let blockIdx_ = this.getIdx(x_, y, z_);
                  if ((this.voxels[blockIdx_] & 0x2) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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
                  this.voxels[blockIdx_] = this.voxels[blockIdx_] | 0x2;
                }
              }
              maxX--;
              maxZ--;

              writer.appendVertice(x + maxX, y, z + (maxZ));
              writer.appendVertice(x - 1, y, z - 1);
              writer.appendVertice(x - 1, y, z + (maxZ));

              writer.appendVertice(x + maxX, y, z + (maxZ));
              writer.appendVertice(x + maxX, y, z - 1);
              writer.appendVertice(x - 1, y, z - 1);

              r = ((this.voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.voxels[blockIdx] >> 8) & 0xFF) / 255;
              writer.appendColor(6, r, g, b);
            }
          }
          if (!below) {
            // back  10000
            // this.shadow_blocks.push([x, y, z]);
            if ((this.voxels[blockIdx] & 0x10) == 0) {
              var maxX = 0;
              var maxY = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x10) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x_, y_, z);
                  if ((this.voxels[blockIdx_] & 0x10) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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
                  this.voxels[blockIdx_] = this.voxels[blockIdx_] | 0x10;
                }
              }
              maxX--;
              maxY--;
              writer.appendVertice(x + maxX, y - 1, z - 1);
              writer.appendVertice(x + maxX, y + maxY, z - 1);
              writer.appendVertice(x - 1, y - 1, z - 1);

              writer.appendVertice(x - 1, y - 1, z - 1);
              writer.appendVertice(x + maxX, y + maxY, z - 1);
              writer.appendVertice(x - 1, y + maxY, z - 1);

              r = ((this.voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.voxels[blockIdx] >> 8) & 0xFF) / 255;
              writer.appendColor(6, r, g, b);
            }
          }
          if (!above) {
            // front 0001
            if ((this.voxels[blockIdx] & 0x1) == 0) {
              let maxX = 0;
              let maxY = 0;

              for (let x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x1) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                let tmpY = 0;
                for (let y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x_, y_, z);
                  if ((this.voxels[blockIdx_] & 0x1) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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
                  this.voxels[blockIdx_] = this.voxels[blockIdx_] | 0x1;
                }
              }
              maxX--;
              maxY--;

              writer.appendVertice(x + maxX, y + maxY, z);
              writer.appendVertice(x - 1, y + maxY, z);
              writer.appendVertice(x - 1, y - 1, z);

              writer.appendVertice(x + maxX, y + maxY, z);
              writer.appendVertice(x - 1, y - 1, z);
              writer.appendVertice(x + maxX, y - 1, z);

              r = ((this.voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.voxels[blockIdx] >> 8) & 0xFF) / 255;
              writer.appendColor(6, r, g, b);
            }
          }
          if (!left) {
            if ((this.voxels[blockIdx] & 0x8) == 0) {
              var maxZ = 0;
              var maxY = 0;

              for (var z_ = z; z_ < this.chunk_sz; z_++) {
                let blockIdx_ = this.getIdx(x, y, z_);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x8) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxZ++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x, y_, z_);
                  if ((this.voxels[blockIdx_] & 0x8) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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
                  this.voxels[blockIdx_] = this.voxels[blockIdx_] | 0x8;
                }
              }
              maxZ--;
              maxY--;

              writer.appendVertice(x - 1, y - 1, z - 1);
              writer.appendVertice(x - 1, y - 1, z + (maxZ));
              writer.appendVertice(x - 1, y + maxY, z + (maxZ));

              writer.appendVertice(x - 1, y - 1, z - 1);
              writer.appendVertice(x - 1, y + maxY, z + (maxZ));
              writer.appendVertice(x - 1, y + maxY, z - 1);

              r = ((this.voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.voxels[blockIdx] >> 8) & 0xFF) / 255;
              writer.appendColor(6, r, g, b);
            }
          }
          if (!right) {
            if ((this.voxels[blockIdx] & 0x4) == 0) {
              var maxZ = 0;
              var maxY = 0;

              for (var z_ = z; z_ < this.chunk_sz; z_++) {
                let blockIdx_ = this.getIdx(x, y, z_);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x4) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxZ++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x, y_, z_);
                  if ((this.voxels[blockIdx_] & 0x4) == 0 && VoxelModelFrame.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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
                  this.voxels[blockIdx_] = this.voxels[blockIdx_] | 0x4;
                }
              }
              maxZ--;
              maxY--;

              writer.appendVertice(x, y - 1, z - 1);
              writer.appendVertice(x, y + maxY, z + (maxZ));
              writer.appendVertice(x, y - 1, z + (maxZ));

              writer.appendVertice(x, y + maxY, z + (maxZ));
              writer.appendVertice(x, y - 1, z - 1);
              writer.appendVertice(x, y + maxY, z - 1);

              r = ((this.voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.voxels[blockIdx] >> 8) & 0xFF) / 255;
              writer.appendColor(6, r, g, b);
            }
          }
        }
      }
    }
  };
}
