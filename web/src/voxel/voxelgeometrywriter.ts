import { BufferAttribute, BufferGeometry } from "three";

export class VoxelGeometryWriter {
  public dirty = true;
  private v: number[] = [];
  private c: number[] = [];
  private start_x: number = 0;
  private start_y: number = 0;
  private start_z: number = 0;
  private scale: number = 1;

  public get count() { return this.v.length }

  public appendVertice(x: number, y: number, z: number) {
    let block_size = this.scale;
    this.v.push(x * block_size + this.start_x);
    this.v.push(y * block_size + this.start_y);
    this.v.push(z * block_size + this.start_z);
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

  public setScale(scale: number) {
    this.scale = scale;
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
