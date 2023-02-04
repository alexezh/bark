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

    getModel(id: string, x: number, r: any, rr: any = undefined): any {
        return undefined;
    }
}

