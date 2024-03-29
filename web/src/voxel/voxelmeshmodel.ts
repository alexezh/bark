// represents voxel model as set of meshes
// ATT: it is responsivility of caller to adjust position information on mesh

import { Mesh, MeshPhongMaterial, Object3D, Quaternion, Scene, Vector, Vector3 } from "three";
import { GameColors } from "../lib/gamecolors";
import { VoxelGeometryWriter } from "./voxelgeometrywriter";
import { modelCache } from "./voxelmodelcache";
import { vm } from "../engine/ivm";
import { Sprite3 } from "../engine/sprite3";
import { VoxelModel } from "./voxelmodel";

export type VoxelAnimationFrame = {
    idx: number;
    dur: number;
}

export type VoxelAnimationCollection = { [name: string]: VoxelAnimationFrame[] };

// when adding / updating mesh on scene
export class VoxelMeshModel {
    private frames: Mesh[] = [];
    private readonly _size: Vector3 = new Vector3();
    private readonly _pos: Vector3 = new Vector3();
    private _qt!: Quaternion;
    private readonly material: MeshPhongMaterial;
    // index in frames array
    private currentFrame: number = 0;
    private currentAnimation: VoxelAnimationFrame[] | undefined;
    // index in frames array
    private currentAnimationFrame: number = 0;
    private lastFrameTick: number = 0;
    public readonly animations: VoxelAnimationCollection = {};

    // size in world units
    // computed as voxels multiplied by scale factor
    public get size(): Vector3 { return this._size; };

    public static create(vmm: VoxelModel, scale: number = 1): VoxelMeshModel {
        let o = new VoxelMeshModel();
        o.load(vmm, scale);
        return o;
    }

    public constructor() {
        this.material = GameColors.material;
    }

    private async load(vmm: VoxelModel, scale: number) {
        for (let f of vmm.frames) {
            let writer = new VoxelGeometryWriter(f.verticeCount, f.colorCount, 6);

            writer.setScale(scale);

            f.build(writer);

            let geo = writer.getGeometry();
            let mm = new Mesh(geo, this.material);
            this.frames.push(mm);
        }

        let sz = vmm.size;
        this._size.set(sz.x * scale, sz.y * scale, sz.z * scale);
        this._pos.set(0, 0, 0);
    }

    public playAnimation(name: string) {
        if (this.animations === undefined) {
            return;
        }

        if (this.currentAnimation === this.animations[name]) {
            return;
        }

        if (this.currentAnimation !== undefined) {

        }

        this.lastFrameTick = vm.clock.lastTick;
        this.currentAnimation = this.animations[name];
        this.currentAnimationFrame = 0;
    }

    public onRender(tick: number) {
        if (this.currentAnimation === undefined) {
            return;
        }

        if (this.lastFrameTick !== 0 && this.lastFrameTick + this.currentAnimation[this.currentAnimationFrame].dur < tick) {
            this.frames[this.currentFrame].visible = false;
            this.currentAnimationFrame++;
            if (this.currentAnimationFrame >= this.currentAnimation.length) {
                this.currentAnimationFrame = 0;
            }
            this.lastFrameTick = tick;
            this.currentFrame = this.currentAnimation[this.currentAnimationFrame].idx;

            let frame = this.frames[this.currentFrame];
            frame.position.copy(this._pos);
            frame.visible = true;
            if (this._qt) {
                //frame.position.set(0, 0, 0);
                frame.rotation.setFromQuaternion(this._qt);
                //frame.position.copy(this._pos);
            }
        }
    }

    public addToScene(parent: Scene) {
        for (let m of this.frames) {
            m.visible = false;
            parent.add(m);
        }

        this.frames[this.currentFrame].visible = true;
    }

    public removeFromScene(parent: Scene) {
        for (let m of this.frames) {
            parent.remove(m);
        }
    }

    public setPosition(pos: Vector3): void {
        this._pos.copy(pos);
        this.frames[this.currentFrame].position.copy(pos);
    }

    public setRotation(qt: Quaternion) {
        this._qt = qt;
        this.frames[this.currentFrame].rotation.setFromQuaternion(this._qt);
    }

    public setBasePoint(pos: Vector3) {
        for (let frame of this.frames) {
            frame.geometry.translate(pos.x, pos.y, pos.z);
        }
    }
}

