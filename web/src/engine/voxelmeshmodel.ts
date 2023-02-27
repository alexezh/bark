// represents voxel model as set of meshes
// ATT: it is responsivility of caller to adjust position information on mesh

import { Mesh, MeshPhongMaterial, Vector3 } from "three";
import { GameColors } from "../ui/gamecolors";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { modelCache } from "../voxel/voxelmodelcache";
import { Sprite3 } from "./sprite3";

// interface for physics engine to work with sprites
// from physics perspective, we deal with speed and impulses
// interactivity (keyboard) is done at higher level
// such as when we do wall jump, contact with the wall will 0 the speed
// similarly, the sprite can zero out the speed when reaching position
export interface IRigitBody {
    // owner set by application
    get owner(): any;

    // speed is pixel per second
    get speed(): Vector3;
    get position(): Vector3;

    onMove(pos: Vector3): void;
    onCollision(obj: IRigitBody): void;
}

export class RigitBodyArray {
    public static contains<T extends Sprite3>(a: IRigitBody[]) {
        return false;
    }
}

export interface IRigitModel {
    move(pos: Vector3, parts: VoxelMeshModel): void;
    update(): void;
}

// when adding / updating mesh on scene
export class VoxelMeshModel {
    private frames: Mesh[] = [];
    private currentFrame: number = 0;
    private scale: number = 0.6;
    private _size!: Vector3;
    private readonly material: MeshPhongMaterial;
    public get size(): Vector3 { return this._size; };

    public static async create(uri: string): Promise<VoxelMeshModel> {
        let o = new VoxelMeshModel();
        await o.load(uri);
        return o;
    }

    public constructor() {
        this.material = GameColors.material;
    }

    private async load(uri: string): Promise<void> {
        let vmm = await modelCache.getVoxelModel(uri);
        for (let f of vmm.frames) {
            let writer = new VoxelGeometryWriter();

            writer.setScale(this.scale);

            f.build(writer);

            let geo = writer.getGeometry();
            let mm = new Mesh(geo, this.material);
            this.frames.push(mm);
        }

        let sz = vmm.size;
        this._size = new Vector3(sz.x * this.scale, sz.y * this.scale, sz.z * this.scale);
    }

    public getMesh(): Mesh {
        return this.frames[this.currentFrame];
    }
}

