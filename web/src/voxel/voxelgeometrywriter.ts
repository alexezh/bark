import { BufferAttribute, BufferGeometry } from "three";

export class VoxelGeometryWriter {
  public dirty = true;
  private v: Float32Array;
  private c: Float32Array;
  private start_x: number = 0;
  private start_y: number = 0;
  private start_z: number = 0;
  private scale: number = 1;
  private nextIdxV = 0;
  private nextIdxC = 0;
  private cMult = 0;

  public get count() { return this.v.length }

  public constructor(vCount: number, cCount: number, cMult: number) {
    this.cMult = cMult;
    this.v = new Float32Array(vCount);
    this.c = new Float32Array(cCount * this.cMult);
  }

  public appendVertice(x: number, y: number, z: number) {
    let block_size = this.scale;
    this.v[this.nextIdxV++] = x * block_size + this.start_x;
    this.v[this.nextIdxV++] = y * block_size + this.start_y;
    this.v[this.nextIdxV++] = z * block_size + this.start_z;
  }

  public appendVertices(v: number[]) {
    let block_size = this.scale;
    let count = v.length;
    for (let i = 0; i < count; i += 3) {
      this.v[this.nextIdxV++] = v[i] * block_size + this.start_x;
      this.v[this.nextIdxV++] = v[i + 1] * block_size + this.start_y;
      this.v[this.nextIdxV++] = v[i + 2] * block_size + this.start_z;
    }
  }

  public appendColor(n: number, r: number, g: number, b: number) {
    for (let i = 0; i < n; i++) {
      this.c[this.nextIdxC++] = r;
      this.c[this.nextIdxC++] = g;
      this.c[this.nextIdxC++] = b;
    }
  }

  public appendColors(c: number[]) {
    let count = c.length;
    let n = this.cMult;
    for (let i = 0; i < count; i += 3) {
      let r = c[i];
      let g = c[i + 1];
      let b = c[i + 2];
      for (let j = 0; j < n; j++) {
        this.c[this.nextIdxC++] = r;
        this.c[this.nextIdxC++] = g;
        this.c[this.nextIdxC++] = b;
      }
    }
  }

  public setPosition(x: number, y: number, z: number) {
    this.start_x = x;
    this.start_y = y;
    this.start_z = z;
  }

  public setScale(scale: number) {
    this.scale = scale;
  }

  public getGeometry(): BufferGeometry {
    //let vertices = this.v;
    //let colors = this.c;

    let v = new BufferAttribute(this.v, 3);
    let c = new BufferAttribute(this.c, 3);

    //let v = new BufferAttribute(new Float32Array(vertices.length), 3);
    //let c = new BufferAttribute(new Float32Array(colors.length), 3);
    /*
        let m = ((vertices.length / 3) | 0);
        for (var i = 0; i < m; i++) {
          let idx = i * 3;
          v.setXYZ(i, vertices[idx], vertices[idx + 1], vertices[idx + 2]);
          c.setXYZ(i, colors[idx], colors[idx + 1], colors[idx + 2]);
        }
    */

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
