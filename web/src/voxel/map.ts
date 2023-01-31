import { game } from "./main";
import { WALL2, WOOD_WALL } from "./textures";
import { Chunk } from "./chunk";
import { loadImageFile } from './utils';
import { AmbientLight, BufferAttribute, BufferGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { Player } from "./char";
import { Vox } from "./vox";
import { fetchResource } from "../fetchadapter";
import { VoxelGeometryWriter, VoxelModel } from "./voxelmodel";

export class VoxelModelCache {
    private readonly models: Map<string, VoxelModel> = new Map<string, VoxelModel>();

    public async getVoxelModel(url: string): Promise<VoxelModel> {
        let model = this.models.get(url);
        if (model !== undefined) {
            return model;
        }

        let chunkBlob = await fetchResource(url);
        let vox = new Vox();
        let voxelData = vox.loadModel(chunkBlob, url);
        if (voxelData === undefined) {
            throw Error('cannpt load model');
        }
        model = new VoxelModel(url, voxelData);
        //model.build();

        this.models.set(url, model);
        return model;
    };
}

export let modelCache: VoxelModelCache = new VoxelModelCache();

export class MeshModel {
    public mesh!: Mesh;
    public geometry!: BufferGeometry;
    public material!: MeshPhongMaterial;

    public constructor(geo: BufferGeometry) {
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
        let writer = new VoxelGeometryWriter();
        for (let i = 0; i < 100; i++) {
            let vm = await modelCache.getVoxelModel('./assets/vox/ground.vox');

            writer.setPosition(((i / 10) | 0) * 16, 3 * 16, (i % 10) * 16);
            vm.build(writer);
        }

        let geo = writer.getGeometry();
        let mm = new MeshModel(geo);

        game.scene.add(mm.mesh);

        this.ambient_light = new AmbientLight(0xFFFFFF, 0.8);
        game.scene.add(this.ambient_light);

        return true;
    }
};

