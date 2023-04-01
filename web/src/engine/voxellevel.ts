import { AmbientLight, BufferGeometry, Mesh, MeshPhongMaterial, Scene, Vector3 } from "three";
import { modelCache } from "../voxel/voxelmodelcache";
import { MapLayer } from "./maplayer";
import { VoxelModel } from "../voxel/voxelmodel";
import { BlockPos3, BlockSize3, WorldCoord3, WorldSize3 } from "../voxel/pos3";
import { defaultMaterial, IVoxelLevel, MapBlock, MapBlockCoord } from "../ui/ivoxelmap";
import { IRigitBody } from "../voxel/voxelmeshmodel";
import { MapBlockRigitBody, MapBoundaryRigitBody } from "../voxel/mapblockrigitbody";
import { wireGetArrayRange, wireGetObject, wireSetObjectBackground, wireSetString } from "../lib/fetchadapter";


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
export class VoxelLevel implements IVoxelLevel {
    private scene!: Scene;
    public objects: any = [];
    public width = 100;
    public height = 100;
    private _blockSize = 16;
    // Objects loaded 
    private layers: MapLayer[] = [];

    public ambient_light!: AmbientLight;

    get worldSize(): WorldSize3 {

    }
    get blockSize(): BlockSize3 {
        return { sx: this.width, sy: this.layers.length, sz: this.height }
    }

    public onStart() {
    };
    public onStop() {
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

    public async load(id: string): Promise<boolean> {
        this.layers.push(new MapLayer(defaultMaterial, 0, this._blockSize));

        //let mapData = await wireGetArrayRange('level', 0, -1);
        //if (mapData === undefined) {
        let ground = await modelCache.getVoxelModel('./assets/vox/ground.vox');
        this.layers[0].fill(ground);
        //} else {

        //}

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

    public mapSizeToWorldSize(mapSize: BlockSize3): WorldSize3 {
        return {
            sx: mapSize.sx * this._blockSize,
            sy: mapSize.sy * this._blockSize,
            sz: mapSize.sz * this._blockSize
        }
    }

    public mapPosToWorldPos(mapPos: BlockPos3): WorldCoord3 {
        return {
            x: mapPos.x * this._blockSize,
            y: mapPos.y * this._blockSize,
            z: mapPos.z * this._blockSize
        }
    }

    public findBlock(point: Vector3): MapBlockCoord | undefined {
        let layerIdx = (point.y / this._blockSize) | 0;
        if (layerIdx < 0 || layerIdx >= this.layers.length) {
            console.log('unknown z layer');
            return undefined;
        }
        return this.layers[layerIdx].findBlock(point);
    }

    public deleteBlock(block: MapBlockCoord) {
        let layer = this.layers[block.mapPos.y];
        this.scene.remove(layer.staticMesh);
        layer.deleteBlock(block);
        layer.build();
        this.scene.add(layer.staticMesh);
    }

    public addBlock(pos: BlockPos3, block: VoxelModel) {
        if (pos.y >= this.layers.length) {
            for (let i = this.layers.length - 1; i < pos.y; i++) {
                let layer = new MapLayer(defaultMaterial, this.layers.length, this._blockSize);
                layer.build();
                this.layers.push(layer);
            }
        }

        let layer: MapLayer = this.layers[pos.y];
        layer.addBlock(pos, block);

        this.scene.remove(layer.staticMesh);
        layer.build();
        this.scene.add(layer.staticMesh);
    }

    public intersectBlocks(ro: IRigitBody,
        pos: WorldCoord3,
        func: (target: IRigitBody) => boolean): boolean {

        let sz = ro.size;

        if (pos.y < 0) {
            func(new MapBoundaryRigitBody(new Vector3(pos.x, 0, pos.z), new Vector3(0, 0, 0)));
            return true;
        }

        // we assume upper bound non-inclusive; ie if block is at position 0
        // and size 16, it overlaps with one layer
        let xStart = Math.floor(pos.x / this._blockSize);
        let xEnd = Math.max(xStart + 1, Math.floor((pos.x + sz.x) / this._blockSize));
        let yStart = Math.floor(pos.y / this._blockSize);
        let yEnd = Math.max(yStart + 1, Math.floor((pos.y + sz.y) / this._blockSize));
        let zStart = Math.floor(pos.z / this._blockSize);
        let zEnd = Math.max(zStart + 1, Math.floor((pos.z + sz.z) / this._blockSize));

        for (let y = yStart; y < yEnd; y++) {
            let layer: MapLayer = this.layers[y];
            if (layer === undefined) {
                continue;
            }
            for (let z = zStart; z < zEnd; z++) {
                for (let x = xStart; x < xEnd; x++) {
                    let block = layer.getBlock(x, z);
                    if (block !== undefined) {
                        let b = new MapBlockRigitBody(block, { x: x * this._blockSize, y: y * this._blockSize, z: z * this._blockSize });
                        if (func(b)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }
};

