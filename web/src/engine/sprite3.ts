import { Mesh, MeshPhongMaterial, Vector3 } from "three";
import { GameColors } from "../ui/gamecolors";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { modelCache } from "../voxel/voxelmodelcache";

export interface IRigitBody {

}

// display object 
export class Sprite3 {
  private meshFrames: Mesh[] = [];
  private currentFrame: number = 0;
  private scale: number = 0.6;
  public readonly material: MeshPhongMaterial;
  public position: Vector3 = new Vector3();
  public owner: any;
  public rigit: IRigitBody | undefined;

  public static async create(uri: string): Promise<Sprite3> {
    let o = new Sprite3();
    await o.load(uri);
    return o;
  }

  public constructor(collidableType?: any) {
    this.material = GameColors.material;
  }

  private async load(uri: string): Promise<void> {
    let vmm = await modelCache.getVoxelModel(uri);
    for (let f of vmm.frames) {
      let writer = new VoxelGeometryWriter();

      writer.setScale(this.scale);

      f.build(writer);

      let geo = writer.getGeometry();
      let mm = new Mesh(geo, this.material);
      this.meshFrames.push(mm);
    }
  }

  public getMesh(): Mesh {
    return this.meshFrames[this.currentFrame];
  }
}
