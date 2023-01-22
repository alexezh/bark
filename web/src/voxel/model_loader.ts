import { Chunk } from "./chunk";
import { game } from "./main";
import { loadImageFile } from "./utils";
import { Vox } from "./vox";

export type Model = {
    name: string;
    scale: number;
    kind: string;
    chunk?: Chunk;
    blob?: any;
}

//////////////////////////////////////////////////////////////////////
export class ModelLoader {
    models: Model[] = []
    files: any = [];


    public constructor() {
        this.models["greenie"] = { name: "/assets/vox/greenie.vox", scale: 1, kind: "object" };
        this.models["agent"] = { name: "/assets/vox/agent.vox", scale: 0.1, kind: "object" };
        this.models["agentblack"] = { name: "/assets/vox/agent_black.vox", scale: 0.1, kind: "object" };
        this.models["hearty"] = { name: "/assets/vox/hearty.vox", scale: 1, kind: "object" };
        this.models["dead_hearty"] = { name: "/assets/vox/dead_hearty.vox", scale: 1, kind: "object" };
        this.models["player"] = { name: "/assets/vox/player.vox", scale: 1, kind: "object" };
        this.models["dudo"] = { name: "/assets/vox/dudo.vox", scale: 1, kind: "object" };
        this.models["lamp1"] = { name: "/assets/vox/lamp1.vox", scale: 1, kind: "object" };
        this.models["shotgun"] = { name: "/assets/pixelart/shotgun.png", scale: 8, kind: "object" };
        this.models["shell"] = { name: "/assets/pixelart/shell.png", scale: 20, kind: "object" };
        this.models["heart"] = { name: "/assets/pixelart/heart.png", scale: 3, kind: "object" };
        this.models["ammo"] = { name: "/assets/pixelart/ammo.png", scale: 20, kind: "object" };
        this.models["ak47"] = { name: "/assets/pixelart/ak47.png", scale: 5, kind: "object" };
        this.models["p90"] = { name: "/assets/pixelart/p90.png", scale: 5, kind: "object" };
        this.models["pistol"] = { name: "/assets/pixelart/pistol.png", scale: 5, kind: "object" };
        this.models["sniper"] = { name: "/assets/pixelart/sniper.png", scale: 5, kind: "object" };
        this.models["minigun"] = { name: "/assets/pixelart/minigun.png", scale: 10, kind: "object" };
        this.models["rocketlauncher"] = { name: "/assets/pixelart/rocketlauncher.png", scale: 8, kind: "object" };
        this.models["grenadelauncher"] = { name: "/assets/pixelart/grenadelauncher.png", scale: 8, kind: "object" };
        this.models["spiderweb"] = { name: "/assets/pixelart/spiderweb.png", scale: 1, kind: "object" };
        this.models["painkillers"] = { name: "/assets/pixelart/painkillers.jpg", scale: 1, kind: "object" };
        this.models["radiation_sign"] = { name: "/assets/pixelart/radiation_sign.png", scale: 1, kind: "object" };
        this.models["ufo_sign"] = { name: "/assets/pixelart/sign_ufo.png", scale: 1, kind: "object" };
        this.models["barrel"] = { name: "/assets/vox/barrel.vox", scale: 0.1, kind: "object" };
        this.models["barrel_fire"] = { name: "/assets/vox/barrel_fire.vox", scale: 0.1, kind: "object" };
        this.models["fbihq"] = { name: "/assets/vox/fbi_hq.vox", scale: 5, kind: "object" };
        this.models["tree"] = { name: "/assets/vox/tree.vox", scale: 1, kind: "object" };
        this.models["streetlamp"] = { name: "/assets/vox/StreetLamp.vox", scale: 1, kind: "object" };
        this.models["tree"] = { name: "/assets/vox/test1.vox", scale: 1, kind: "object" };
        this.models["paperagent"] = { name: "/assets/vox/paperagent.vox", scale: 1, kind: "object" };
        this.models["paperpolicecar"] = { name: "/assets/vox/policecar.vox", scale: 1, kind: "object" };
        //this.models["fbihq"] = { name: "/assets/vox/demon.vox", 1, kind: "object"};
    }

    init() {
        for (var k in this.models) {
            this.files.push(k);
        }
    };

    loadFiles() {
        let key: any;

        if (this.files.length > 0) {
            key = this.files.pop();
        } else {
            return;
        }

        var that = this;
        if (this.models[key].name.indexOf("vox") != -1) {
            var oReq = new XMLHttpRequest();
            oReq.open("GET", this.models[key].name, true);
            oReq.responseType = "arraybuffer";

            var that = this;
            oReq.send(null);
            oReq.onload = function () {
                that.models[key].blob = oReq.response;
                that.loadModel(key);
                that.loadFiles();
            };
        } else if (this.models[key].name.indexOf("png") != 1) {
            loadImageFile(this.models[key].name, function (data, width, height) {
                var chunk = new Chunk(0, 0, 0, width, height, that.models[key].scale, key, 1, that.models[key].kind);
                // var data2 = [];
                for (var i = 0; i < data.length; i++) {
                    for (var y = 0; y < that.models[key][1]; y++) {
                        //data2.push({x: data[i].x, y: data[i].y, z: y, r: data[i].r, g: data[i].g, b: data[i].b});
                        chunk.addBlock(data[i].x, data[i].y, y, data[i].r, data[i].g, data[i].b);
                    }
                }
                chunk.blockSize = 1;
                chunk.build();
                that.models[key].chunk = chunk;
                chunk.mesh.visible = false;
                that.loadFiles();
            });
        }
    };

    loadModel(name) {
        var vox = new Vox();
        var model = vox.loadModel(this.models[name].blob, name);
        var p: any;
        let r = 0, g = 0, b = 0;
        var chunk = new Chunk(0, 0, 0, model.sx, model.sz, model.sy, name, this.models[name].scale, this.models[name].kind);
        for (var i = 0; i < model.data.length; i++) {
            p = model.data[i];
            r = (p.val >> 24) & 0xFF;
            g = (p.val >> 16) & 0xFF;
            b = (p.val >> 8) & 0xFF;
            if (p.y > model.sy || p.x > model.sx || p.z > model.sz) {
                continue;
            }
            chunk.addBlock(p.x, p.z, p.y, r, g, b);
        }
        //chunk.addBatch();
        // Remove mesh from scene (cloned later)
        chunk.build();
        chunk.mesh.visible = false;
        this.models[name].chunk = chunk;
    };

    getModel(name, size, obj, only_mesh?) {
        if (size == null) { size = 1; }
        if (only_mesh == null) { only_mesh = false; }
        if (only_mesh) {
            // Depp copy chunk
            let new_obj;
            new_obj = {};
            new_obj.owner = obj;
            new_obj.mesh = this.models[name].chunk!.mesh.clone();
            new_obj.mesh.owner = obj;
            //   new_obj.bb = this.models[name].bb.clone();
            // new_obj.bb.owner = obj;
            //new_obj.mesh.add(new_obj.bb);
            new_obj.mesh.visible = true;
            new_obj.mesh.scale.set(size, size, size);
            game.scene.add(new_obj.mesh);
            game.addToCD(new_obj.mesh);
            return new_obj;
        } else {
            let new_obj = this.models[name].chunk!.clone();

            new_obj.owner = obj;
            new_obj.blockSize = size;
            // new_obj.bb = undefined;
            new_obj.mesh = undefined;
            new_obj.build();
            // clone mesh and add to scene.
            // new_obj.mesh = this.models[name].mesh.clone();
            // new_obj.bb = this.models[name].bb.clone();

            // new_obj.mesh.geometry.computeBoundingBox();
            // new_obj.mesh.geometry.center();
            new_obj.mesh.visible = true;
            game.scene.add(new_obj.mesh);
            return new_obj;
        }
    };
}

