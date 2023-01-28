import { BufferAttribute, BufferGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { game } from "./main";
import { get_rand } from "./utils";

export type VoxelPoint = {
  x;
  y;
  z;
  color;
}

export type VoxelData = {
  name: string;
  data: VoxelData[];
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

export interface IVoxelCompositeModel {
  hasBlock(x: number, y: number, z: number): boolean;
}

// a model can be a freestanding or used as part of scene
// in the latter case we are going to optimize meshes across
// models by using hasBlock
export class VoxelModel {
  private readonly data: VoxelData;

  public id: string;
  public chunk_sx: number;
  public chunk_sy: number;
  public chunk_sz: number;
  public stride_z: number;
  // blockSize is actually scale with 1 being full size
  public blockSize: number;
  public owner: any;
  public mesh!: Mesh;
  public blocks: Int32Array;
  public wireframe = false;
  public triangles = 0;
  //public shadow_blocks = [];
  public total_blocks = 0;
  public dirty = true;
  public positions = 0;
  public colors = 0;
  public geometry!: BufferGeometry;
  public v!: BufferAttribute;
  public c!: BufferAttribute;
  public prev_len = 0;
  public material!: MeshPhongMaterial;

  public constructor(id: string, data: VoxelData, x: number, y: number, z: number) {
    this.id = id;
    this.data = data;
    this.blockSize = 16;

    this.from_x = x;
    this.from_y = y;
    this.from_z = z;
    this.to_x = x + data.sx * this.blockSize;
    this.to_y = x + data.sy * this.blockSize;
    this.to_z = x + data.sz * this.blockSize;

    this.chunk_sx = data.sx;
    this.chunk_sy = data.sy;
    this.chunk_sz = data.sz;
    this.stride_z = this.chunk_sx * this.chunk_sy;
    this.blocks = new Int32Array(this.stride_z * this.chunk_sz);
  }


  destroy() {
    game.scene.remove(this.mesh);
  };

  static sameColor(block1, block2): boolean {
    if (((block1 >> 8) & 0xFFFFFF) == ((block2 >> 8) & 0xFFFFFF) && block1 != 0 && block2 != 0) {
      return true;
    }
    return false;
  };

  build(cm: IVoxelCompositeModel | undefined) {
    var vertices: any = [];
    var colors: any = [];
    var cc = 0; // Color counter
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
          let blockIdx = x * y * z;
          this.blocks[blockIdx] &= 0xFFFFFFC0;
        }
      }
    }

    // this.shadow_blocks = [];
    this.total_blocks = 0;

    for (var x = 0; x < this.chunk_sx; x++) {
      for (var y = 0; y < this.chunk_sy; y++) {
        for (var z = 0; z < this.chunk_sz; z++) {
          let blockIdx = x * y * z;
          if (this.blocks[blockIdx] == 0) {
            continue; // Skip empty blocks
          }
          this.total_blocks++;
          // Check if hidden
          var left = 0, right = 0, above = 0, front = 0, back = 0, below = 0;
          if (z > 0) {
            if (this.blocks[blockIdx - this.stride_z] != 0) {
              back = 1;
              this.blocks[blockIdx] = this.blocks[blockIdx] | 0x10;
            }
          } else {
            if (cm !== undefined) {
              // Check hit towards other chunks.
              if (cm.hasBlock(
                (x + this.from_x) | 0,
                (y + this.from_y) | 0,
                ((z - 1) + this.from_z) | 0)) {
                back = 1;
                this.blocks[blockIdx] = this.blocks[blockIdx] | 0x10;
              }
            }
          }

          if (x > 0) {
            if (this.blocks[blockIdx - 1] != 0) {
              left = 1;
              this.blocks[blockIdx] = this.blocks[blockIdx] | 0x8;
            }
          } else {
            if (cm !== undefined) {
              // Check hit towards other chunks.
              if (cm.hasBlock(
                ((x - 1) + this.from_x) | 0,
                (y + this.from_y) | 0,
                (z + this.from_z) | 0
              )) {
                left = 1;
                this.blocks[blockIdx] = this.blocks[blockIdx] | 0x8;
              }
            }
          }
          if (x < this.chunk_sx - 1) {
            if (this.blocks[blockIdx + 1] != 0) {
              right = 1;
              this.blocks[blockIdx] = this.blocks[blockIdx] | 0x4;
            }
          } else {
            if (cm !== undefined) {
              if (cm.hasBlock(
                (x + 1 + this.from_x) | 0,
                (y + this.from_y) | 0,
                (z + this.from_z) | 0
              )) {
                right = 1;
                this.blocks[blockIdx] = this.blocks[blockIdx] | 0x4;
              }
            }
          }
          // Only check / draw bottom if we are a object!
          if (cm === undefined) {
            if (y > 0) {
              if (this.blocks[x][y - 1][z] != 0) {
                below = 1;
                this.blocks[blockIdx] = this.blocks[blockIdx] | 0x20; // bit 6 
              }
            }
          }

          if (y < this.chunk_sy - 1) {
            if (this.blocks[x][y + 1][z] != 0) {
              above = 1;
              this.blocks[blockIdx] = this.blocks[blockIdx] | 0x2;
            }
          } else {
            if (cm !== undefined) {
              // Check hit towards other chunks.
              if (cm.hasBlock(
                (x + this.from_x * this.chunk_sx) | 0,
                ((y + 1) + this.from_y * this.chunk_sy) | 0,
                (z + this.from_z * this.chunk_sz) | 0
              )) {
                above = 1;
                this.blocks[blockIdx] = this.blocks[blockIdx] | 0x2;
              }
            }
          }
          if (z < this.chunk_sz - 1) {
            if (this.blocks[blockIdx + 1] != 0) {
              front = 1;
              this.blocks[blockIdx] = this.blocks[blockIdx] | 0x1;
            }
          } else {
            if (cm !== undefined) {
              // Check hit towards other chunks.
              if (cm.hasBlock(
                (x + this.from_x * this.chunk_sx) | 0,
                (y + this.from_y * this.chunk_sy) | 0,
                ((z - 1) + this.from_z * this.chunk_sz) | 0
              )) {
                front = 1;
                this.blocks[blockIdx] = this.blocks[blockIdx] | 0x1;
              }
            }
          }

          if (cm !== undefined) {
            if (front == 1 && left == 1 && right == 1 && above == 1 && back == 1) {
              continue; // block is hidden (world)
            }
          } else {
            if (front == 1 && left == 1 && right == 1 && above == 1 && back == 1 && below == 1) {
              continue; // block is hidden (object)
            }
          }

          // Draw blocks

          // Only draw below if we are an object
          if (cm === undefined) {
            if (!below) {
              // Get below (bit 6)
              if ((this.blocks[blockIdx] & 0x20) == 0) {
                var maxX = 0;
                var maxZ = 0;
                var end = 0;

                for (var x_ = x; x_ < this.chunk_sx; x_++) {
                  // Check not drawn + same color
                  if ((this.blocks[x_][y][z] & 0x20) == 0 && VoxelModel.sameColor(this.blocks[x_][y][z], this.blocks[blockIdx])) {
                    maxX++;
                  } else {
                    break;
                  }
                  var tmpZ = 0;
                  for (var z_ = z; z_ < this.chunk_sz; z_++) {
                    if ((this.blocks[x_][y][z_] & 0x20) == 0 && VoxelModel.sameColor(this.blocks[x_][y][z_], this.blocks[blockIdx])) {
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
                    this.blocks[x_][y][z_] = this.blocks[x_][y][z_] | 0x20;
                  }
                }
                maxX--;
                maxZ--;

                vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ)]);
                vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ)]);
                vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);

                vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ)]);
                vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
                vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);

                r = ((this.blocks[blockIdx] >> 24) & 0xFF) / 255;
                g = ((this.blocks[blockIdx] >> 16) & 0xFF) / 255;
                b = ((this.blocks[blockIdx] >> 8) & 0xFF) / 255;
                colors[cc++] = [r, g, b];
                colors[cc++] = [r, g, b];
                colors[cc++] = [r, g, b];
                colors[cc++] = [r, g, b];
                colors[cc++] = [r, g, b];
                colors[cc++] = [r, g, b];
              }
            }
          }

          if (!above) {
            // Get above (0010)
            if ((this.blocks[blockIdx] & 0x2) == 0) {
              var maxX = 0;
              var maxZ = 0;
              var end = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                // Check not drawn + same color
                if ((this.blocks[x_][y][z] & 0x2) == 0 && VoxelModel.sameColor(this.blocks[x_][y][z], this.blocks[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpZ = 0;
                for (var z_ = z; z_ < this.chunk_sz; z_++) {
                  if ((this.blocks[x_][y][z_] & 0x2) == 0 && VoxelModel.sameColor(this.blocks[x_][y][z_], this.blocks[blockIdx])) {
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
                  this.blocks[x_][y][z_] = this.blocks[x_][y][z_] | 0x2;
                }
              }
              maxX--;
              maxZ--;

              vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize, z * this.blockSize + (this.blockSize * maxZ)]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize + (this.blockSize * maxZ)]);

              vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize, z * this.blockSize + (this.blockSize * maxZ)]);
              vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize, z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize, z * this.blockSize - this.blockSize]);

              r = ((this.blocks[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.blocks[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.blocks[blockIdx] >> 8) & 0xFF) / 255;
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
            }
          }
          if (!back) {
            // back  10000
            // this.shadow_blocks.push([x, y, z]);
            if ((this.blocks[blockIdx] & 0x10) == 0) {
              var maxX = 0;
              var maxY = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                // Check not drawn + same color
                if ((this.blocks[x_][y][z] & 0x10) == 0 && VoxelModel.sameColor(this.blocks[x_][y][z], this.blocks[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  if ((this.blocks[x_][y_][z] & 0x10) == 0 && VoxelModel.sameColor(this.blocks[x_][y_][z], this.blocks[blockIdx])) {
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
                  this.blocks[x_][y_][z] = this.blocks[x_][y_][z] | 0x10;
                }
              }
              maxX--;
              maxY--;
              vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);

              vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize]);

              r = ((this.blocks[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.blocks[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.blocks[blockIdx] >> 8) & 0xFF) / 255;
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
            }
          }
          if (!front) {
            // front 0001
            if ((this.blocks[blockIdx] & 0x1) == 0) {
              var maxX = 0;
              var maxY = 0;

              for (var x_ = x; x_ < this.chunk_sx; x_++) {
                // Check not drawn + same color
                if ((this.blocks[x_][y][z] & 0x1) == 0 && VoxelModel.sameColor(this.blocks[x_][y][z], this.blocks[blockIdx])) {
                  maxX++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  if ((this.blocks[x_][y_][z] & 0x1) == 0 && VoxelModel.sameColor(this.blocks[x_][y_][z], this.blocks[blockIdx])) {
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
                  this.blocks[x_][y_][z] = this.blocks[x_][y_][z] | 0x1;
                }
              }
              maxX--;
              maxY--;

              vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize + (this.blockSize * maxY), z * this.blockSize]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize]);
              vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize]);

              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize]);
              vertices.push([x * this.blockSize + (this.blockSize * maxX), y * this.blockSize - this.blockSize, z * this.blockSize]);

              r = ((this.blocks[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.blocks[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.blocks[blockIdx] >> 8) & 0xFF) / 255;
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
            }
          }
          if (!left) {
            if ((this.blocks[blockIdx] & 0x8) == 0) {
              var maxZ = 0;
              var maxY = 0;

              for (var z_ = z; z_ < this.chunk_sz; z_++) {
                let blockIdx_ = x * y * z_;
                // Check not drawn + same color
                if ((this.blocks[blockIdx_] & 0x8) == 0 && VoxelModel.sameColor(this.blocks[blockIdx_], this.blocks[blockIdx])) {
                  maxZ++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  blockIdx_ = x * y_ * z_;
                  if ((this.blocks[blockIdx_] & 0x8) == 0 && VoxelModel.sameColor(this.blocks[blockIdx_], this.blocks[blockIdx])) {
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
                  let blockIdx_ = x * y_ * z_;
                  this.blocks[blockIdx_] = this.blocks[blockIdx_] | 0x8;
                }
              }
              maxZ--;
              maxY--;

              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ)]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize + (this.blockSize * maxZ)]);

              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize + (this.blockSize * maxZ)]);
              vertices.push([x * this.blockSize - this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize]);

              r = ((this.blocks[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.blocks[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.blocks[blockIdx] >> 8) & 0xFF) / 255;
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
            }
          }
          if (!right) {
            if ((this.blocks[blockIdx] & 0x4) == 0) {
              var maxZ = 0;
              var maxY = 0;

              for (var z_ = z; z_ < this.chunk_sz; z_++) {
                let blockIdx_ = x * y * z_;
                // Check not drawn + same color
                if ((this.blocks[blockIdx_] & 0x4) == 0 && VoxelModel.sameColor(this.blocks[blockIdx_], this.blocks[blockIdx])) {
                  maxZ++;
                } else {
                  break;
                }
                var tmpY = 0;
                for (var y_ = y; y_ < this.chunk_sy; y_++) {
                  blockIdx_ = x * y_ * z_;
                  if ((this.blocks[blockIdx_] & 0x4) == 0 && VoxelModel.sameColor(this.blocks[blockIdx_], this.blocks[blockIdx])) {
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
                  let blockIdx_ = x * y_ * z_;
                  this.blocks[blockIdx_] = this.blocks[blockIdx_] | 0x4;
                }
              }
              maxZ--;
              maxY--;

              vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize + (this.blockSize * maxZ)]);
              vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize + (this.blockSize * maxZ)]);

              vertices.push([x * this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize + (this.blockSize * maxZ)]);
              vertices.push([x * this.blockSize, y * this.blockSize - this.blockSize, z * this.blockSize - this.blockSize]);
              vertices.push([x * this.blockSize, y * this.blockSize + (this.blockSize * maxY), z * this.blockSize - this.blockSize]);

              r = ((this.blocks[blockIdx] >> 24) & 0xFF) / 255;
              g = ((this.blocks[blockIdx] >> 16) & 0xFF) / 255;
              b = ((this.blocks[blockIdx] >> 8) & 0xFF) / 255;
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
              colors[cc++] = [r, g, b];
            }
          }
        }
      }
    }
    this.triangles = vertices.length / 3;

    if (this.mesh == undefined) {
      for (var x = 0; x < this.chunk_sx; x++) {
        for (var y = 0; y < this.chunk_sy; y++) {
          for (var z = 0; z < this.chunk_sz; z++) {
            let blockIdx = x * y * z;
            if (this.blocks[blockIdx] != 0) {
              this.blocks[blockIdx] &= 0xFFFFFFE0;
            }
          }
        }
      }
    }


    if (this.mesh != undefined && this.prev_len >= vertices.length) {
      for (var i = 0; i < vertices.length; i++) {
        this.v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
        this.c.setXYZW(i, colors[i][0], colors[i][1], colors[i][2], 1);
      }

      this.geometry.setDrawRange(0, vertices.length);
      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;
      this.geometry.computeVertexNormals();
    } else {
      this.v = new BufferAttribute(new Float32Array(vertices.length * 3), 3);
      this.c = new BufferAttribute(new Float32Array(colors.length * 3), 3);
      for (var i = 0; i < vertices.length; i++) {
        this.v.setXYZ(i, vertices[i][0], vertices[i][1], vertices[i][2]);
        this.c.setXYZW(i, colors[i][0], colors[i][1], colors[i][2], 1);
      }
      this.geometry = new BufferGeometry();
      //this.geometry.dynamic = true;
      this.geometry.setAttribute('position', this.v);
      this.geometry.setAttribute('color', this.c);
      //this.geometry.attributes.position.dynamic = true;
      //this.geometry.attributes.color.dynamic = true;
      this.geometry.computeBoundingBox();
      this.geometry.computeVertexNormals();
      this.prev_len = vertices.length;

      if (this.mesh == undefined) {
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.position.set(
          this.from_x,
          this.from_y,
          this.from_z
        );

        game.scene.add(this.mesh);
      } else {
        this.mesh.geometry = this.geometry;
      }
    }
    this.dirty = false;
  };

  rmBlock(x, y, z, dir?, dmg?, local?) {
    //this.batch_points[this.bp++] = { x: x, y: y, z: z};
    var wx = x;
    var wy = y;
    var wz = z;

    if (!local) {
      x = x - (this.from_x * this.blockSize + this.blockSize) | 0;
      y = y - (this.from_y * this.blockSize + this.blockSize) | 0;
      z = z - (this.from_z * this.blockSize + this.blockSize) | 0;
    }
    var max = 0.5;
    if (this.total_blocks > 3000) {
      max = 0.98;
    } else if (this.total_blocks > 1000) {
      max = 0.85;
    } else if (this.total_blocks > 500) {
      max = 0.7;
    } else if (this.total_blocks < 200) {
      max = 0.2;
    }
    var mp_x = 0;
    var mp_y = 0;
    var mp_z = 0;

    let blockIdx = x * y * z;
    if (x >= 0 && y >= 0 && z >= 0) {
      var c = this.blocks[blockIdx];
      if (c != 0) {
        if (cm !== undefined) {
          if (get_rand() > 0.4) {
            game.particles_box.world_debris(wx, wy, wz, this.blockSize, (c >> 24) & 0xFF, (c >> 16) & 0xFF, (c >> 8) & 0xFF);
          }
        } else {
          if (get_rand() > max) {
            // if(this.mesh.rotation.y == 0) {
            mp_x = this.mesh.position.x - (this.blockSize * this.chunk_sx / 2);
            mp_y = this.mesh.position.y - (this.blockSize * this.chunk_sy / 2);
            mp_z = this.mesh.position.z - (this.blockSize * this.chunk_sz / 2);
            // } else { // -Math.PI
            //     mp_x = this.mesh.position.x - (this.blockSize*this.chunk_sx)/(Math.PI*2);
            //     mp_y = this.mesh.position.y - (this.blockSize*this.chunk_sy)/(Math.PI*2);
            //     mp_z = this.mesh.position.z - (this.blockSize*this.chunk_sz)/(Math.PI*2);
            // }
            var size = this.blockSize;
            if (get_rand() > 0.5) {
              size = 1;
            }
            game.particles_box.debris(
              mp_x + x * this.blockSize,
              mp_y + y * this.blockSize,
              mp_z + z * this.blockSize,
              size, (c >> 24) & 0xFF, (c >> 16) & 0xFF, (c >> 8) & 0xFF, false,
              //this.blockSize, (c >> 24) & 0xFF, (c >> 16) & 0xFF, (c >> 8) & 0xFF, false,
              dir.x, dir.y, dir.z,
              null
            );
          }
          if (this.owner.radioactive_leak) {
            if (get_rand() > 0.8) {
              var mp_x = this.mesh.position.x - (this.blockSize * this.chunk_sx / 2);
              var mp_y = this.mesh.position.y - (this.blockSize * this.chunk_sy / 2);
              var mp_z = this.mesh.position.z - (this.blockSize * this.chunk_sz / 2);
              game.particles.radioactive_leak(
                mp_x + x * this.blockSize,
                mp_y + y * this.blockSize,
                mp_z + z * this.blockSize,
                0.5
              );
            }
          }
          if (this.owner.radioactive) {
            if (get_rand() > max) {
              var mp_x = this.mesh.position.x - (this.blockSize * this.chunk_sx / 2);
              var mp_y = this.mesh.position.y - (this.blockSize * this.chunk_sy / 2);
              var mp_z = this.mesh.position.z - (this.blockSize * this.chunk_sz / 2);
              game.particles.radioactive_splat(
                mp_x + x * this.blockSize,
                mp_y + y * this.blockSize,
                mp_z + z * this.blockSize,
                0.2,
                dir.x,
                dir.y,
                dir.z
              );
            }
          }
          if (this.owner.base_type == "enemy" || this.owner.base_type == "player") {
            var size = this.blockSize;
            if (get_rand() > 0.5) {
              size = 1;
            }
            if (get_rand() > max) {
              var mp_x = this.mesh.position.x - (this.blockSize * this.chunk_sx / 2);
              var mp_y = this.mesh.position.y - (this.blockSize * this.chunk_sy / 2);
              var mp_z = this.mesh.position.z - (this.blockSize * this.chunk_sz / 2);
              //for (var t = 0; t < 2; t++) {
              game.particles.blood(
                mp_x + x * this.blockSize,
                mp_y + y * this.blockSize,
                mp_z + z * this.blockSize,
                size,
                dir.x,
                dir.y,
                dir.z
              );
              //}
            }
          }
        }
        this.dirty = true;
        this.blocks[blockIdx] = 0;
      }
    }
  }

  addBlock(x, y, z, r, g, b) {
    x -= this.from_x * this.blockSize;
    y -= this.from_y * this.blockSize;
    z -= this.from_z * this.blockSize;
    x |= 0;
    y |= 0;
    z |= 0;
    if (x < 0 || y < 0 || z < 0 ||
      x >= this.chunk_sx || y >= this.chunk_sy || z >= this.chunk_sz) {
      return;
    }
    this.blocks[blockIdx] =
      (r & 0xFF) << 24 |
      (g & 0xFF) << 16 |
      (b & 0xFF) << 8 |
      0 & 0xFF;
    this.dirty = true;
  }

  blockExists(x, y, z) {
    x -= this.from_x * this.blockSize;
    y -= this.from_y * this.blockSize;
    z -= this.from_z * this.blockSize;
    x |= 0;
    y |= 0;
    z |= 0;
    if (x < 0 || y < 0 || z < 0 ||
      x >= this.chunk_sx || y >= this.chunk_sy || z >= this.chunk_sz) {
      return false;
    }
    if (this.blocks[blockIdx] != 0) {
      return true;
    }
    return false;
  };
}
