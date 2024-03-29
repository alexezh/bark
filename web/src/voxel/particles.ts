import { BoxGeometry, Mesh, MeshPhongMaterial, Scene, Sprite, SpriteMaterial, Vector3 } from "three";
import { get_rand } from './utils';

export class ParticlePool {
    public particles: Particle[] = [];
    public queue: any[] = [];
    public size: number;
    public pos = 0;
    public neg = 0;
    public opts = 0;
    public update_cnt = 0;
    public lights: any[] = [];
    public box_material = new MeshPhongMaterial({ color: 0xffffff });
    public sprite_material = new SpriteMaterial({ color: 0xffffff });

    public constructor(scene: Scene, size: number, type: number) {
        this.size = size;
        for (var i = 0; i < this.size; i++) {
            var p = new Particle();

            let mesh: Sprite | Mesh;
            if (type == 0) {
                mesh = new Sprite(this.sprite_material.clone());
            } else {
                mesh = new Mesh(new BoxGeometry(1, 1, 1), this.box_material.clone());
            }

            p.init(scene, mesh);
            this.particles.push(p);
        }
    };

    update(time, delta) {
        // Create max particles each frame
        for (var i = 0; i < 300; i++) {
            if (this.queue.length == 0) {
                break;
            }
            var p = this.queue.pop();
            if (this.createParticle(p) == -1) {
                this.queue.push(p);
                break;
            }
        }

        var tot = 0;
        var ts = 0;
        for (var i = this.update_cnt; i < this.particles.length; i++) {
            this.update_cnt = i;
            if (this.particles[i].active) {
                if (this.particles[i].type == "grenade" || this.particles[i].type == "missile" || this.particles[i].type == "minigun" || this.particles[i].type == "shell") {
                    this.particles[i].update(time, delta);
                } else {
                    if (tot < 5) {
                        ts = Date.now();
                        this.particles[i].update(time, delta);
                        tot += (Date.now() - ts);
                    }
                }
            }
        }
        if (this.update_cnt == this.particles.length - 1) {
            this.update_cnt = 0;
        }
    };

    createParticle(opts) {
        for (var i = 0; i < this.particles.length; i++) {
            if (!this.particles[i].active) {
                this.particles[i].set(opts);
                return this.particles[i];
            }
        }
        return -1;
    };

    queueParticleDef(opts) {
        this.queue.push(opts);
    };

    //
    // Predefined types of particles
    //
    fire(x, y, z) {
        this.queueParticleDef({
            size: 0.5,
            type: "smoke",
            r: 200 + get_rand() * 55 | 0,
            g: get_rand() * 180 | 0,
            b: get_rand() * 200 | 0,
            x: x,
            y: y,
            z: z,
            life: get_rand() * 1,
            power: 0.01,
            gravity: 0,
            bounces: 0,
            mass: 10,
            fx_: 0.5,
            fz_: 0.5,
            vx: 0.5 - get_rand() * 1,
            vy: get_rand(),
            vz: 0.5 - get_rand() * 1
        });
    };

    explosion(x: number, y: number, z: number, power: number, type) {
        var c = 0;
        for (var i = 0; i < power * 10; i++) {
            c = 50 + get_rand() * 205 | 0;
            // Add smoke
            this.queueParticleDef({
                size: 0.5,
                type: "smoke",
                x: x + 2 - get_rand() * 4,
                y: y,
                z: z + 2 - get_rand() * 4,
                r: c,
                g: c,
                b: c,
                life: get_rand() * 3,
                power: get_rand() * 5,
                gravity: -0.5,
                bounces: 0,
                mass: 10,
                fx_: 0.1,
                fz_: 0.1,
                vx: get_rand(),
                vy: get_rand() * 2,
                vz: get_rand()
            });
            // add fire
            this.queueParticleDef({
                size: 0.5,
                type: "smoke",
                r: 200 + get_rand() * 55 | 0,
                g: 180,
                b: get_rand() * 50 | 0,
                x: x + 2 - get_rand() * 4,
                y: y,
                z: z + 2 - get_rand() * 4,
                life: get_rand() * 3,
                power: 5 + get_rand() * 5,
                gravity: 5,
                bounces: 0,
                mass: 10,
                fx_: 0.5,
                fz_: 0.5,
                vx: 3 - get_rand() * 6,
                vy: get_rand() * 8,
                vz: 3 - get_rand() * 6
            });
        }
        // var p = game.p_light.clone();
        // p.position.set(x, y, z);
        // p.visible = true;
        // p.intensity = 4;
        // p.distance = 10;
        // game.scene.add(p);
        // game.particles.lights.push(p);
    };



    chunkDebris(x, y, z, chunk, dirx, diry, dirz, power) {
        var vx, vy, vz, fx, fz;
        fz = get_rand(); //0.3;//+power/50;
        fx = get_rand(); // 0.3;//+power/50;
        vx = dirx + (1 - get_rand() * 2);
        vy = diry + get_rand() * 4;
        vz = dirz + (1 - get_rand() * 2);
        let type = "chunk_debris";
        //   if(chunk.current_blocks > 0) {
        //       mass = 1/(chunk.current_blocks*0.01); 
        //       console.log(mass);
        //   }
        //   if(mass > 1) { 
        //       mass = 1;
        //   }

        this.queueParticleDef({
            chunk: chunk,
            chunk_mesh: chunk.mesh,
            size: chunk.blockSize,
            type: type,
            x: x,
            y: y,
            z: z,
            life: 5,
            power: (1 + get_rand() * 5),
            gravity: 9.82,
            bounces: 2 + get_rand() * 2 | 0,
            mass: 1,
            fx_: fx,
            fz_: fz,
            vx: vx,
            vy: vy,
            vz: vz
        });
        //   console.log("C:",chunk.current_blocks, "M:",mass, "VX:",vx, "VY:",vy*mass, "VZ:",vz, "FX:",fx, "FZ:",fz);
    };

    // Shell from a gun
    empty_shell(x, y, z, mesh) {
        var vx, vy, vz, fx, fz;
        vx = get_rand();
        vy = get_rand();
        vz = get_rand();
        fx = 0.2 + get_rand();
        fz = 0.2 + get_rand();
        this.queueParticleDef({
            chunk_mesh: mesh,
            type: "empty_shell",
            size: 1,
            x: x,
            y: y,
            z: z,
            life: 2,
            power: 0.1,
            gravity: 9.82,
            bounces: 3,
            mass: 1,
            fx_: fx,
            fz_: fz,
            vx: vx,
            vy: vy,
            vz: vz
        });
        mesh.visible = true;
    };

    // Radioactive splats
    radioactive_splat(x, y, z, size, dirx, diry, dirz) {
        this.queueParticleDef({
            type: "radioactive_splat",
            r: get_rand() * 50 | 0,
            g: 200 + get_rand() * 100 | 0,
            b: 50 + get_rand() * 55 | 0,
            size: size,
            x: x,
            y: y,
            z: z,
            life: get_rand() * 20,
            power: 2 + get_rand() * 2,
            gravity: get_rand() * 2,
            bounces: 0,
            mass: 10,
            fx_: 1.5 - Math.random() * 3,
            fz_: 1.5 - Math.random() * 3,
            vx: 0.5 - get_rand() * 2,
            vy: 0.5 + get_rand() * 2,
            vz: 0.5 - get_rand() * 2
        });
    };

    // Radioactive leaks
    radioactive_leak(x, y, z, size) {
        this.queueParticleDef({
            type: "radioactive_leak",
            r: get_rand() * 50 | 0,
            g: 200 + get_rand() * 55 | 0,
            b: 50 + get_rand() * 55 | 0,
            size: size,
            x: x,
            y: y,
            z: z,
            life: get_rand() * 3,
            power: 2 + get_rand() * 2,
            gravity: 9.82,
            bounces: 0,
            mass: 10,
            fx: 0.2 + (0.5 - get_rand() * 1),
            fz: 0.2 + (0.5 - get_rand() * 1),
            vx: 1 - Math.random() * 2,
            vy: get_rand() * 2.5,
            vz: 1 - Math.random() * 2,
        });
    };

    // Blood
    blood(x, y, z, size, dirx, diry, dirz) {
        this.queueParticleDef({
            type: "blood",
            size: size,
            x: x,
            y: y,
            z: z,
            life: get_rand() * 3,
            power: 3 + get_rand() * 3,
            gravity: 9.82,
            r: 138,
            g: get_rand() * 15 | 0,
            b: get_rand() * 15 | 0,
            bounces: 2,
            mass: 10,
            fx: 0.2 + (0.5 - get_rand() * 1),
            fz: 0.2 + (0.5 - get_rand() * 1),
            vx: dirx + (0.5 - get_rand() * 1),
            vy: diry + get_rand(),
            vz: dirz + (0.5 - get_rand() * 1)
        });
    };

    // World debris (with smoke and fire)
    world_debris(x, y, z, size, r, g, b) {
        this.queueParticleDef({
            type: "world_debris",
            size: size,
            x: x,
            y: y,
            z: z,
            life: get_rand() * 4,
            power: 5 + get_rand() * 5,
            gravity: 9.82,
            r: r,
            g: g,
            b: b,
            bounces: 2 + get_rand() * 2 | 0,
            mass: 10,
            fx_: 0.5 - Math.random(),
            fz_: 0.5 - Math.random(),
            vx: 2 - get_rand() * 4,
            vy: 3 + get_rand() * 4,
            vz: 2 - get_rand() * 4
        });
    };


    // Debris 
    debris(x, y, z, size, r, g, b, virtual, dirx, diry, dirz, stay) {
        if (stay == null) { stay = true; }
        var vx, vy, vz, fx, fz;
        var type;
        var gravity = 9.82;
        if (dirx != null) {
            vx = dirx;
            vy = diry + get_rand() * 4;
            vz = dirz;
            fx = 0.2;
            fz = 0.2;
        } else {
            if (virtual) {
                vx = 2 - Math.random() * 4;
                vy = 2 + Math.random() * 4;
                vz = 2 - Math.random() * 4;
                gravity = 12;
            } else {
                vx = 2 - get_rand() * 4;
                vy = 2 + get_rand() * 4;
                vz = 2 - get_rand() * 4;
            }
            fz = 0.4;
            fx = 0.4;
        }
        if (virtual) {
            type = "virtual_debris";
        } else {
            type = "debris";
            y += 2;
        }
        var bounces = 0;
        var life = 0;
        if (!stay) {
            bounces = 0;
            life = 0.8;
        } else {
            bounces = 2 + get_rand() * 2 | 0;
            life = get_rand() * 4;
        }
        this.queueParticleDef({
            stay: stay,
            type: type,
            size: size,
            x: x,
            y: y,
            z: z,
            life: life,
            power: 5 + get_rand() * 5,
            gravity: gravity,
            r: r,
            g: g,
            b: b,
            bounces: bounces,
            mass: 10,
            fx_: fx,
            fz_: fz,
            vx: vx,
            vy: vy,
            vz: vz
        });
    };

    // rain() {
    //     var rand1 = Math.random() * game.map.width;
    //     var rand2 = Math.random() * game.map.height;
    //     this.queueParticleDef({
    //         type: "rain",
    //         size: 0.5,
    //         x: rand1,
    //         y: 200,
    //         z: rand2,
    //         life: get_rand() * 15,
    //         power: 0,
    //         gravity: 5.82,
    //         r: 79,
    //         g: 213,
    //         b: 214,
    //         fx_: 0,
    //         fz_: 0,
    //         vx: 0.1,
    //         vy: 0.1,
    //         vz: 0.1,
    //     });
    // };

    // snow() {
    //     var rand1 = Math.random() * game.map.width;
    //     var rand2 = Math.random() * game.map.height;
    //     this.queueParticleDef({
    //         type: "snow",
    //         size: 0.8,
    //         x: rand1,
    //         y: 150,
    //         z: rand2,
    //         life: get_rand() * 25,
    //         power: 0,
    //         gravity: 0.8,
    //         r: 255,
    //         g: 245,
    //         b: 255,
    //         fx_: 0,
    //         fz_: 0,
    //         vx: 0.1,
    //         vy: 0.2,
    //         vz: 0.1,
    //     });
    // };

    walkSmoke(x, y, z) {
        var rand = -2 + get_rand() * 4;
        var rand_c = get_rand() * 100 | 0;
        this.queueParticleDef({
            size: 1,
            x: x + rand,
            y: y - 3,
            z: z + rand,
            life: get_rand(),
            power: 0.1,
            gravity: 0,
            r: 155 + rand_c,
            g: 155 + rand_c,
            b: 155 + rand_c,
            fx_: 0,
            fz_: 0,
            vx: 0.5,
            vy: 0.5,
            vz: 0.5,
        });
    };

    portalMagic(x, y, z) {
        var r = 0;
        var g = 0;
        var b = 0;
        if (get_rand() > 0.5) {
            r = get_rand() * 50 | 0;
            g = 100 + get_rand() * 100 | 0;
            b = 200 + get_rand() * 55 | 0;
        } else {
            r = 200 + get_rand() * 55 | 0;
            g = 0;
            b = 200 + get_rand() * 55 | 0;
        }
        this.queueParticleDef({
            size: 0.5,
            x: 3 - get_rand() * 6 + x,
            y: 3 - get_rand() * 6 + y,
            z: 3 - get_rand() * 6 + z,
            life: get_rand() * 1.3,
            power: 0.5,
            gravity: -2,
            r: r,
            g: g,
            b: b,
        });
    };

    radiation(x, y, z) {
        this.queueParticleDef({
            size: 0.3,
            x: 3 - get_rand() * 6 + x,
            y: 3 - get_rand() * 6 + y,
            z: 3 - get_rand() * 6 + z,
            life: get_rand() * 1.3,
            power: 0.5,
            gravity: -1,
            r: get_rand() * 50 | 0,
            g: 200 + get_rand() * 100 | 0,
            b: 50 + get_rand() * 55 | 0,
        });
    };

    blueMagic(x, y, z) {
        this.queueParticleDef({
            size: 0.5,
            x: 3 - get_rand() * 6 + x,
            y: 3 - get_rand() * 6 + y,
            z: 3 - get_rand() * 6 + z,
            life: get_rand() * 1.3,
            power: 0.5,
            gravity: -2,
            r: get_rand() * 50 | 0,
            g: 100 + get_rand() * 100 | 0,
            b: 200 + get_rand() * 55 | 0,
        });
    };

    debris_smoke(x, y, z, size) {
        // random black/white + fire
        var r, g, b;
        var v = get_rand();
        if (v < 0.3) {
            r = 200 + get_rand() * 55;
            g = 150 + get_rand() * 80;
            b = 20 + get_rand() * 20;
            // white 
            //          r = g = b = 200+get_rand()*55;
        } else if (v < 0.6) {
            // black
            //            r = g = b = 0+get_rand()*50;

            r = 200 + get_rand() * 55;
            g = 80 + get_rand() * 80;
            b = 20 + get_rand() * 20;
        } else {
            r = 150 + get_rand() * 105;
            g = 80 + get_rand() * 80;
            b = 20 + get_rand() * 20;
        }
        this.queueParticleDef({
            size: size,
            x: x,
            y: y,
            z: z,
            life: get_rand() * 0.5,
            power: 0.5,
            gravity: -2,
            r: r,
            g: g,
            b: b,
        });
    };

    smoke(x, y, z, size) {
        this.queueParticleDef({
            size: size,
            x: x,
            y: y,
            z: z,
            life: get_rand(),
            power: 0.5,
            gravity: -2,
            r: 255,
            g: 255,
            b: 255,
        });
    };

    gunSmoke(x, y, z, dirx, diry, dirz) {
        var rand_c = get_rand() * 100 | 0;
        this.queueParticleDef({
            size: 0.5,
            x: x + (2 - get_rand() * 4),
            y: y,
            z: z + (2 - get_rand() * 4),
            life: get_rand() * 1,
            power: 5.5,
            gravity: get_rand() * 6,
            r: 200 + rand_c,
            g: 100 + rand_c,
            b: 0,
            fx_: 0.1,
            fz_: 0.1,
            vx: get_rand() + dirx,
            vy: get_rand() + diry,
            vz: get_rand() + dirz,
        });
    };

    //
    // Different types of ammo
    //
    ammoGrenadeLauncher(x, y, z, dirx, diry, dirz, speed, dmg) {
        this.queueParticleDef({
            damage: dmg,
            type: 'grenade',
            size: 1,
            x: x,
            y: y,
            z: z,
            life: 4 + get_rand() * 2,
            gravity: 9.82,
            bounces: get_rand() * 3 | 0,
            power: 2,
            fx_: 1.2,
            fz_: 1.2,
            vx: dirx,
            vz: dirz,
            vy: diry + (0.6 - get_rand() * 1) + 5,
            light: false,
        });
    };

    ammoMissile(x, y, z, dirx, diry, dirz, owner, chunk, speed, dmg) {
        var p = this.queueParticleDef({
            damage: dmg,
            owner: owner,
            type: 'missile',
            size: 1,
            x: x,
            y: y,
            z: z,
            life: 2,
            gravity: 2,
            power: 6,
            fx_: 2.4 + speed,
            fz_: 2.4 + speed,
            vx: dirx + (0.1 - get_rand() * 0.2),
            vz: dirz + (0.1 - get_rand() * 0.2),
            vy: diry + (0.1 - get_rand() * 0.2),
            light: false,
        });
    };

    // Ammo for shotgun
    ammoShell(x, y, z, dirx, diry, dirz, owner, speed, dmg) {
        let shots: any[] = [];
        for (var i = 0; i < 10; i++) {
            shots.push(this.queueParticleDef({
                damage: dmg,
                owner: owner,
                type: 'shell',
                size: 0.5,
                r: 200,
                g: 200,
                b: 200,
                x: x,
                y: y,
                z: z,
                life: 0.7,
                gravity: 0,
                power: 6,
                fx_: 2.4 + speed,
                fz_: 2.4 + speed,
                vx: dirx + (1 - get_rand() * 2),
                vz: dirz + (1 - get_rand() * 2),
                vy: diry,
            }));
        }
    };

    // Ammo for Sniper
    ammoSniper(x, y, z, dirx, diry, dirz, owner, speed, dmg) {
        this.queueParticleDef({
            damage: dmg,
            owner: owner,
            type: 'shell',
            size: 0.5,
            r: 250,
            g: 250,
            b: 250,
            x: x,
            y: y,
            z: z,
            life: 1.5,
            gravity: 0,
            power: 10,
            fx_: 4.4 + speed,
            fz_: 4.4 + speed,
            vx: dirx,
            vz: dirz,
            vy: diry,
        });
    };

    // Ammo for p90
    ammoP90(x, y, z, dirx, diry, dirz, owner, speed, dmg) {
        this.queueParticleDef({
            damage: dmg,
            owner: owner,
            type: 'shell',
            size: 0.2,
            r: 200,
            g: 200,
            b: 200,
            x: x,
            y: y,
            z: z,
            life: 0.7,
            gravity: 0,
            power: 7,
            fx_: 2.4 + speed,
            fz_: 2.4 + speed,
            vx: dirx + (0.1 - get_rand() * 0.2),
            vz: dirz + (0.1 - get_rand() * 0.2),
            vy: diry,
        });
    };

    // Ammo for minigun
    ammoMinigun(x, y, z, dirx, diry, dirz, owner, speed, dmg) {
        this.queueParticleDef({
            damage: dmg,
            owner: owner,
            type: 'minigun',
            size: 0.5,
            r: 200,
            g: 200,
            b: 200,
            x: x,
            y: y,
            z: z,
            life: 1,
            gravity: 0,
            power: 2,
            fx_: 2.4 + speed,
            fz_: 2.4 + speed,
            vx: dirx + (0.5 - get_rand()),
            vz: dirz + (0.5 - get_rand()),
            vy: diry + (0.5 - get_rand()),
            light: false,
        });
    };

    // Ammo for ak47
    ammoAk47(x, y, z, dirx, diry, dirz, owner, speed, dmg) {
        this.queueParticleDef({
            damage: dmg,
            owner: owner,
            type: 'shell',
            size: 0.4,
            r: 200,
            g: 200,
            b: 200,
            x: x,
            y: y,
            z: z,
            life: 1,
            gravity: 0,
            power: 6,
            fx_: 2.4 + speed,
            fz_: 2.4 + speed,
            vx: dirx + (0.1 - get_rand() * 0.2),
            vz: dirz + (0.1 - get_rand() * 0.2),
            vy: diry,
        });
    };
}

export class Particle {
    public type = "regular";
    public chunk!: any;
    public light = false;
    public owner: any;

    public life = 0;
    public active = 0;
    public mesh: Sprite | Mesh | undefined;
    public chunk_mesh: any;
    public gravity = 9.82;
    public e = -0.3; // restitution
    public mass = 0.1; // kg
    public airDensity = 1.2;
    public area = 0.001;
    public avg_ay = 0;
    public power = 0;

    public vy = 0;
    public vx = 0;
    public vz = 0;
    public avg_ax = 0;
    public avg_az = 0;

    public bounces = 0;
    public bounces_orig = 0;
    public fx_ = 0;
    public fz_ = 0;
    public ray = undefined;

    // Allocate once and reuse.
    public new_ay = 0;
    public new_ax = 0;
    public new_az = 0;
    public fx = 0;
    public fy = 0;
    public fz = 0;
    public dx = 0;
    public dy = 0;
    public dz = 0;
    public newPos = 0;
    public ticks = 0;
    public flip = 0.5;
    public grav_mass = 0;
    public air_area = 0;

    public r = 0;
    public g = 0;
    public b = 0;
    public damage = 0;
    public old_mesh: Sprite | Mesh | undefined;
    public spin = 1;

    public hit = false;
    public size = 1;
    public stay = true;

    set(opts) {
        // if (!this.isVisible(new Vector3(opts.x, opts.y, opts.z))) {
        //     return;
        // }
        for (var k in opts) {
            this[k] = opts[k];
        }
        this.grav_mass = this.gravity * this.mass;
        this.air_area = -0.5 * this.airDensity * this.area;

        if (this.type != "chunk_debris" && this.type != "empty_shell") {
            //this.mesh!.material.color.setRGB(opts.r / 255, opts.g / 255, opts.b / 255);
            //this.mesh!.material.needsUpdate = true;
            this.mesh!.position.set(opts.x, opts.y, opts.z);
            this.mesh!.visible = true;
            this.mesh!.scale.set(this.size, this.size, this.size);
        } else {
            this.old_mesh = this.mesh;
            this.mesh!.visible = false;
            // game.scene.remove(this.mesh);
            this.mesh = this.chunk_mesh;
            //            game.scene.add(this.mesh);
            this.mesh!.visible = true;
            this.mesh!.position.set(this.vx, this.vy, this.vz);
        }
        // if (this.light) {
        //     var p = game.p_light.clone();
        //     p.visible = true;
        //     p.intensity = 15;
        //     p.distance = 30;
        //     this.mesh.add(p);
        //     game.particles.lights.push(p);
        //     // var light = game.p_light.clone();
        //     // this.mesh.add(light);
        //     // TBD: Handle this better w/o setTimeout
        //     //setTimeout(function () { p.mesh.remove(light); }, p.life * 500);
        // }
        this.active = 1;
    };

    reset() {
        if (this.type == "chunk_debris" || this.type == "empty_shell") {
            this.mesh = this.old_mesh;
            this.mesh!.visible = true;
            //            game.scene.add(this.mesh);
        }
        this.mesh!.visible = false;
        this.type = "regular";
        this.life = 0;
        this.active = 0;
        this.gravity = 9.82;
        this.e = -0.3; // restitution
        this.mass = 0.1; // kg
        this.airDensity = 1.2;
        this.area = 1 / 1000;
        this.vy = 0;
        this.avg_ay = 0;
        this.size = 1;

        this.vx = 0;
        this.vz = 0;
        this.avg_ax = 0;
        this.avg_az = 0;

        this.spin = 1;

        this.bounces = 0;
        this.bounces_orig = (1 + get_rand() * 2) | 0;
        this.fx_ = get_rand() * 2;
        this.fz_ = get_rand() * 2;

        this.newPos = 0;
        this.ticks = 0;
        // this.flip = 0.5;

        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.chunk = null;
        this.light = false;
        this.hit = false;
        this.stay = true;
    };

    init(scene: Scene, mesh: Sprite | Mesh) {
        this.mesh = mesh;
        scene.add(this.mesh);

        this.mesh.visible = false;
        this.mesh.castShadow = false;
    };

    checkLife() {
        if (this.life <= 0 || this.mesh!.position.y < 0) {
            this.active = 0;
            this.mesh!.visible = false;
            return;
        }
    };

    // isVisible(pos) {
    //     if (game.player != undefined) {
    //         if (pos.distanceTo(game.player.chunk.mesh.position) > game.visible_distance) {
    //             return false;
    //         }
    //     }
    //     return true;
    // };

    update(time, delta) {
        this.life -= delta;
        this.checkLife();

        if (this.life > 0 && this.active) { // || this.mesh.position.y < -5) {
            this.fy = this.grav_mass;
            // this.fx = this.grav_mass * this.flip;
            // this.fz = this.fx;
            //if (this.flip > 0) {
            //    this.flip = -0.5;
            //} else {
            //    this.flip = 0.5;
            //}

            //this.fy += this.air_area * this.vy * this.vy;
            //this.fx += this.air_area * this.vx * this.vx;
            //this.fz += this.air_area * this.vz * this.vz;
            this.fy += this.air_area * this.vy * this.vy;
            this.fx = this.air_area * this.vx * this.vx;
            this.fz = this.air_area * this.vz * this.vz;

            this.dy = this.vy * delta + (this.avg_ay * 0.0005);
            this.dx = this.vx * delta + (this.avg_ax * 0.0005);
            this.dz = this.vz * delta + (this.avg_az * 0.0005);

            // 10
            this.mesh!.position.x += this.dx * 10 * this.fx_;
            this.mesh!.position.z += this.dz * 10 * this.fz_;
            this.mesh!.position.y += this.dy * 10;

            this.new_ay = this.fy / this.mass;
            this.avg_ay = 0.5 * (this.new_ay + this.avg_ay);
            this.vy -= this.avg_ay * delta;

            this.new_ax = this.fx / this.mass;
            this.avg_ax = 0.5 * (this.new_ax + this.avg_ax);
            this.vx -= this.avg_ax * delta;

            this.new_az = this.fz / this.mass;
            this.avg_az = 0.5 * (this.new_az + this.avg_az);
            this.vz -= this.avg_az * delta;


            switch (this.type) {
                case "debris":
                    this.mesh!.rotation.set(this.vx, this.vy, this.vz);
                    //this.bounce();
                    break;
                case "chunk_debris":
                    this.mesh!.rotation.set(
                        this.vx / this.spin,
                        this.vy / this.spin,
                        this.vz / this.spin
                    );
                    break;
                case "snow":
                    this.mesh!.position.z += get_rand() * Math.cos(time / 5);
                    this.mesh!.position.x += get_rand() * Math.cos(time / 5);
                    break;
                case "rain":
                    if (get_rand() > 0.5) {
                        //this.splatterRain();
                    }
                    break;
            }

            // rotate box particles to make them look more "alive".
            //if (this.particle_type == 1) {
            this.mesh!.rotation.set(this.vx, this.vy, this.vz);
            //}
        }

        if (!this.active) {
            this.reset();
        }
    };

    // bounce() {
    //     if (this.bounces > 0 && this.mesh!.position.y <= game.maps_ground + 1) {
    //         this.mesh.position.y += this.bounces;
    //         this.bounces--;
    //         this.vy *= this.e;
    //         this.spin++;
    //         return true;
    //     }
    //     return false;
    // };


    //    splatterRain(time?, delta?) {
    //        if (game.chunkScene.checkExists(this.mesh.position.clone()).length != 0) {
    //            game.particles.debris(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z, 0.2, this.r, this.g, this.b, false, null, null, null, false);
    //            game.particles.debris(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z, 0.2, this.r, this.g, this.b, false, null, null, null, false);
    //            this.active = 0;
    //        }
    //    };
}
