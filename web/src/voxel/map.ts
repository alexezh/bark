import { game } from "./main";
import { AmbientLight, BufferGeometry, Mesh, MeshPhongMaterial } from "three";
import { VoxelGeometryWriter } from "./voxelgeometrywriter";
import { modelCache } from "./voxelmodelcache";
import { GridSize, PxSize } from "../posh/pos";
import { VoxelModel } from "./voxelmodel";


export class MeshModel {
    public mesh!: Mesh;
    public geometry!: BufferGeometry;
    public material: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xffffff, vertexColors: true });

    public constructor(geo: BufferGeometry) {
        this.geometry = geo;
        this.mesh = new Mesh(geo, this.material);
    }
}

export type MapBlock = {
    model: VoxelModel;
    frame: number;
}

export class MapLayer {
    private size!: GridSize;
    private blockSize!: PxSize;
    private layerZ: number;
    private blocks!: MapBlock[];
    private _mesh!: Mesh;
    private geometry!: BufferGeometry;
    private material: MeshPhongMaterial;

    public get staticMesh(): Mesh { return this._mesh; }

    public constructor(material: MeshPhongMaterial) {
        this.material = material;
        this.blockSize = { w: 16, h: 16 }
        this.size = { w: 10, h: 10 };
        this.layerZ = 32;
        this.blocks = new Array(this.size.w * this.size.h);
    }

    public load() {

    }

    public fill(tile: VoxelModel) {
        for (let idx = 0; idx < this.blocks.length; idx++) {
            this.blocks[idx] = { model: tile, frame: 0 }
        }
    }

    public build() {
        let writer = new VoxelGeometryWriter();
        for (let y = 0; y < this.size.h; y++) {
            for (let x = 0; x < this.size.w; x++) {
                let pos = y * this.size.w + x;
                let block = this.blocks[pos];
                if (block !== undefined) {
                    let model = block.model.frames[block.frame];
                    writer.setScale(this.blockSize.w / model.chunk_sx);
                    writer.setPosition(this.blockSize.w * x, this.blockSize.h * y, this.layerZ);
                    model.build(writer);
                }
            }
        }

        this.geometry = writer.getGeometry();
        this._mesh = new Mesh(this.geometry, this.material);
    }
}

export type CharacterAnimation = {

}

export class Character {
    private model!: VoxelModel;
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

//////////////////////////////////////////////////////////////////////
// Maps class - Loading of maps from images
export class MapD {
    public name = "";
    public objects: any = [];
    public width = 100;
    public height = 100;
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

        this.layers.push(new MapLayer(this.material));

        let ground = await modelCache.getVoxelModel('./assets/vox/ground.vox');
        this.layers[0].fill(ground);

        /*        
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
                let vm = await modelCache.getVoxelModel('./assets/vox/dungeon_entrance.vox');
        
                for (let i = 0; i < 10; i++) {
                    //            writer.setPosition(((i / 10) | 0) * 16, 3 * 16 - 50, (i % 10) * 16 - 100);
                    writer.setPosition(2 * 16 - 50, i * 16 - 100, 50);
                    vm.frames[0].build(writer);
                    writer.setPosition(3 * 16 - 50, i * 16 - 100, 50);
                    vm.frames[0].build(writer);
                }
        
                let geo = writer.getGeometry();
                let mm = new MeshModel(geo);
        */

        this.layers[0].build();
        game.scene.add(this.layers[0].staticMesh);

        this.ambient_light = new AmbientLight(0xFFFFFF, 0.8);
        game.scene.add(this.ambient_light);

        return true;
    }
};

