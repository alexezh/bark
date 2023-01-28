import { game } from "./main";
import { WALL2, WOOD_WALL } from "./textures";
import { Chunk } from "./chunk";
import { loadImageFile } from './utils';
import { AmbientLight, Vector3 } from "three";
import { Player } from "./char";
import { Vox } from "./vox";
import { fetchResource } from "../fetchadapter";

export class ModelCache {
    private readonly chunks: Map<string, Chunk> = new Map<string, Chunk>();

    public async getChunk(url: string): Promise<Chunk> {
        let chunk = this.chunks.get(url);
        if (chunk !== undefined) {
            return chunk;
        }

        let chunkBlob = await fetchResource(url);
        let vox = new Vox();
        let model = vox.loadModel(chunkBlob, url);
        if (model === undefined) {
            throw Error('cannpt load model');
        }
        let p: any;
        let r = 0, g = 0, b = 0;
        chunk = new Chunk(0, 0, 0, model.sx, model.sz, model.sy, url, 1, 'world');
        for (let i = 0; i < model.data.length; i++) {
            p = model.data[i];
            r = (p.val >> 24) & 0xFF;
            g = (p.val >> 16) & 0xFF;
            b = (p.val >> 8) & 0xFF;
            if (p.y > model.sy || p.x > model.sx || p.z > model.sz) {
                continue;
            }
            chunk.addBlock(p.x, p.z, p.y, r, g, b);
        }
        this.chunks.set(url, chunk);
        return chunk;
    };
}

export let modelCache: ModelCache = new ModelCache();

//////////////////////////////////////////////////////////////////////
// Maps class - Loading of maps from images
export class MapD {
    public name = "";
    public objects: any = [];
    public width = 100;
    public height = 100;
    // Objects loaded 
    public loaded: Chunk[] = [];

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
        for (let i = 0; i < 100; i++) {
            let chunk = await modelCache.getChunk('./assets/vox/ground.vox');

            chunk = chunk.clone2(((i / 10) | 0) * 16, 3 * 16, (i % 10) * 16);
            chunk.build();
            chunk.mesh.visible = true;
            game.chunkScene.addChunk(chunk);
            //game.scene.add()
        }

        this.ambient_light = new AmbientLight(0xFFFFFF, 0.8);
        game.scene.add(this.ambient_light);

        return true;
    }
};

