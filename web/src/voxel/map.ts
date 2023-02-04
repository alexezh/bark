import { game } from "./main";
import { Chunk } from "./chunk";
import { AmbientLight, BufferAttribute, BufferGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { Vox } from "./vox";
import { fetchResource } from "../fetchadapter";
import { VoxelModel, VoxelModelFrame } from "./voxelmodel";
import { VoxelGeometryWriter } from "./voxelgeometrywriter";
import { modelCache } from "./voxelmodelcache";


export class MeshModel {
    public mesh!: Mesh;
    public geometry!: BufferGeometry;
    public material: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xffffff, vertexColors: true });

    public constructor(geo: BufferGeometry) {
        this.geometry = geo;
        this.mesh = new Mesh(geo, this.material);
    }
}

//////////////////////////////////////////////////////////////////////
// Maps class - Loading of maps from images
export class MapD {
    public name = "";
    public objects: any = [];
    public width = 100;
    public height = 100;
    // Objects loaded 
    public loaded: Chunk[] = [];
    private staticMap: MeshModel | undefined;
    private dynamicObjects: Map<string, MeshModel> = new Map<string, MeshModel>();


    public ambient_light!: AmbientLight;

    public constructor() {
    }

    reset() {
        /*
        for (var i = 0; i < this.loaded.length; i++) {
            if (this.loaded[i].chunk) {
                game.scene.remove(this.loaded[i].chunk.mesh);
            }
        }
        this.loaded = [];
        this.walls = [];
        game.scene.remove(this.ambient_light);
        */
    };

    update(time, delta) {
        /*       
               var t1 = 0;
               for (var i = 0; i < this.loaded.length; i++) {
                   if (this.loaded[i].chunk && this.loaded[i].chunk.dirty) {
                       this.loaded[i].chunk.build();
                       t1 = Date.now();
                       if ((Date.now() - t1) > 3) {
                           break;
                       }
                   }
                   t1 = Date.now();
                   if (this.loaded[i].alive) {
                       if (this.loaded[i].chunk) {
                           if (this.loaded[i].chunk.mesh.position.distanceTo(game.player.chunk.mesh.position) < game.visible_distance) {
                               this.loaded[i].update(time, delta);
                           }
                       } else if (this.loaded[i].x) {
                           if (new Vector3(this.loaded[i].x, this.loaded[i].y, this.loaded[i].z).distanceTo(game.player.chunk.mesh.position) < game.visible_distance) {
                               this.loaded[i].update(time, delta);
                           }
                       } else {
                           this.loaded[i].update(time, delta);
                       }
                   }
                   if ((Date.now() - t1) > 3) {
                       break;
                   }
               }
               */
    };

    public async init(): Promise<boolean> {
        let vmm = await modelCache.getVoxelModel('./assets/vox/monky.vox');
        let idx = 0;

        for (let f of vmm.frames) {
            let writer = new VoxelGeometryWriter();

            writer.setScale(0.6);

            f.build(writer);

            let geo = writer.getGeometry();
            let mm = new MeshModel(geo);
            mm.mesh.position.set(2 * 16 - 30, idx * 16 - 100, 60);
            idx++;

            game.scene.add(mm.mesh);
        }

        let writer = new VoxelGeometryWriter();
        let vm = await modelCache.getVoxelModel('./assets/vox/ground.vox');

        for (let i = 0; i < 10; i++) {
            //            writer.setPosition(((i / 10) | 0) * 16, 3 * 16 - 50, (i % 10) * 16 - 100);
            writer.setPosition(2 * 16 - 50, i * 16 - 100, 50);
            vm.frames[0].build(writer);
            writer.setPosition(3 * 16 - 50, i * 16 - 100, 50);
            vm.frames[0].build(writer);
        }

        let geo = writer.getGeometry();
        let mm = new MeshModel(geo);

        game.scene.add(mm.mesh);

        this.ambient_light = new AmbientLight(0xFFFFFF, 0.8);
        game.scene.add(this.ambient_light);

        return true;
    }
};

