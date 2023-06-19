import { AmbientLight, BufferGeometry, DirectionalLight, Mesh, MeshBasicMaterial, MeshPhongMaterial, PlaneGeometry, Scene, Vector3 } from "three";
import { modelCache } from "../voxel/voxelmodelcache";
import { MeshLevelLayer } from "./meshlevellayer";
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

export const infiniteUp = 1000000;
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

    private _floorLevel = -30;
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
    get floorLevel(): number {
        return this._floorLevel;
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

    public loadScene(scene: Scene, editMode: boolean) {
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

        // if we are editing, put floor at zero so we have correct positioning
        // when we try to find a block
        if (editMode) {
            floor.position.set(0, 0, 0);
        } else {
            floor.position.set(0, this._floorLevel, 0);
        }
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

    public worldPosToBlockPos(pos: WorldCoord3): BlockPos3 {
        return {
            x: (pos.x / this._blockSize) | 0,
            y: (pos.y / this._blockSize) | 0,
            z: (pos.z / this._blockSize) | 0
        }
    }

    public getBlockByPoint(point: Vector3): MapBlockCoord | undefined {
        let layerIdx = (point.y / this._blockSize) | 0;
        if (layerIdx < 0 || layerIdx >= this.layers.length) {
            console.log(`unknown y layer ${point.y}`);
            return undefined;
        }
        return this.layers[layerIdx].getBlockByPoint(point);
    }

    public getBlockByPos(x: number, y: number, z: number): MapBlockCoord | undefined {
        let layer = this.layers[y];
        return layer.getBlockByPos(x, z);
    }

    /**
     * delete block and mark layer as dirty
     */
    private deleteBlockByPos(x: number, y: number, z: number): MeshLevelLayer {
        let layer = this.layers[y];
        layer.deleteBlockByPos(x, z);
        return layer;
    }

    public deleteBlock(block: MapBlockCoord | MapBlockRigitBody) {
        let mb = (block instanceof MapBlockRigitBody) ? block.mapBlock : block;

        console.log('delete ' + mb.mapPos.x + ' ' + mb.mapPos.z);
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

    public getDistanceY(ro: IRigitBody, pos: WorldCoord3): { intersectBody?: IRigitBody, height: number, distance: number } {

        let bottomPoints = ro.rigit?.bottomPoints;
        if (!bottomPoints) {
            return { height: infiniteUp, distance: infiniteUp };
        }

        if (pos.y < this._floorLevel) {
            return { intersectBody: new MapBoundaryRigitBody(new Vector3(pos.x, 0, pos.z), new Vector3(0, 0, 0)), height: infiniteDown, distance: infiniteDown };
        }

        let layerIdx = (pos.y / this._blockSize) | 0;
        if (layerIdx >= this.layers.length) {
            return { height: infiniteUp, distance: infiniteUp };
        }

        let layer: MeshLevelLayer = this.layers[layerIdx];
        if (layer === undefined) {
            return { height: infiniteUp, distance: infiniteUp };
        }

        let minHeight: number = infiniteUp;
        let minDistance: number = infiniteUp;
        let intersectBody: MapBlockRigitBody | undefined;

        // for each block
        for (let bp of bottomPoints) {
            let bpx = pos.x + bp.x;
            let bpz = pos.z + bp.z;

            let blockX = (bpx / this._blockSize) | 0;
            let blockZ = (bpz / this._blockSize) | 0;
            let block = layer.getBlockByPos(blockX, blockZ);

            if (block !== undefined) {
                let xBlock = (bpx - blockX * this._blockSize) | 0;
                let zBlock = (bpz - blockZ * this._blockSize) | 0;
                let height = layer.layerY + block.model.frames[block.frame].getHeight(xBlock, zBlock);

                if (height > 0) {
                    let distance = (pos.y - height);
                    if (distance < minDistance) {
                        minDistance = distance;
                        minHeight = height;
                        intersectBody = new MapBlockRigitBody(block, { x: blockX * this._blockSize, y: layer.layerY, z: blockZ * this._blockSize });
                    }
                }
            }
        }

        return { intersectBody: intersectBody, height: minHeight, distance: minDistance };
    }


    /**
    * positive distance is we are above the surface
     */
    // public getDistanceY(ro: IRigitBody, pos: Vector3): number {
    //     if (pos.y < 0) {
    //         return infiniteDown;
    //     }

    //     let layerIdx = (pos.y / this._blockSize) | 0;
    //     layerIdx = Math.min(layerIdx, this.layers.length - 1);

    //     for (let i = layerIdx; i >= 0; i--) {
    //         let layer = this.layers[i];
    //         let height = layer.getHeight(pos);
    //         if (height !== 0) {
    //             //console.log(`height: ${height} ${pos.y}`)
    //             return pos.y - (layer.layerY * this._blockSize + height);
    //         }
    //     }

    //     return infiniteDown;
    // }

    private onFileChangeBlock(blocks: FileMapBlock[]) {
        for (let i = 0; i < blocks.length; i++) {
            let fb = blocks[i];

            if (fb.blockId !== 0) {
                let block = modelCache.getVoxelModelById(fb.blockId);
                if (block !== undefined) {
                    this.addBlockCore(fb, block);
                }
            } else {
                this.deleteBlockByPos(fb.x, fb.y, fb.z);
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

