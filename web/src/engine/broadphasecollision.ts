import { IRigitBody } from "../voxel/voxelmeshmodel";

export class BroadphaseCollision {
  private xEdges: number[] = [];
  private yEdges: number[] = [];
  private zEdges: number[] = [];

  public getPairs(rigitObjects: IRigitBody[]) {
    this.xEdges.length = 0;
    this.yEdges.length = 0;
    this.zEdges.length = 0;

    for (let ro of rigitObjects) {
      let pos = ro.position;
      let sz = ro.size;
      this.xEdges.push(pos.x);
      this.xEdges.push(pos.x + ro.size.x);

      this.yEdges.push(pos.y);
      this.yEdges.push(pos.y + ro.size.y);
    }

    this.xEdges.sort();
    this.yEdges.sort();

    let pairs: { first: IRigitBody, second: IRigitBody }[] = [];
  }
}