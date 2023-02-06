import { game } from "./main";
import { AmbientLight, BufferGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import { modelCache } from "./voxelmodelcache";
import { Character } from "./character";
import { MapBlock, MapBlockCoord, MapLayer } from "./maplayer";


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
    public objects: any = [];
    public width = 100;
    public height = 100;
    private blockSize = 16;
    // Objects loaded 
    private layers: MapLayer[] = [];
    private char!: Character;

    public ambient_light!: AmbientLight;
    public material: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xffffff, vertexColors: true });

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

    public async load(): Promise<boolean> {
        this.char = new Character('./assets/vox/monky.vox', this.material);
        await this.char.load();

        this.layers.push(new MapLayer(this.material, 0, this.blockSize));

        let ground = await modelCache.getVoxelModel('./assets/vox/ground.vox');
        this.layers[0].fill(ground);

        this.layers[0].build();
        game.scene.add(this.layers[0].staticMesh);

        this.ambient_light = new AmbientLight(0xFFFFFF, 0.8);
        game.scene.add(this.ambient_light);

        return true;
    }

    public findBlock(point: Vector3): MapBlockCoord | undefined {
        let layerIdx = (point.z / this.blockSize) | 0;
        if (layerIdx < 0 || layerIdx >= this.layers.length) {
            console.log('unknown z layer');
            return undefined;
        }
        return this.layers[layerIdx].findBlock(point);
    }

    public deleteBlock(block: MapBlockCoord) {
        let layerIdx = (block.z / this.blockSize) | 0;
        let layer = this.layers[layerIdx];
        game.scene.remove(layer.staticMesh);
        layer.deleteBlock(block);
        layer.build();
        game.scene.add(layer.staticMesh);
    }
};

