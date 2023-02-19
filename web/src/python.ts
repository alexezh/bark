import { Mesh, MeshPhongMaterial, Vector3 } from "three";
import { GameColors } from "../ui/gamecolors";
import { Character } from "../engine/character";
import { GameMap } from "../engine/gamemap";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { modelCache } from "../voxel/voxelmodelcache";

class Sprite3 {
  private meshFrames: Mesh[] = [];
  private currentFrame: number = 0;
  private scale: number = 0.6;
  public readonly material: MeshPhongMaterial;
  public position: Vector3 = new Vector3();

  public static async create(uri: string): Promise<Sprite3> {
    let o = new Sprite3();
    await o.load(uri);
    return o;
  }

  public constructor() {
    this.material = GameColors.material;
  }

  private async load(uri: string): Promise<void> {
    let vmm = await modelCache.getVoxelModel(uri)
    for (let f of vmm.frames) {
      let writer = new VoxelGeometryWriter();

      writer.setScale(this.scale);

      f.build(writer);

      let geo = writer.getGeometry();
      let mm = new Mesh(geo, this.material);
      this.meshFrames.push(mm);
    }
  }
}

export class VM {
  private _running: boolean = false;

  public start() {
    this._running = true;
  }

  public async forever(func: () => Promise<void>): Promise<void> {
    while (this._running) {
      await func();
    }
  }

  public sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));    
  }

  public onStart(func: () => Promise<void>) {

  }
  public onMessage(func: () => Promise<void>) {
    
  }
  public onKey(func: () => Promise<void>) {
    
  }
}

export let vm: VM = new VM();

export class BoxedGame {
  private map!: GameMap;
  private char!: Character;
  private boxed!: Object[];

  public async init(): Promise<boolean> {
    this.map = new GameMap();
    this.map.load();
    this.char = new Character('./assets/vox/monky.vox', GameColors.material);
    await this.char.load();

    vm.onStart(this.dropObject.bind(this))
    vm.start();

    return true;
  }


  private async dropObject(): Promise<void> {
    vm.forever(async () => {
      let bomb = await Sprite3.create('./assets/vox/bomb.vox');
      bomb.position.set(0, 0, 1000);
      await vm.sleep(100);
    });
  }
}