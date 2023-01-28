import { throws } from 'assert';
import { PointLight, SpotLight, Vector3 } from 'three';
import { game } from './main';
import { get_rand } from './utils';

/////////////////////////////////////////////////////////////////////
// Objects
/////////////////////////////////////////////////////////////////////
export class Obj {
    public chunk: any;
    public active: any = [];
    public ptr = 0;
    public base_type = "object";
    public red_light = new PointLight(0xFF00AA, 2, 10);
    public yellow_light = new PointLight(0xFFAA00, 2, 80);
    public green_light = new PointLight(0x00FF00, 2, 10);
    public streetlight = new SpotLight(0xFFAA00);
    public max = 20;
    public alive: boolean = false;

    createObj(model: string, size: number) {
        this.chunk = game.modelLoader.getModel(model, size, this);
        this.chunk.mesh.visible = false;
        this.chunk.mesh.rotation.set(Math.PI, 0, 0);
    };

    update(time, delta) {
    };

    destroy() {
        //  this.chunk.explode();
    };
}

export class FFChunk extends Obj {
    base_type = "";
    type = "ff_chunk";

    hit(dmg, dir, type, pos) {
        dir.x += (1 - get_rand() * 2);
        dir.y += (1 - get_rand() * 2);
        dir.z += (1 - get_rand() * 2);
        this.chunk.explode(dir, dmg);
        this.alive = false;
        game.removeFromCD(this.chunk.mesh);
    };

    create(chunk) {
        this.chunk = chunk;
        this.base_type = chunk.owner.base_type;
        this.chunk.owner = this;
        this.chunk.build();

        //game.maps.loaded.push(this);
        //game.addToCD(this.chunk.mesh);
        //game.addToCD(this.chunk.bb);

    }
}

export class Portal extends Obj {
    base_type = "object";
    type = "portal";
    alive = true;
    x = 0;
    y = 0;
    z = 0;

    create(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    update(time, delta) {
        var x = 0;
        var z = 0;
        var r = 10;
        for (var a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            x = this.x + r * Math.cos(a)
            z = this.z + r * Math.sin(a)
            game.particles.portalMagic(x, game.maps_ground, z);
        }
    };
}

// Painkillers
export class PainKillers extends Obj {
    public base_type = "object";
    public obj_type = "painkillers";
    public alive = true;
    public light = 0;
    public taken = false;

    grab(mesh_id) {
        if (!this.taken) {
            game.sounds.playSound("painkillers", this.chunk.mesh.position, 250);
            game.removeFromCD(this.chunk.mesh);
            game.player.bleed_timer += 60; // add 60 sec.
            this.taken = true;
        }
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("painkillers", 0.2, this);
        this.chunk.owner = this;
        this.chunk.mesh.owner = this;
        this.chunk.mesh.visible = true;
        this.chunk.mesh.position.set(x, game.maps_ground + 1, z);
        game.addToCD(this.chunk.mesh);
    };

    update(time, delta) {
        //Obj.prototype.update.call();
        if (!this.taken) {
            this.chunk.mesh.rotation.y += Math.sin(delta);
            this.chunk.mesh.position.y = game.maps_ground + 6 + Math.sin(time * 2.5);
        } else {
            this.chunk.mesh.position.y += 0.5;
            if (this.chunk.mesh.position.y > game.maps_ground + 30) {
                this.chunk.virtual_explode(this.chunk.mesh.position);
                this.chunk.destroy();
                this.alive = false;
            }
        }
    };
}

export class PaperPoliceCar extends Obj {
    public base_type = "object";
    public type = "paperpolicecar";
    public alive = true;

    hit(dmg, dir, type, pos) {
        this.chunk.hit(dir, dmg, pos);
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("paperpolicecar", 0.6, this);
        this.chunk.owner = this;
        this.chunk.mesh.visible = true;
        this.chunk.mesh.position.set(x, game.maps_ground + (this.chunk.chunk_size_y * this.chunk.blockSize) / 2, z);
    };
}

export class PaperAgent extends Obj {
    public base_type = "object";
    public type = "paperagent";
    public alive = true;

    hit(dmg, dir, type, pos) {
        this.chunk.hit(dir, dmg, pos);
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("paperagent", 0.2, this);
        this.chunk.owner = this;
        this.chunk.mesh.visible = true;
        this.chunk.mesh.position.set(x, game.maps_ground + (this.chunk.chunk_size_y * this.chunk.blockSize) / 2, z);
    };
}

export class Tree extends Obj {
    public base_type = "object";
    public type = "tree";
    public alive = true;
    public light = 0;

    hit(dmg, dir, type, pos) {
        this.chunk.hit(dir, dmg, pos);
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("tree", 0.5, this);
        this.chunk.owner = this;
        this.chunk.mesh.visible = true;
        this.chunk.mesh.position.set(x, game.maps_ground + (this.chunk.chunk_size_y * this.chunk.blockSize) / 2, z);
    };
}

export class StreetLamp extends Obj {
    public base_type = "object";
    public obj_type = "street_lamp";
    public alive = true;
    public light = 0;

    hit(dmg, dir, type, pos) {
        if (this.chunk.hit(dir, dmg, pos)) {
            if (type != "missile" && type != "grenade") {
                game.sounds.playSound("bullet_metal", pos, 300);
            }
            // if(this.light.intensity > 0) {
            //     this.light.intensity -= 0.5*dmg;
            //     if(this.light.intensity < 0) {
            //         this.light.intensity = 0;
            //     }
            // }
            if (this.chunk.health < 60) {
                this.alive = false;
            }
            return true;
        }
        return false;
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("streetlamp", 0.4, this);
        this.chunk.owner = this;
        this.chunk.mesh.visible = true;
        //  this.light = this.streetlight.clone();
        //  var targetObject = new Object3D();
        //  targetObject.position.set(0, 0, 0);
        //  game.scene.add(targetObject);
        //  this.light.target = targetObject;
        //  this.light.decay = 1;
        //  this.light.intensity = 2.4;
        //  this.light.distance = 80;
        //  this.light.angle = Math.PI;
        // this.chunk.mesh.add(targetObject);
        // this.chunk.mesh.add(this.light);
        // DEBUG
        //  var m = new Mesh(new BoxGeometry(2,2,2),
        //                         new MeshBasicMaterial({color: 0xFF0000}));
        //  this.light.add(m);

        // this.light.position.set(0, 15, 0);
        //     this.chunk.mesh.rotation.x = -Math.PI;
        // Check rotation depending on wall
        this.chunk.mesh.position.set(x, game.maps_ground + 10, z);
        //this.chunk.mesh.position.set(x, game.maps_ground+this.chunk.to_y*(1/this.chunk.blockSize), z);
        var res = game.chunkScene.checkExists(new Vector3(x - 1, game.maps_ground + 10, z));
        if (res.length > 0) {
            //     this.chunk.mesh.rotation.y = -Math.PI*2;
            this.chunk.mesh.position.x += 10;
            //    this.light.position.set(7, 18, 0);
        }
        res = game.chunkScene.checkExists(new Vector3(x, game.maps_ground + 10, z - 1));
        //if(res.length > 0) {
        //    this.chunk.mesh.rotation.y = -Math.PI;
        //}
        //res = game.world.checkExists(new Vector3(x+1,game.maps_ground+10,z+2));
        //if(res.length > 0) {
        //    this.chunk.mesh.rotation.y = -Math.PI;
        //   // this.chunk.mesh.position.x -= 10;
        //}
        for (var i = 0; i < 10; i++) {
            res = game.chunkScene.checkExists(new Vector3(x + i, game.maps_ground + 10, z));
            if (res.length > 0) {
                //        this.chunk.mesh.rotation.y = Math.PI;
                this.chunk.mesh.position.x -= 10;
                //this.light.position.set(7, 18, 0);
                break;
            }
        }
    };

    update(time, delta) {
        //  if (get_rand() < this.light.intensity) {
        //      game.particles_box.fire(
        //          this.chunk.mesh.position.x,
        //          this.chunk.mesh.position.y + 15,
        //          this.chunk.mesh.position.z
        //      );
        //  }
    };
}

// UfoSign
export class UfoSign extends Obj {
    base_type = "object";
    type = "radiation_sign";
    alive = true;
    light = 0;

    hit(dmg, dir, type, pos) {
        return this.chunk.hit(dir, dmg, pos);
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("ufo_sign", 0.2, this);
        this.chunk.owner = this;
        this.chunk.mesh.visible = true;
        this.chunk.mesh.rotation.y = Math.PI / 2;
        //     this.chunk.mesh.rotation.x = -Math.PI;
        // Check rotation depending on wall
        var res = game.chunkScene.checkExists(new Vector3(x - 1, game.maps_ground + 10, z));
        if (res.length > 0) {
            this.chunk.mesh.rotation.y = -Math.PI / 2;
        }
        res = game.chunkScene.checkExists(new Vector3(x, game.maps_ground + 10, z - 1));
        if (res.length > 0) {
            this.chunk.mesh.rotation.y = 2 * Math.PI;
        }
        res = game.chunkScene.checkExists(new Vector3(x, game.maps_ground + 10, z + 2));
        if (res.length > 0) {
            this.chunk.mesh.rotation.y = -Math.PI;
        }

        this.chunk.mesh.position.set(x, game.maps_ground + 10, z);
    };
}

// RadiationSign
export class RadiationSign extends Obj {
    public base_type = "object";
    public type = "radiation_sign";
    public alive = true;
    public light = 0;

    hit(dmg, dir, type, pos) {
        this.chunk.hit(dir, dmg, pos);
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("radiation_sign", 0.2, this);
        this.chunk.owner = this;
        this.chunk.mesh.visible = true;
        this.chunk.mesh.rotation.y = Math.PI / 2;
        this.chunk.mesh.rotation.x = -Math.PI;
        // Check rotation depending on wall
        var res = game.chunkScene.checkExists(new Vector3(x - 1, game.maps_ground + 10, z));
        if (res.length > 0) {
            this.chunk.mesh.rotation.y = -Math.PI / 2;
        }
        res = game.chunkScene.checkExists(new Vector3(x, game.maps_ground + 10, z - 1));
        if (res.length > 0) {
            this.chunk.mesh.rotation.y = 2 * Math.PI;
        }
        res = game.chunkScene.checkExists(new Vector3(x, game.maps_ground + 10, z + 2));
        if (res.length > 0) {
            this.chunk.mesh.rotation.y = Math.PI;
        }

        this.chunk.mesh.position.set(x, game.maps_ground + 10, z);
    };
}

// Dead hearty
export class DeadHearty extends Obj {
    public base_type = "object";
    public type = "dead_hearty";
    public alive = true;
    public light: any;
    public radioactive = true;
    public radioactive_leak = true;

    hit(dmg, dir, type, pos) {
        //this.chunk.explode(dir, dmg);
        this.chunk.hit(dir, dmg, pos);
        this.alive = false;
    };

    update(time, delta) {
        var pos = this.chunk.mesh.position;
        game.particles.radiation(pos.x + (2 - get_rand() * 4), pos.y, pos.z + (2 - get_rand() * 4));
        if (get_rand() > 0.9) {
            this.light.intensity = (2 - get_rand());
        }
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("dead_hearty", 1, this);
        this.chunk.owner = this;
        this.chunk.mesh.visible = true;
        this.chunk.mesh.rotation.y = Math.random() * Math.PI * 2;
        this.chunk.mesh.position.set(x, game.maps_ground + 1, z);
        this.light = this.green_light.clone();
        this.light.position.set(0, 3, 0);
        this.chunk.mesh.add(this.light);
    };
}

export class BarrelFire extends Obj {
    base_type = "object";
    type = "barrel_fire";
    alive = true;
    light: any;

    hit(dmg, dir, type, pos) {
        if (this.chunk.hit(dir, dmg, pos)) {
            if (type != "missile" && type != "grenade") {
                game.sounds.playSound("bullet_metal", pos, 300);
            }
            this.alive = false;
            return true;
        }
        return false;
    };

    update(time, delta) {
        var pos = this.chunk.mesh.position;
        game.particles.fire(pos.x + (4 - get_rand() * 8), game.maps_ground + 6 + this.chunk.to_y * 2, pos.z + (4 - get_rand() * 8));
        if (get_rand() > 0.9) {
            this.light.intensity = 2 - get_rand() * 0.1;
            this.light.distance = (20 + get_rand() * 5);
        }
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("barrel_fire", 0.5, this);
        this.chunk.mesh.position.set(x, game.maps_ground + this.chunk.to_y * (1 / this.chunk.blockSize), z);
        this.light = this.yellow_light.clone();
        this.light.position.set(0, 10, 0);
        this.chunk.mesh.add(this.light);
    };
}

export class Barrel extends Obj {
    public base_type = "object";
    public type = "barrel";
    public alive = true;
    public light: any;
    public radioactive = true;
    public radioactive_leak = true;

    hit(dmg, dir, type, pos) {
        //this.chunk.explode(dir, dmg);
        if (this.chunk.hit(dir, dmg, pos)) {
            if (type != "missile" && type != "grenade") {
                game.sounds.playSound("bullet_metal", pos, 300);
            }
            this.alive = false;
            return true;
        }
        return false;
    };

    update(time, delta) {
        var pos = this.chunk.mesh.position;
        game.particles.radiation(pos.x + (1 - get_rand() * 2), game.maps_ground + 4 + this.chunk.to_y * 2, pos.z + (1 - get_rand() * 2));
        if (get_rand() > 0.9) {
            this.light.intensity = 2 - get_rand() * 0.1;
            this.light.distance = (20 + get_rand() * 5);
        }
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("barrel", 0.5, this);
        //this.chunk.owner = this;
        //this.chunk.mesh.visible = true;
        //  this.chunk.mesh.rotation.y = Math.random()*Math.PI*2;
        // this.chunk.mesh.rotation.y = -Math.PI;
        this.chunk.mesh.position.set(x, game.maps_ground + this.chunk.to_y * (1 / this.chunk.blockSize), z);
        this.light = this.green_light.clone();
        this.light.position.set(0, 10, 0);
        this.chunk.mesh.add(this.light);
    };
}

export class FBIHQ extends Obj {
    public base_type = "object";
    public type = "fbihq";
    public alive = true;

    hit(dmg, dir, type, pos) {
        this.chunk.hit(dir, dmg, pos);
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("fbihq", 1, this);
        //this.chunk.mesh.rotation.y = -Math.PI;
        this.chunk.mesh.position.set(x, game.maps_ground + this.chunk.chunk_size_y * this.chunk.blockSize / 2, z);
    };
}

// Spiderweb
export class SpiderWeb extends Obj {
    base_type = "object";
    type = "spiderweb";
    alive = true;
    light = 0;

    hit(dmg, dir, type) {
        this.chunk.explode(dir, dmg);
        this.alive = false;
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("spiderweb", 0.2, this);
        this.chunk.owner = this;
        this.chunk.mesh.visible = true;
        this.chunk.mesh.position.set(x, game.maps_ground + 1, z);
    };
}

// Ammo crate 
export class Lamp1 extends Obj {
    base_type = "object";
    type = "lamp1";
    alive = true;
    light: any;

    hit(dmg, dir, type, pos) {
        this.chunk.hit(dir, dmg, pos)
        if (this.light.intensity > 0) {
            this.light.intensity -= 0.5 * dmg;
            if (this.light.intensity < 0) {
                this.light.intensity = 0;
            }
        }
        if (this.chunk.health < 60) {
            this.alive = false;
        }
    };

    create(x, y, z) {
        this.chunk = game.modelLoader.getModel("lamp1", 1, this);
        this.chunk.type = "object";
        this.chunk.owner = this;
        this.chunk.mesh.visible = true;
        this.chunk.mesh.position.set(x, game.maps_ground + 7, z);
        this.light = this.yellow_light.clone();
        this.light.position.set(0, 12, 0);
        this.chunk.mesh.add(this.light);
    };

    update(time, delta) {
        if (get_rand() < this.light.intensity) {
            game.particles_box.fire(
                this.chunk.mesh.position.x,
                this.chunk.mesh.position.y + 8,
                this.chunk.mesh.position.z
            );
        }
    };
}

// Ammo crate 
export class AmmoCrate extends Obj {
    sides = [];

    create() {
        var up = game.modelLoader.getModel("crate", 1, this);
        up.mesh.visible = false;
        up.mesh.rotation.set(Math.PI, 0, 0);
        up.mesh.position.set(200, 8, 300);

    };
}

// Ammo shell 
export class AmmoSniper extends Obj {
    create() {
        this.createObj("ammo", 0.02);
        for (var i = 0; i < this.max; i++) {
            var c = this.chunk.mesh.clone();
            c.visible = false;
            game.scene.add(c);
            this.active.push(c);

        }
    };

    add(x, y, z) {
        if (this.ptr++ >= this.max - 1) {
            this.ptr = 0;
        }
        game.particles.empty_shell(x, y, z, this.active[this.ptr]);
    };
}

// Ammo shell
export class AmmoP90 extends Obj {
    create() {
        this.createObj("ammo", 0.009);
        for (var i = 0; i < this.max; i++) {
            var c = this.chunk.mesh.clone();
            c.visible = false;
            game.scene.add(c);
            this.active.push(c);

        }
    };

    add(x, y, z) {
        if (this.ptr == this.max - 1) {
            this.ptr = 0;
        }
        this.ptr++;
        game.particles.empty_shell(x, y, z, this.active[this.ptr]);
    };
}

// Ammo shell
export class Ammo extends Obj {
    create() {
        this.createObj("ammo", 0.015);
        for (var i = 0; i < this.max; i++) {
            var c = this.chunk.mesh.clone();
            c.visible = false;
            game.scene.add(c);
            this.active.push(c);
        }
    };

    add(x, y, z) {
        if (this.ptr == this.max - 1) {
            this.ptr = 0;
        }
        this.ptr++;
        game.particles.empty_shell(x, y, z, this.active[this.ptr]);
    };
}

// Shotgun shell
export class Shell extends Obj {
    create() {
        this.createObj("shell", 0.025);
        for (var i = 0; i < this.max; i++) {
            var c = this.chunk.mesh.clone();
            c.visible = false;
            game.scene.add(c);
            this.active.push(c);
        }
    };

    add(x, y, z) {
        //        game.particles.empty_shell(x,y,z, this.chunk);
        if (this.ptr++ >= this.max - 1) {
            this.ptr = 0;
        }
        game.particles.empty_shell(x, y, z, this.active[this.ptr]);
    };
}

// Heart
export class Heart extends Obj {
    public obj_type = "heart";

    create() {
        this.createObj("heart", 0.2);
    };

    grab(mesh_id) {
        for (var i = 0; i < this.active.length; i++) {
            if (this.active[i].id == mesh_id) {
                game.sounds.playSound("take_heart", this.active[i].position, 250);
                game.removeFromCD(this.active[i]);
                this.active[i].alive = false;
            }
        }
    };

    update(time, delta) {
        // Obj.prototype.update.call();
        for (var i = 0; i < this.active.length; i++) {
            if (this.active[i].alive) {
                this.active[i].rotation.y += Math.sin(delta);
                this.active[i].position.y = game.maps_ground + 6 + Math.sin(time * 2.5);
                if (get_rand() > 0.5) {
                    game.particles.blueMagic(
                        this.active[i].position.x,
                        this.active[i].position.y,
                        this.active[i].position.z
                    );
                }
            } else {
                if (this.active[i].position.y < game.maps_ground + 20) {
                    //this.active[i].rotation.y += time*10;
                    this.active[i].position.y += 0.3;
                } else {
                    this.active[i].rotation.y = 0;
                    this.chunk.virtual_explode(this.active[i].position);
                    game.scene.remove(this.active[i]);
                    this.active.splice(i, 1);
                }
            }
        }
    };

    add(x, y, z) {
        var m = this.chunk.mesh.clone();
        game.scene.add(m);
        m.position.set(x, y, z);
        m.visible = true;
        this.active.push(m);
        m.alive = true;
        m.owner = this;
        var l1 = this.red_light.clone();
        var l2 = this.red_light.clone();
        m.add(l1);
        m.add(l2);
        l1.position.y = 2;
        l1.position.z = -2;
        l2.position.y = 2;
        l2.position.z = 2;
        game.addToCD(m);
        //  var light1 = new PointLight( 0xFF00AA, 2, 20 );
        //  m.add( light1 );
    };
}
