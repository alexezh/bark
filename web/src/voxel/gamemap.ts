import { AmbientLight, BufferGeometry, Mesh, MeshPhongMaterial, Scene, Vector3 } from "three";
import { modelCache } from "./voxelmodelcache";
import { Character } from "./character";
import { MapBlock, MapBlockCoord, MapLayer } from "./maplayer";
import { VoxelModel } from "./voxelmodel";
import { GridPos3, GridSize3, WorldCoord3, WorldSize3 } from "./pos3";
import { IGameMap } from "./igamemap";


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
export class GameMap implements IGameMap {
    private scene!: Scene;
    public objects: any = [];
    public width = 100;
    public height = 100;
    private blockSize = 16;
    // Objects loaded 
    private layers: MapLayer[] = [];
    private char!: Character;

    public ambient_light!: AmbientLight;
    public material: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xffffff, vertexColors: true });

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
        //this.char = new Character('./assets/vox/monky.vox', this.material);
        //await this.char.load();

        this.layers.push(new MapLayer(this.material, 0, this.blockSize));

        let ground = await modelCache.getVoxelModel('./assets/vox/ground.vox');
        this.layers[0].fill(ground);

        this.layers[0].build();
        return true;
    }

    public loadScene(scene: Scene) {
        this.scene = scene;
        this.scene.add(this.layers[0].staticMesh);

        this.ambient_light = new AmbientLight(0xFFFFFF, 0.8);
        this.scene.add(this.ambient_light);

        return true;
    }

    public gridSizeToWorldSize(gridSize: GridSize3): WorldSize3 {
        return {
            sx: gridSize.sx * this.blockSize,
            sy: gridSize.sy * this.blockSize,
            sz: gridSize.sz * this.blockSize
        }
    }

    public gridPosToWorldPos(gridPos: GridPos3): WorldCoord3 {
        return {
            x: gridPos.x * this.blockSize,
            y: gridPos.y * this.blockSize,
            z: gridPos.z * this.blockSize
        }
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
        let layer = this.layers[block.gridPos.z];
        this.scene.remove(layer.staticMesh);
        layer.deleteBlock(block);
        layer.build();
        this.scene.add(layer.staticMesh);
    }

    public addBlock(pos: GridPos3, block: VoxelModel) {
        if (pos.z >= this.layers.length) {
            for (let i = this.layers.length - 1; i < pos.z; i++) {
                let layer = new MapLayer(this.material, this.layers.length, this.blockSize);
                layer.build();
                this.layers.push(layer);
            }
        }

        let layer = this.layers[pos.z];
        layer.addBlock(pos, block);

        this.scene.remove(layer.staticMesh);
        layer.build();
        this.scene.add(layer.staticMesh);
    }
};

