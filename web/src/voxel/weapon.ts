import { PointLight, Vector3 } from "three";
import { game } from "./main";
import { get_rand } from './utils';

//////////////////////////////////////////////////////////////////////
export class Weapon {
    public ammo = 0;
    public base_type = "weapon";
    public chunk: any;
    public name = "";
    public fire_rate = 0; // in ms between each
    public reloading = 0;
    public attached = false;
    public attached_id = 0;
    public alive = true;
    public timeout = 0;
    public relative_speed = 0;
    public shoot_light = new PointLight(0xFFAA00, 3, 10);
    public damage = 1;
    public obj_type: any;

    create(model, size) {
        game.scene.add(this.shoot_light);
        this.chunk = game.modelLoader.getModel(model, size, this, true);
        game.removeFromCD(this.chunk.mesh);
        game.addObject(this);
    };

    destroy() {
        game.scene.remove(this.chunk.mesh);
        game.removeFromCD(this.chunk.mesh);
        // this.chunk.mesh.geometry.dispose();
        // this.chunk.mesh.material.dispose();
        // this.chunk.bb.geometry.dispose();
        // this.chunk.bb.material.dispose();
        this.alive = false;
    };

    setPosition(x, y, z) {
        this.chunk.mesh.position.set(x, y, z);
    };

    setRotation(x, y, z) {
        this.chunk.mesh.rotation.set(x, y, z);
    };

    detach(mesh, pos) {
        if (this.attached && mesh.id == this.attached_id) {
            this.chunk.mesh.visible = true;
            mesh.remove(this.chunk.mesh);
            game.scene.add(this.chunk.mesh);
            game.addToCD(this.chunk.mesh);
            this.setRotation(Math.PI, Math.PI, 0);
            this.setPosition(pos.x + (6 - get_rand() * 12), 6, pos.z + (6 - get_rand() * 12));
            this.attached = false;
            this.attached_id = 0;
        }
    };

    attach(mesh) {
        if (!this.attached) {
            game.sounds.playSound("reload", this.chunk.mesh.position, 800);
            this.timeout = 0;
            mesh.add(this.chunk.mesh);
            game.removeFromCD(this.chunk.mesh);
            this.attached = true;
            this.attached_id = mesh.id;
            return true;
        }
        return false;
    };


    fire(q, id, shooter, speed) {
    }

    shoot(dir, id, mesh, speed) {
        if (this.reloading <= 0) {
            this.fire(dir, id, mesh, speed);
            this.reloading = this.fire_rate;
            //var light = this.shoot_light.clone();
            var draw_light = false;
            // Keep fps higher
            if (this.obj_type == "minigun" && get_rand() > 0.5) {
                //    draw_light = false;
            }
            if (draw_light) {
                var point = this.chunk.mesh.localToWorld(new Vector3(60, -1, 0));
                this.shoot_light.position.set(
                    point.x,
                    point.y,
                    point.z
                );
                this.shoot_light.visible = true;
            }
            //game.scene.add( light );
            //setTimeout(function() { game.scene.remove(light);}, 10);
            //this.lights.push(light);
        }
    };

    update(time, delta) {
        if (!this.attached) {
            if (this.timeout > 60) { // Remove after 1min.
                this.destroy();
            }
            this.timeout += delta;
        }
        // Update reload time
        if (this.reloading >= 0) {
            this.reloading -= delta;
        }
        // Animate dropped weapon
        if (!this.attached) {
            this.chunk.mesh.position.y = game.maps.ground + 6 + Math.sin(time * 2.5);
            this.chunk.mesh.rotation.y += Math.sin(delta);
        }
        if (this.shoot_light.visible) {
            this.shoot_light.visible = false;
        }
    };
}

//////////////////////////////////////////////////////////////////////
// Shotgun class
//////////////////////////////////////////////////////////////////////
export class Shotgun extends Weapon {
    obj_type = "shotgun";
    fire_rate = 0.5;
    recoil = 1;
    damage = 1;

    create(model, size) {
        this.create("shotgun", 0.1);
        Weapon.prototype.create.call(this, model, size);
    };

    fire(q, id, shooter, speed) {
        game.sounds.playSound("shotgun", game.player.chunk.mesh.position, 250);
        var point = this.chunk.mesh.localToWorld(new Vector3(60, -1, 0));
        var dir = new Vector3(0, 0, Math.PI).applyQuaternion(q);

        for (var i = 0; i < 10; i++) {
            game.particles.gunSmoke(point.x, point.y, point.z, dir.x, dir.y, dir.z);
            game.particles.smoke(point.x + (1 - get_rand() * 2), point.y + (1 - get_rand() * 2), point.z + (1 - get_rand() * 2), 0.5);
        }
        // shooter.translateZ(-this.recoil);
        game.particles.ammoShell(point.x, point.y, point.z, dir.x, dir.y, dir.z, id, speed, this.damage);
        game.objects["shell"].add(point.x, point.y, point.z);
        game.sounds.playSound("shotgun_reload", game.player.chunk.mesh.position, 300);
    };

}

//////////////////////////////////////////////////////////////////////
// Sniper class
//////////////////////////////////////////////////////////////////////
export class Sniper extends Weapon {
    obj_type = "sniper";
    fire_rate = 1.5;
    recoil = 5;
    damage = 5;

    create(model, size) {
        this.create("sniper", 0.1);
        Weapon.prototype.create.call(this, model, size);
    };

    fire(q, id, shooter, speed) {
        game.sounds.playSound("sniper", game.player.chunk.mesh.position, 300);

        var point = this.chunk.mesh.localToWorld(new Vector3(60, -1, 0));
        var dir = new Vector3(0, 0, Math.PI).applyQuaternion(q);

        for (var i = 0; i < 2; i++) {
            game.particles.gunSmoke(point.x, point.y, point.z, dir.x, dir.y, dir.z);
            game.particles.smoke(point.x, point.y, point.z, 0.4);
        }
        // shooter.translateZ(-this.recoil);
        game.particles.ammoSniper(point.x, point.y, point.z, dir.x, dir.y, dir.z, id, speed, this.damage);
        game.objects["ammo_sniper"].add(point.x, point.y, point.z);
    };

}

//////////////////////////////////////////////////////////////////////
// Pistol class
//////////////////////////////////////////////////////////////////////
export class Pistol extends Weapon {
    obj_type = "pistol";
    fire_rate = 0.5;
    recoil = 0.2;
    damage = 1;

    create(model, size) {
        this.create("pistol", 0.1);
        Weapon.prototype.create.call(this, model, size);
    };

    fire(q, id, shooter, speed) {
        game.sounds.playSound("pistol", game.player.chunk.mesh.position, 450);
        var point = this.chunk.mesh.localToWorld(new Vector3(60, -1, 0));
        var dir = new Vector3(0, 0, Math.PI).applyQuaternion(q);

        for (var i = 0; i < 2; i++) {
            game.particles.gunSmoke(point.x, point.y, point.z, dir.x, dir.y, dir.z);
            game.particles.smoke(point.x, point.y, point.z, 0.4);
        }
        // shooter.translateZ(-this.recoil);
        game.particles.ammoP90(point.x, point.y, point.z, dir.x, dir.y, dir.z, id, speed, this.damage);
        game.objects["ammo_p90"].add(point.x, point.y, point.z);
    };

}

//////////////////////////////////////////////////////////////////////
// Grenade Launcher class
//////////////////////////////////////////////////////////////////////
export class GrenadeLauncher extends Weapon {
    public obj_type = "grenadelauncher";
    public fire_rate = 1;
    public recoil = 0.2;
    public damage = 8;

    create(model, size) {
        this.create("grenadelauncher", 0.1);
        Weapon.prototype.create.call(this, model, size);
    };

    fire(q, id, shooter, speed) {
        game.sounds.playSound("grenadelauncher", game.player.chunk.mesh.position, 450);
        var point = this.chunk.mesh.localToWorld(new Vector3(60, -1, 0));
        var dir = new Vector3(0, 0, Math.PI).applyQuaternion(q);

        for (var i = 0; i < 2; i++) {
            game.particles.gunSmoke(point.x, point.y, point.z, dir.x, dir.y, dir.z);
            game.particles.smoke(point.x, point.y, point.z, 0.4);
        }
        // shooter.translateZ(-this.recoil);
        game.particles.ammoGrenadeLauncher(point.x, point.y, point.z, dir.x, dir.y, dir.z, speed, this.damage);
    };

}

//////////////////////////////////////////////////////////////////////
// P90 class
//////////////////////////////////////////////////////////////////////
export class P90 extends Weapon {
    public obj_type = "p90";
    public fire_rate = 0.07;
    public recoil = 0.2;
    public damage = 1;

    create(model, size) {
        this.create("p90", 0.1);
        Weapon.prototype.create.call(this, model, size);
    };

    fire(q, id, shooter, speed) {
        game.sounds.playSound("p90", game.player.chunk.mesh.position, 350);
        var point = this.chunk.mesh.localToWorld(new Vector3(60, -1, 0));
        var dir = new Vector3(0, 0, Math.PI).applyQuaternion(q);

        for (var i = 0; i < 2; i++) {
            game.particles.gunSmoke(point.x, point.y, point.z, dir.x, dir.y, dir.z);
            game.particles.smoke(point.x, point.y, point.z, 0.4);
        }
        // shooter.translateZ(-this.recoil);
        game.particles.ammoP90(point.x, point.y, point.z, dir.x, dir.y, dir.z, id, speed, this.damage);
        game.objects["ammo_p90"].add(point.x, point.y, point.z);
    };

}

//////////////////////////////////////////////////////////////////////
// Minigun class
//////////////////////////////////////////////////////////////////////
export class Minigun extends Weapon {
    obj_type = "minigun";
    fire_rate = 0.1;
    recoil = 0.2;
    damage = 2;

    create(model, size) {
        this.create("minigun", 0.1);
        Weapon.prototype.create.call(this, model, size);
    };

    fire(q, id, shooter, speed) {
        game.sounds.playSound("minigun", game.player.chunk.mesh.position, 250);
        var point = this.chunk.mesh.localToWorld(new Vector3(60, -1, 0));
        var dir = new Vector3(0, 0, Math.PI).applyQuaternion(q);

        for (var i = 0; i < 5; i++) {
            game.particles.gunSmoke(point.x, point.y, point.z, dir.x, dir.y, dir.z);
            game.particles.smoke(point.x, point.y, point.z, 0.4);
        }
        // shooter.translateZ(-this.recoil);
        game.particles.ammoMinigun(point.x, point.y, point.z, dir.x, dir.y, dir.z, id, speed, this.damage);
        game.objects["ammo"].add(point.x, point.y, point.z);
    };

}


//////////////////////////////////////////////////////////////////////
// Ak47 class
//////////////////////////////////////////////////////////////////////
export class Ak47 extends Weapon {
    public obj_type = "ak47";
    public fire_rate = 0.15;
    public recoil = 1;
    public damage = 2;

    create(model, size) {
        this.create("ak47", 0.1);
        Weapon.prototype.create.call(this, model, size);
    };

    fire(q, id, shooter, speed) {
        game.sounds.playSound("ak47", game.player.chunk.mesh.position, 350);

        var point = this.chunk.mesh.localToWorld(new Vector3(60, -1, 0));
        var dir = new Vector3(0, 0, Math.PI).applyQuaternion(q);

        for (var i = 0; i < 5; i++) {
            game.particles.gunSmoke(point.x, point.y, point.z, dir.x, dir.y, dir.z);
            game.particles.smoke(point.x, point.y, point.z, 0.4);
        }
        // shooter.translateZ(-this.recoil);
        game.particles.ammoAk47(point.x, point.y, point.z, dir.x, dir.y, dir.z, id, speed, this.damage);
        game.objects["ammo"].add(point.x, point.y, point.z);
    };

}

//////////////////////////////////////////////////////////////////////
// RocketLauncher class
//////////////////////////////////////////////////////////////////////
export class RocketLauncher extends Weapon {
    public obj_type = "rocketlauncher";
    public fire_rate = 1;
    public recoil = 4;
    public damage = 6;

    create(model, size) {
        this.create("rocketlauncher", 0.1);
        Weapon.prototype.create.call(this, model, size);
    };

    fire(q, id, shooter, speed) {
        game.sounds.playSound("rocket", game.player.chunk.mesh.position, 350);
        var point = this.chunk.mesh.localToWorld(new Vector3(60, -1, 0));
        var dir = new Vector3(0, 0, Math.PI).applyQuaternion(q);
        game.particles.ammoMissile(point.x, point.y, point.z, dir.x, dir.y, dir.z, this, null, speed, this.damage);

        for (var i = 0; i < 50; i++) {
            game.particles.gunSmoke(point.x, point.y, point.z, dir.x, dir.y, dir.z);
            game.particles.smoke(point.x + (1 - get_rand() * 2), point.y + (1 - get_rand() * 2), point.z + (1 - get_rand() * 2), 0.5);
        }
        //        shooter.translateZ(-this.recoil);
    };

}
