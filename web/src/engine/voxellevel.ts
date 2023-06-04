import { AmbientLight, BufferGeometry, DirectionalLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, PlaneGeometry, Scene, Vector3 } from "three";
import { modelCache } from "../voxel/voxelmodelcache";
import { MeshLevelLayer } from "./maplayer";
import { VoxelModel } from "../voxel/voxelmodel";
import { BlockPos3, BlockSize3, WorldCoord3, WorldSize3 } from "../voxel/pos3";
import { defaultMaterial, FileMapBlock, IVoxelLevel, IVoxelLevelFile, MapBlock, MapBlockCoord } from "../ui/ivoxellevel";
import { MapBlockRigitBody, MapBoundaryRigitBody } from "../voxel/mapblockrigitbody";
import { IRigitBody } from "../voxel/irigitbody";


export class MeshModel {
    public mesh!: Mesh;
    public geometry!: BufferGeometry;
    public material: MeshPhongMaterial = new MeshPhongMaterial({ color: 0xffffff, vertexColors: true });

    public constructor(geo: BufferGeometry) {
        this.geometry = geo;
        this.mesh = new Mesh(geo, this.material);
    }
}

export const infiniteDown = -1000000;

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

    private floorLevel = -30;
    private ambientLight!: AmbientLight;
    private directionalLight!: DirectionalLight;

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
        for (let layer of this.layers) {
            layer.addToScene(this.scene);
        }

        this.ambientLight = new AmbientLight(0xFFFFFF, 0.8);
        this.scene.add(this.ambientLight);

        // add light from the top
        // later we can make it movable
        this.directionalLight = new DirectionalLight(0xffffff);

        let wsz = this.worldSize;
        this.directionalLight.position.set(wsz.sx / 2, wsz.sy * 5, wsz.sz / 2).normalize();
        this.scene.add(this.directionalLight);


        console.log(`onLevelLoaded: world size ${wsz.sx} ${wsz.sy} ${wsz.sz}`);

        // add geometry covering map on the bottom so we can handle all clicks within map
        // y is vertical, rotate around x to make it horizontal
        const floorGeometry = new PlaneGeometry(wsz.sx, wsz.sz);
        floorGeometry.rotateX(- Math.PI / 2);
        let floor = new Mesh(floorGeometry, new MeshBasicMaterial({ visible: false }));
        floor.position.set(0, this.floorLevel, 0);
        this.scene!.add(floor);

        /*
        const ceilingGeometry = new PlaneGeometry(wsz.sx, wsz.sz);
        ceilingGeometry.rotateX(- Math.PI / 2);
        let ceiling = new Mesh(ceilingGeometry, new MeshBasicMaterial({ visible: false }));
        this.scene!.add(floor);
        */

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
            console.log(`unknown y layer ${point.y}`);
            return undefined;
        }
        return this.layers[layerIdx].getBlockByCoord(point);
    }

    /**
     * delete block and mark layer as dirty
     */
    private deleteBlockByCoord(x: number, y: number, z: number): MeshLevelLayer {
        let layer = this.layers[y];
        layer.deleteBlockByCoord(x, z);
        return layer;
    }

    public deleteBlock(block: MapBlockCoord | MapBlockRigitBody) {
        let mb = (block instanceof MapBlockRigitBody) ? block.mapBlock : block;

        let layer = this.layers[mb.mapPos.y];
        layer.deleteBlock(mb);
        layer.updateScene(this.scene);
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
        layer.updateScene(this.scene);
    }

    public intersectBlocks(ro: IRigitBody,
        pos: WorldCoord3,
        func: (target: IRigitBody) => boolean): boolean {

        let sz = ro.size;

        if (pos.y < this.floorLevel) {
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
                        let height = block.model.frames[block.frame].getHeight(pos.x, pos.z);

                        // if we are below height
                        if (height > 0 && pos.y < y * this._blockSize + height) {
                            let b = new MapBlockRigitBody(block, { x: x * this._blockSize, y: y * this._blockSize, z: z * this._blockSize });
                            if (func(b)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    // positive distance is we are above the surface
    public getDistanceY(ro: IRigitBody, pos: Vector3): number {
        if (pos.y < 0) {
            return infiniteDown;
        }

        let layerIdx = (pos.y / this._blockSize) | 0;
        if (layerIdx < 0 || layerIdx >= this.layers.length) {
            return 0;
        }
        for (let i = layerIdx; i >= 0; i--) {
            let layer = this.layers[i];
            let height = layer.getHeight(pos);
            if (height !== 0) {
                //console.log(`height: ${height} ${pos.y}`)
                return height - (pos.y - (layer.layerY * this._blockSize));
            }
        }

        return infiniteDown;
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
                layer.updateScene(this.scene);
            }
        }
    }
};

