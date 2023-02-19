import { Mesh, MeshPhongMaterial } from "three";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { VoxelModel } from "../voxel/voxelmodel";
import { modelCache } from "../voxel/voxelmodelcache";

export type CharacterAnimation = {

}

export class Character {
  private meshFrames: Mesh[] = [];
  private url: string;
  private currentFrame: number = 0;
  private scale: number = 0.6;
  public material: MeshPhongMaterial;

  public constructor(url: string, material: MeshPhongMaterial) {
    this.url = url;
    this.material = material;
  }

  public async load(): Promise<boolean> {
    let vmm = await modelCache.getVoxelModel(this.url);

    for (let f of vmm.frames) {
      let writer = new VoxelGeometryWriter();

      writer.setScale(this.scale);

      f.build(writer);

      let geo = writer.getGeometry();
      let mm = new Mesh(geo, this.material);
      this.meshFrames.push(mm);
    }

    return true;
  }

  public getMesh(): Mesh {
    return this.meshFrames[this.currentFrame];
  }
}
