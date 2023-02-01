import { TilingSprite } from "pixijs";
import { BufferAttribute, BufferGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { game } from "./main";
import { get_rand } from "./utils";

export type VoxelPoint = {
  x: number;
  y: number;
  z: number;
  color: number;
}

export type VoxelData = {
  name: string;
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

export class VoxelGeometryWriter {
  private triangles = 0;
  //public shadow_blocks = [];
  private total_blocks = 0;
  public dirty = true;
  private positions = 0;
  // number of colors
  private colors = 0;
  //public geometry!: BufferGeometry;
  //public v!: BufferAttribute;
  //public c!: BufferAttribute;
  //public prev_len = 0;
  //private idx: number = 0;
  private v: number[] = [];
  private c: number[] = [];
  private start_x: number = 0;
  private start_y: number = 0;
  private start_z: number = 0;
  private flip_z: number = 0;

  public appendVertice(x: number, y: number, z: number) {
    this.v.push(x + this.start_x);
    this.v.push(y + this.start_y);
    if (this.flip_z > 0) {
      this.v.push(this.flip_z - z + this.start_z);
    } else {
      this.v.push(z + this.start_z);
    }
  }

  public appendColor(n: number, r: number, g: number, b: number) {
    for (let i = 0; i < n; i++) {
      this.c.push(r);
      this.c.push(g);
      this.c.push(b);
    }
  }

  public setPosition(x: number, y: number, z: number) {
    this.start_x = x;
    this.start_y = y;
    this.start_z = z;
  }

  public setFlipZ(max_z: number) {
    this.flip_z = max_z;
  }

  public getGeometry(): BufferGeometry {
    let vertices = this.v;
    let colors = this.c;

    let v = new BufferAttribute(new Float32Array(vertices.length), 3);
    let c = new BufferAttribute(new Float32Array(colors.length), 3);

    let m = ((vertices.length / 3) | 0);
    for (var i = 0; i < m; i++) {
      let idx = i * 3;
      v.setXYZ(i, vertices[idx], vertices[idx + 1], vertices[idx + 2]);
      c.setXYZ(i, colors[idx], colors[idx + 1], colors[idx + 2]);
    }
    //for (var i = 0; i < vertices.length; i += 3) {
    //  v.setXYZ((i / 3) | 0, vertices[i], vertices[i + 1], vertices[i + 2]);
    //  c.setXYZW((i / 3) | 0, colors[i], colors[i + 1], colors[i + 2], 1);
    //}

    let geometry = new BufferGeometry();
    geometry.setAttribute('position', v);
    geometry.setAttribute('color', c);
    geometry.computeBoundingBox();
    geometry.computeVertexNormals();
    return geometry;
  }

  /*
      if (this.geometry != undefined && this.prev_len >= vertices.length) {
      for (var i = 0; i < vertices.length; i++) {
        this.v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
        this.c.setXYZW(i, colors[i][0], colors[i][1], colors[i][2], 1);
      }

      this.geometry.setDrawRange(0, vertices.length);
      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;
      this.geometry.computeVertexNormals();
 */
}

// voxel model builds geometry which can be used to build geometry
export class VoxelModel {
  private readonly data: VoxelData;

  public id: string;

  // copy of data.sx valyes
  public chunk_sx: number;
  public chunk_sy: number;
  public chunk_sz: number;
  public stride_z: number;

  // size of block in pixels
  public blockSize: number;

  // blocks populated from model
  public voxels: Int32Array;
  public wireframe = false;
  private triangles = 0;
  //public shadow_blocks = [];
  private total_blocks = 0;
  public dirty = true;
  private positions = 0;
  // number of colors
  private colors = 0;
  public geometry!: BufferGeometry;
  public v!: BufferAttribute;
  public c!: BufferAttribute;
  public prev_len = 0;
  public material!: MeshPhongMaterial;

  public constructor(id: string, data: VoxelData) {
    this.id = id;
    this.data = data;
    this.blockSize = 1;

    this.chunk_sx = data.sx;
    this.chunk_sy = data.sy;
    this.chunk_sz = data.sz;
    this.stride_z = this.chunk_sx * this.chunk_sy;
    this.voxels = new Int32Array(this.stride_z * this.chunk_sz);

    for (let i = 0; i < this.data.data.length; i++) {
      let d = this.data.data[i];
      let blockIdx = (d.x | 0) + ((d.y | 0) * this.chunk_sx) + ((d.z | 0) * this.stride_z);
      this.voxels[blockIdx] = d.color;
    }
  }

  static sameColor(block1, block2): boolean {
    if (((block1 >> 8) & 0xFFFFFF) == ((block2 >> 8) & 0xFFFFFF) && block1 != 0 && block2 != 0) {
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
          this.voxels[blockIdx] &= 0xFFFFFFC0;
        }
      }
    }

    // this.shadow_blocks = [];
    this.total_blocks = 0;
    writer.setFlipZ(this.chunk_sz * this.blockSize);

    for (var x = 0; x < this.chunk_sx; x++) {
      for (var y = 0; y < this.chunk_sy; y++) {
        for (var z = 0; z < this.chunk_sz; z++) {
          let blockIdx = this.getIdx(x, y, z);
          if (this.voxels[blockIdx] == 0) {
            continue; // Skip empty blocks
          }
          this.total_blocks++;
          // Check if hidden
          var left = 0, right = 0, above = 0, front = 0, back = 0, below = 0;
          if (z > 0) {
            if (this.voxels[blockIdx - this.stride_z] != 0) {
              back = 1;
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
              below = 1;
              this.voxels[blockIdx] = this.voxels[blockIdx] | 0x20; // bit 6 
            }
          }

          if (y < this.chunk_sy - 1) {
            if (this.voxels[blockIdx + this.chunk_sx] != 0) {
              above = 1;
              this.voxels[blockIdx] = this.voxels[blockIdx] | 0x2;
            }
          }
          if (z < this.chunk_sz - 1) {
            if (this.voxels[blockIdx + 1] != 0) {
              front = 1;
              this.voxels[blockIdx] = this.voxels[blockIdx] | 0x1;
            }
          }

          if (front == 1 && left == 1 && right == 1 && above == 1 && back == 1 && below == 1) {
            continue; // block is hidden (object)
          }

          // Draw blocks

          // Only draw below if we are an object
          if (!below) {
            // Get below (bit 6)
            if ((this.voxels[blockIdx] & 0x20) == 0) {
              var maxX = 0;
              var maxZ = 0;
              var end = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x20) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpZ = 0;
                for (var z_ = z; z_ < this.chunk_sz; z_++) {
                  let blockIdx_ = this.getIdx(x_, y, z_);
                  if ((this.voxels[blockIdx_] & 0x20) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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

              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ));
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ));
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);

              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ));
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);

              r = ((this.voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.voxels[blockIdx] >> 8) & 0xFF) / 255;
              writer.appendColor(6, r, g, b);
            }
          }

          if (!above) {
            // Get above (0010)
            if ((this.voxels[blockIdx] & 0x2) == 0) {
              var maxX = 0;
              var maxZ = 0;
              var end = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x2) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpZ = 0;
                for (var z_ = z; z_ < this.chunk_sz; z_++) {
                  let blockIdx_ = this.getIdx(x_, y, z_);
                  if ((this.voxels[blockIdx_] & 0x2) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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

              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize, z * this.blockSize + (this.blockSize * maxZ));
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize + (this.blockSize * maxZ));

              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize, z * this.blockSize + (this.blockSize * maxZ));
              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize, z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize);

              r = ((this.voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.voxels[blockIdx] >> 8) & 0xFF) / 255;
              writer.appendColor(6, r, g, b);
            }
          }
          if (!back) {
            // back  10000
            // this.shadow_blocks.push([x, y, z]);
            if ((this.voxels[blockIdx] & 0x10) == 0) {
              var maxX = 0;
              var maxY = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x10) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x_, y_, z);
                  if ((this.voxels[blockIdx_] & 0x10) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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
              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);

              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize);

              r = ((this.voxels[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.voxels[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.voxels[blockIdx] >> 8) & 0xFF) / 255;
              writer.appendColor(6, r, g, b);
            }
          }
          if (!front) {
            // front 0001
            if ((this.voxels[blockIdx] & 0x1) == 0) {
              var maxX = 0;
              var maxY = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                let blockIdx_ = this.getIdx(x_, y, z);
                // Check not drawn + same color
                if ((this.voxels[blockIdx_] & 0x1) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x_, y_, z);
                  if ((this.voxels[blockIdx_] & 0x1) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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

              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize + (this.blockSize * maxY), z * this.blockSize);
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize);
              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize);

              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize);
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize);
              writer.appendVertice(x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize);

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
                if ((this.voxels[blockIdx_] & 0x8) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxZ++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x, y_, z_);
                  if ((this.voxels[blockIdx_] & 0x8) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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

              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ));
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize + (this.blockSize * maxZ));

              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize + (this.blockSize * maxZ));
              writer.appendVertice(x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize);

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
                if ((this.voxels[blockIdx_] & 0x4) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
                  maxZ++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  let blockIdx_ = this.getIdx(x, y_, z_);
                  if ((this.voxels[blockIdx_] & 0x4) == 0 && VoxelModel.sameColor(this.voxels[blockIdx_], this.voxels[blockIdx])) {
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

              writer.appendVertice(x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize + (this.blockSize * maxZ));
              writer.appendVertice(x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ));

              writer.appendVertice(x * this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize + (this.blockSize * maxZ));
              writer.appendVertice(x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize);
              writer.appendVertice(x * this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize);

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
