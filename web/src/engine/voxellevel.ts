import { AmbientLight, BufferGeometry, Mesh, MeshPhongMaterial, Scene, Vector3 } from "three";
import { modelCache } from "../voxel/voxelmodelcache";
import { MeshLevelLayer } from "./maplayer";
import { VoxelModel } from "../voxel/voxelmodel";
import { BlockPos3, BlockSize3, WorldCoord3, WorldSize3 } from "../voxel/pos3";
import { defaultMaterial, FileMapBlock, IVoxelLevel, IVoxelLevelFile, MapBlock, MapBlockCoord } from "../ui/ivoxelmap";
import { IRigitBody } from "../voxel/voxelmeshmodel";
import { MapBlockRigitBody, MapBoundaryRigitBody } from "../voxel/mapblockrigitbody";


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
    private _file: IVoxelLevelFile;
    private layers: MeshLevelLayer[] = [];

    public ambient_light!: AmbientLight;

    get worldSize(): WorldSize3 {
        return this.blockSizeToWorldSize(this.blockSize);
    }
    get blockSize(): BlockSize3 {
        return { sx: this.width, sy: this.layers.length, sz: this.height }
    }
    get file(): IVoxelLevelFile {
        return this._file;
    }

    public constructor(file: IVoxelLevelFile) {
        this._file = file;
        this._file.registerOnChangeBlock(this.onFileChangeBlock.bind(this));
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

    public async load(): Promise<boolean> {
        this.width = this.file.mapSize.sx;
        this.height = this.file.mapSize.sz;

        this.layers.push(new MeshLevelLayer(defaultMaterial, { w: this.width, h: this.height }, 0, this._blockSize));

        console.log(`VoxelLevel: ${this.file.blocks.size}`);
        for (let fbitem of this.file.blocks) {
            let fb = fbitem[1];
            let block = await modelCache.getVoxelModelById(fb.blockId);
            if (block !== undefined) {
                this.addBlockCore(fb, block);
            }
        }

        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].build();
        }

        return true;
    }

    public loadScene(scene: Scene) {
        this.scene = scene;
        this.scene.add(this.layers[0].staticMesh);

        this.ambient_light = new AmbientLight(0xFFFFFF, 0.8);
        this.scene.add(this.ambient_light);

        return true;
    }

    public blockSizeToWorldSize(mapSize: BlockSize3): WorldSize3 {
        return {
            sx: mapSize.sx * this._blockSize,
            sy: mapSize.sy * this._blockSize,
            sz: mapSize.sz * this._blockSize
        }
    }

    public blockPosToWorldPos(mapPos: BlockPos3): WorldCoord3 {
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

    private deleteBlockCore(block: MapBlockCoord): MeshLevelLayer {
        let layer = this.layers[block.mapPos.y];
        this.scene.remove(layer.staticMesh);
        layer.deleteBlock(block);
        return layer;
    }

    private deleteBlockByCoord(x: number, y: number, z: number): MeshLevelLayer {
        let layer = this.layers[y];
        this.scene.remove(layer.staticMesh);
        layer.deleteBlockByCoord(x, z);
        return layer;
    }

    public deleteBlock(block: MapBlockCoord) {
        let layer = this.deleteBlockCore(block);
        layer.build();
        this.scene.add(layer.staticMesh);
    }

    private addBlockCore(pos: BlockPos3, block: VoxelModel): MeshLevelLayer {
        if (pos.y >= this.layers.length) {
            for (let i = this.layers.length - 1; i < pos.y; i++) {
                let layer = new MeshLevelLayer(defaultMaterial, { w: this.width, h: this.height }, this.layers.length, this._blockSize);
                layer.build();
                this.layers.push(layer);
            }
        }

        let layer: MeshLevelLayer = this.layers[pos.y];
        layer.addBlock(pos, block);
        return layer;
    }

    public addBlock(pos: BlockPos3, block: VoxelModel) {
        let layer = this.addBlockCore(pos, block);

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
            let layer: MeshLevelLayer = this.layers[y];
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

    private onFileChangeBlock(blocks: FileMapBlock[]) {
        for (let i = 0; i < blocks.length; i++) {
            let fb = blocks[i];

            if (fb.blockId !== 0) {
                let block = modelCache.getVoxelModelById(fb.blockId);
                if (block !== undefined) {
                    this.addBlockCore(fb, block);
                }
            } else {
                this.deleteBlockByCoord(fb.x, fb.y, fb.z);
            }
        }

        for (let i = 0; i < this.layers.length; i++) {
            let layer = this.layers[i];
            if (layer.dirty) {
                this.scene.remove(layer.staticMesh);
                layer.build();
                this.scene.add(layer.staticMesh);
            }
        }
    }
};

