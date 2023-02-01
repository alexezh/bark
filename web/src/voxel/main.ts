import { ModelLoader } from "./model_loader";
import { SoundLoader } from "./sound";
import { Textures } from "./textures";
import { ChunkScene } from "./chunkscene";
import { Ammo, AmmoP90, AmmoSniper, Heart, Obj, Shell } from "./objects";
import { MapD } from "./map";
import { ParticlePool } from "./particles";
import { Camera, Clock, Fog, GridHelper, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster, Scene, SpriteMaterial, Vector3, WebGLRenderer } from "three";
import { OrbitControls } from 'three-orbitcontrols-ts';

//if (!Detector.webgl) Detector.addGetWebGLMessage();
//////////////////////////////////////////////////////////////////////
// Main class - Where the magic happens
//////////////////////////////////////////////////////////////////////
export class Main {
    public renderer!: WebGLRenderer;
    public controls: any;
    public camera!: PerspectiveCamera;
    public scene!: Scene;
    public stats: any;
    public clock!: Clock;
    public light1: any;
    public particles!: ParticlePool;
    public particles_box!: ParticlePool;
    public t_start = Date.now();
    public modelLoader = new ModelLoader();
    public map!: MapD;
    public chunkScene = new ChunkScene();
    public update_objects: any = [];
    public cdList: any = [];
    public player: any;
    public visible_distance = 250; // from player to hide chunks + enemies.
    public textures = new Textures();
    public objects: Obj[] = [];
    public ff_objects = [];
    public sounds = new SoundLoader();
    public container: HTMLElement | undefined;
    private selected: Object3D | undefined;
    private isDown: boolean = false;

    // Particle stuff.
    public box_material = new MeshPhongMaterial({ color: 0xffffff });
    public sprite_material = new SpriteMaterial({ color: 0xffffff });
    public chunk_material = new MeshPhongMaterial({ vertexColors: true, wireframe: false });
    public p_light = new PointLight(0xFFAA00, 1, 10);

    public maps_ground = 6;

    public createChunkMaterial(): Material {
        return new MeshPhongMaterial({ vertexColors: true, wireframe: false });
    }

    init(container: HTMLElement) {
        this.container = container;
        container.setAttribute('tabindex', '0');

        this.sounds.Add({ name: "sniper", file: "assets/sounds/sniper.wav.mp3" });
        this.sounds.Add({ name: "take_heart", file: "assets/sounds/heart.wav.mp3" });
        this.sounds.Add({ name: "walk1", file: "assets/sounds/walk1.wav.mp3" });
        this.sounds.Add({ name: "blood1", file: "assets/sounds/blood1.wav.mp3" });
        this.sounds.Add({ name: "blood2", file: "assets/sounds/blood2.wav.mp3" });
        this.sounds.Add({ name: "blood3", file: "assets/sounds/blood3.wav.mp3" });
        this.sounds.Add({ name: "rocket", file: "assets/sounds/rocket_shoot.wav.mp3" });
        this.sounds.Add({ name: "rocket_explode", file: "assets/sounds/rocket_explode.wav.mp3" });
        this.sounds.Add({ name: "ak47", file: "assets/sounds/ak47.wav.mp3" });
        this.sounds.Add({ name: "p90", file: "assets/sounds/p90.wav.mp3" });
        this.sounds.Add({ name: "pistol", file: "assets/sounds/pistol.mp3" });
        this.sounds.Add({ name: "grenadelauncher", file: "assets/sounds/grenadelauncher.mp3" });
        this.sounds.Add({ name: "shotgun", file: "assets/sounds/shotgun_shoot.wav.mp3" });
        this.sounds.Add({ name: "shotgun_reload", file: "assets/sounds/shotgun_reload.wav.mp3" });
        this.sounds.Add({ name: "minigun", file: "assets/sounds/gunshot1.wav.mp3" });
        this.sounds.Add({ name: "fall", file: "assets/sounds/fall.wav.mp3" });
        this.sounds.Add({ name: "fall2", file: "assets/sounds/scream.wav.mp3" });
        this.sounds.Add({ name: "footsteps", file: "assets/sounds/footsteps.wav.mp3" });
        this.sounds.Add({ name: "heartbeat", file: "assets/sounds/heartbeat.wav.mp3" });
        this.sounds.Add({ name: "painkillers", file: "assets/sounds/painkillers.wav.mp3" });
        this.sounds.Add({ name: "ambient_horror", file: "assets/sounds/ambient_horror.wav.mp3" });
        this.sounds.Add({ name: "ambient_street", file: "assets/sounds/ambient_street.mp3" });
        this.sounds.Add({ name: "hit1", file: "assets/sounds/hit1.wav.mp3" });
        this.sounds.Add({ name: "hit2", file: "assets/sounds/hit2.wav.mp3" });
        this.sounds.Add({ name: "hunt1", file: "assets/sounds/kill_you.wav.mp3" });
        this.sounds.Add({ name: "hunt2", file: "assets/sounds/take_him.wav.mp3" });
        this.sounds.Add({ name: "ammo_fall", file: "assets/sounds/ammo_fall.wav.mp3" });
        this.sounds.Add({ name: "reload", file: "assets/sounds/reload.wav.mp3" });
        this.sounds.Add({ name: "bullet_wall", file: "assets/sounds/bullet_wall.mp3" });
        this.sounds.Add({ name: "bullet_metal", file: "assets/sounds/bullet_metal.mp3" });
        // this.sounds.Add({name: "haha1", file: "assets/sounds/haha.wav.mp3"});
        // this.sounds.Add({name: "haha2", file: "assets/sounds/haha2.wav.mp3"});
        // this.sounds.Add({name: "haha3", file: "assets/sounds/haha3.wav.mp3"});
        //
        //var loader = new TextureLoader();
        //var that = this;
        //loader.load(
        //    'assets/textures/bump.png',
        //    function (texture) {
        //        //texture.anisotropy = 4;
        //        //texture.repeat.set(0.998, 0.998);
        //        //texture.offset.set(0.001, 0.001);
        //        //texture.wrapS = texture.wrapT = RepeatWrapping;
        //        //texture.format = RGBFormat;
        //        that.bump_map = new MeshPhongMaterial({ map: texture,specularMap: texture, vertexColors: VertexColors, wireframe: false });
        //    }
        //);
        this.scene = new Scene();
        this.clock = new Clock();

        // Iosmetric view
        this.camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, this.visible_distance);
        // this.camera.applyMatrix( new Matrix4().makeTranslation( 300, 150, 300 ) );
        // this.camera.applyMatrix( new Matrix4().makeRotationX( -0.8 ) );
        this.camera.up.set(0, 1, 0);
        Object3D.DefaultUp = new Vector3(0, 1, 0);

        //this.camera.position.set( 200, 300, 700 ); 

        //  this.scene.fog = new FogExp2( 0xFFA1C1, 0.0059 );
        //this.scene.fog = new Fog( 0xFFA1C1, 180, this.visible_distance );
        this.scene.fog = new Fog(0x000000, 180, this.visible_distance);

        this.renderer = new WebGLRenderer({ antialias: false });
        //   console.log(window.devicePixelRatio);
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.renderer.setClearColor(0xFFA1C1, 1);
        //  this.renderer.setClearColor(0xFFA1C1, 1);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);
        //this.stats = new Stats();
        //container.appendChild(this.stats.dom);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.target.set(0, 1, 0);
        controls.update();

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        //window.addEventListener('mousedown', this.onMouseDown.bind(this), false);
        //window.addEventListener('mouseup', this.onMouseUp.bind(this), false);
        //window.addEventListener('mousemove', this.onMouseMove.bind(this), false);

        // Load models
        //this.modelLoader.init();
        //this.modelLoader.loadFiles();

        // Init world.
        //this.chunkScene.init(this.scene);


        // Init particle engine
        //this.particles = new ParticlePool(2000, 0);
        //this.particles_box = new ParticlePool(1000, 1);

        // DEBUG STUFF
        //var gridHelper = new GridHelper(5000, 100);
        //gridHelper.position.set(0, 0, 0);
        //game.scene.add(gridHelper);

        // Wait for all resources to be loaded before loading map.
        this.textures.prepare();
        //this.waitForLoadTextures();

        setTimeout(async () => {
            await this.loadMap();
        });
    };


    private async loadMap(): Promise<boolean> {
        this.map = new MapD();
        await this.map.init();

        const geometry = new PlaneGeometry(1000, 1000);
        geometry.rotateX(- Math.PI / 2);

        let plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
        this.scene.add(plane);

        var point = new Vector3(0, 0, 0);
        game.camera.lookAt(point);
        //game.camera.rotation.y = Math.PI;
        //game.camera.rotation.x = -Math.PI / 1.4;
        game.camera.position.z = 150;
        //game.camera.position.y = -120;

        this.render();

        return true;
    }

    waitForLoadTextures() {
        if (!game.textures.isLoaded()) {
            setTimeout(function () {
                console.log("waiting for load of textures...");
                game.waitForLoadTextures();
            }, 100);
        } else {
            game.waitForLoadMap();
        }
    };

    waitForLoadMap() {
        if (game.modelLoader.files.length > 0) {
            setTimeout(function () {
                console.log("waiting for load of files...");
                game.waitForLoadMap();
            }, 500);
        } else {
            //game.maps.init("Level 1", "assets/maps/map3_ground.png", "assets/maps/map3_objects.png");
            // Load objects here to reduce overhead of multiple objects of same type.
            this.objects["shell"] = new Shell();
            this.objects["shell"].create();
            this.objects["ammo"] = new Ammo();
            this.objects["ammo"].create();
            this.objects["ammo_p90"] = new AmmoP90();
            this.objects["ammo_p90"].create();
            this.objects["ammo_sniper"] = new AmmoSniper();
            this.objects["ammo_sniper"].create();
            this.objects["heart"] = new Heart();
            this.objects["heart"].create();

            this.render();
        }
    };

    reset() {
        this.camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, this.visible_distance);
        this.chunkScene.reset();
        this.player.reset();
        this.cdList = [];
        for (var i = 0; i < this.update_objects.length; i++) {
            if (this.update_objects[i].chunk) {
                this.scene.remove(this.update_objects[i].chunk.mesh);
            }
        }
        this.update_objects = [];
        // @ts-ignore
        this.maps.init();
    };

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);

    };

    onMouseDown(evt: MouseEvent) {
        this.isDown = true;
        return;

        let coords = {
            x: (evt.clientX / window.innerWidth) * 2 - 1,
            y: -(evt.clientY / window.innerHeight) * 2 + 1
        }

        let raycaster = new Raycaster();
        raycaster.setFromCamera(coords, this.camera);

        var intersects = raycaster.intersectObjects(this.scene.children, false);

        if (intersects.length > 0) {
            var object = intersects[0].object;
            // @ts-ignore
            object.material.color.set(Math.random() * 0xffffff);
            this.selected = object;
            //object.geometry.setAttribute('color', Math.random() * 0xffffff);
        }
    };

    onMouseUp(evt: MouseEvent) {
        this.isDown = false;
        /*
        let coords = {
            x: (evt.clientX / window.innerWidth) * 2 - 1,
            y: -(evt.clientY / window.innerHeight) * 2 + 1
        }

        let raycaster = new Raycaster();
        raycaster.setFromCamera(coords, this.camera);

        var intersects = raycaster.intersectObjects(this.scene.children, false);

        if (intersects.length > 0) {
            var object = intersects[0].object;
            // @ts-ignore
            object.material.color.set(Math.random() * 0xffffff);
            this.selected = object;
            //object.geometry.setAttribute('color', Math.random() * 0xffffff);
        }
        */
    };

    onMouseMove(evt: MouseEvent) {
        if (this.isDown === false) {
            return;
        }

        return;
        /*
                if (this.selected === undefined) {
                    return;
                }
        
                let coords = {
                    x: (evt.clientX / window.innerWidth) * 2 - 1,
                    y: -(evt.clientY / window.innerHeight) * 2 + 1
                }
        
                let raycaster = new Raycaster();
                raycaster.setFromCamera(coords, this.camera);
        
                var intersects = raycaster.intersectObjects(this.scene.children, false);
        
                if (intersects.length > 0) {
                    let intersect = intersects[0];
        
                    this.selected.position.copy(intersect.point).add(intersect!.face!.normal);
                    this.selected.position.divideScalar(16).floor().multiplyScalar(16).addScalar(8);
                    //object.geometry.setAttribute('color', Math.random() * 0xffffff);
                }
               */
    };

    animate() {
        //      requestAnimationFrame( this.animate.bind(this) );
        //      this.render();
    };

    addObject(obj) {
        this.update_objects.push(obj);
    };

    addToCD(obj) {
        if (obj.owner == null || obj.owner == "") {
            var err = new Error();
            console.log(err.stack);
        }
        if (obj != undefined) {
            this.cdList.push(obj);
        }
    };

    spliceCDList(index) {
        var len = this.cdList.length;
        if (!len) { return; }
        while (index < len) {
            this.cdList[index] = this.cdList[index + 1];
            index++
        }
        this.cdList.length--;
    };

    removeFromCD(obj) {
        for (var i = 0; i < this.cdList.length; i++) {
            // if(this.cdList[i] == null) { continue; }
            if (this.cdList[i] != undefined) {
                if (this.cdList[i].id == obj.id) {
                    //this.cdList.splice(i, 1);
                    this.spliceCDList(i);
                    //this.cdList[i].r ;
                    return;
                }
            }
        }
    };

    render() {
        requestAnimationFrame(this.render.bind(this));

        var time = (Date.now() - this.t_start) * 0.001;
        //var time = Date.now() * 0.00005;
        var delta = this.clock.getDelta();

        // Update all objects
        for (var f in this.update_objects) {
            if (this.update_objects[f] == null) { continue; }
            if (this.update_objects[f].update) {
                this.update_objects[f].update(time, delta);
            } else {
                this.update_objects[f] = null;
            }
        }

        for (var f in this.objects) {
            this.objects[f].update(time, delta);
        }

        //this.controls.update(delta);

        // this.stats.update();
        //this.particles.update(time, delta);
        //this.particles_box.update(time, delta);
        this.chunkScene.update(time, delta);
        //this.maps.update(time, delta);
        this.map?.update(time, delta);
        this.renderer.render(this.scene, this.camera);
    };
}

export let game: Main;

export function createVoxelGame(container: HTMLElement) {
    game = new Main();
    game.init(container)
}