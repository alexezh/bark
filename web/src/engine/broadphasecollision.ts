import { IRigitBody } from "../voxel/irigitbody";

export type BroadphasePair = {
  first: IRigitBody;
  second: IRigitBody;
}

export class BroadphaseCollision {
  private xEdges: number[] = [];
  private yEdges: number[] = [];
  private zEdges: number[] = [];

  public getPairs(rigitObjects: IRigitBody[]): BroadphasePair[] {
    this.xEdges.length = 0;
    this.yEdges.length = 0;
    this.zEdges.length = 0;

    for (let ro of rigitObjects) {
      let pos = ro.position;
      let sz = ro.modelSize;
      this.xEdges.push(pos.x);
      this.xEdges.push(pos.x + ro.modelSize.x);

      this.yEdges.push(pos.y);
      this.yEdges.push(pos.y + ro.modelSize.y);
    }

    this.xEdges.sort();
    this.yEdges.sort();

    let pairs: BroadphasePair[] = [];
    return pairs;
  }
}