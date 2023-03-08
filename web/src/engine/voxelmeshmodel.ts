// represents voxel model as set of meshes
// ATT: it is responsivility of caller to adjust position information on mesh

import { Mesh, MeshPhongMaterial, Scene, Vector, Vector3 } from "three";
import { GameColors } from "../ui/gamecolors";
import { VoxelGeometryWriter } from "../voxel/voxelgeometrywriter";
import { modelCache } from "../voxel/voxelmodelcache";
import { Sprite3 } from "./sprite3";

export enum RigitBodyKind {
    sprite,
    block
}

// interface for physics engine to work with sprites
// from physics perspective, we deal with speed and impulses
// interactivity (keyboard) is done at higher level
// such as when we do wall jump, contact with the wall will 0 the speed
// similarly, the sprite can zero out the speed when reaching position
export interface IRigitBody {
    get id(): number;
    get kind(): RigitBodyKind;
    get inactive(): boolean;
    // owner set by application
    get owner(): any;

    // speed is pixel per second
    get speed(): Vector3;
    get position(): Vector3;
    get size(): Vector3;

    setSpeed(speed: Vector3): void;
    onMove(pos: Vector3): void;
    setCollision(obj: IRigitBody | undefined): void;
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

export type VoxelAnimationFrame = {
    idx: number;
    dur: number;
}

export type VoxelAnimationCollection = { [name: string]: VoxelAnimationFrame[] };

// when adding / updating mesh on scene
export class VoxelMeshModel {
    private frames: Mesh[] = [];
    private currentFrame: number = 0;
    private scale: number = 0.6;
    private _size!: Vector3;
    private readonly _animations: VoxelAnimationCollection | undefined;
    private readonly material: MeshPhongMaterial;
    private currentAnumation: string | undefined;

    // size in world units
    // computed as voxels multiplied by scale factor
    public get size(): Vector3 { return this._size; };

    public static async create(uri: string, animations: VoxelAnimationCollection | undefined = undefined): Promise<VoxelMeshModel> {
        let o = new VoxelMeshModel(animations);
        await o.load(uri);
        return o;
    }

    public constructor(animations: VoxelAnimationCollection | undefined) {
        this.material = GameColors.material;
        this._animations = animations;
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

    public playAnimation(name: string) {

    }

    public addToScene(scene: Scene) {
        for (let m of this.frames) {
            m.visible = false;
            scene.add(m);
        }
    }

    public removeFromScene(scene: Scene) {
        for (let m of this.frames) {
            scene.remove(m);
        }
    }

    public setPosition(pos: Vector3): void {
        this.frames[this.currentFrame].position.set(pos.x, pos.y, pos.z);
    }
}

