import { Textures } from "./textures";
import { Camera, Clock, Fog, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster, Scene, SpriteMaterial, Vector3, WebGLRenderer } from "three";
import { MapEditor } from "./mapeditor";
import { KeyBinder } from "../ui/keybinder";
import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { ICameraLayer } from "./icameracontrol";
import { IGameMap } from "./igamemap";
import { gameState } from "../world/igamestate";

export type CameraLayerProps = UiLayerProps & {
    scale: number;
    onOpenTerminal: () => void;
    onToggleEdit: () => void;
    onToggleTile: () => void;
}

export class CameraLayer extends UiLayer2<CameraLayerProps> implements ICameraLayer {
    public renderer!: WebGLRenderer;
    public camera!: Camera;
    public scene!: Scene;
    public clock!: Clock;
    private input!: KeyBinder;

    //public particles!: ParticlePool;
    //public particles_box!: ParticlePool;
    public t_start = Date.now();
    public map!: IGameMap;
    public mapEditor!: MapEditor;

    public update_objects: any = [];
    public player: any;
    public visible_distance = 500; // from player to hide chunks + enemies.
    public textures = new Textures();
    public ff_objects = [];
    private selected: Object3D | undefined;
    private isDown: boolean = false;

    // Particle stuff.
    public box_material = new MeshPhongMaterial({ color: 0xffffff });
    public sprite_material = new SpriteMaterial({ color: 0xffffff });
    public chunk_material = new MeshPhongMaterial({ vertexColors: true, wireframe: false });
    public p_light = new PointLight(0xFFAA00, 1, 10);

    public maps_ground = 6;

    public constructor(props: CameraLayerProps) {
        super(props, (() => {
            let dd = document.createElement('div');
            dd.id = props.id;
            dd.className = 'gameCanvas';
            dd.style.visibility = (props.visible) ? 'visible' : 'hidden';
            dd.setAttribute('tabindex', '0');
            return dd;
        })());

        this.scene = new Scene();
        this.clock = new Clock();

        this.input = new KeyBinder(this.element, () => { });

        // Iosmetric view
        Object3D.DefaultUp = new Vector3(0, 0, 1);
        this.createCamera(window.innerWidth / 10, window.innerHeight / 10);

        //  this.scene.fog = new FogExp2( 0xFFA1C1, 0.0059 );
        this.scene.fog = new Fog(0x000000, 240, this.visible_distance);

        this.renderer = new WebGLRenderer({ antialias: false });
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.element.appendChild(this.renderer.domElement);

        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        // Wait for all resources to be loaded before loading map.
        this.textures.prepare();
        //this.waitForLoadTextures();

        gameState.mapLoaded.add(this, (val: boolean) => {
            this.loadMap();
        });

        setTimeout(() => this.loadMap());
    };

    public refresh() {

    }

    private createCamera(w: number, h: number) {
        /*
        let viewSize = h;
        let aspectRatio = w / h;

        let viewport = {
            viewSize: viewSize,
            aspectRatio: aspectRatio,
            left: (-aspectRatio * viewSize) / 2,
            right: (aspectRatio * viewSize) / 2,
            top: viewSize / 2,
            bottom: -viewSize / 2,
            near: -100,
            far: 10
        }

        this.camera = new OrthographicCamera(
            viewport.left,
            viewport.right,
            viewport.top,
            viewport.bottom,
            viewport.near,
            viewport.far
        );
*/
        this.camera = new PerspectiveCamera(35, w / h, 1, this.visible_distance);
        this.camera.up.set(0, 0, 1);

        var point = new Vector3(0, 0, -1);
        this.camera.lookAt(point);
        let angleY = Math.PI / 4;
        this.camera.rotation.y = angleY;
        //game.camera.rotation.x = -Math.PI / 1.4;
        this.camera.position.set(100 + 100 * Math.tan(angleY), 100, 100);
        //game.camera.position.y = 120;
        (this.camera as PerspectiveCamera).updateProjectionMatrix();
    }

    private loadMap() {

        if (gameState.map === undefined || this.map !== undefined) {
            return;
        }

        this.map = gameState.map;
        this.map.loadScene(this.scene);

        this.mapEditor = new MapEditor(
            { w: this.props.w, h: this.props.h },
            this.scene,
            this.camera,
            this.input,
            this.map);

        const geometry = new PlaneGeometry(1000, 1000);
        //geometry.rotateX(- Math.PI / 2);

        let plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
        this.scene.add(plane);

        this.render();
    }

    reset() {
        this.camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, this.visible_distance);
        this.player.reset();
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
        //this.camera.aspect = window.innerWidth / window.innerHeight;
        //this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    animate() {
        //      requestAnimationFrame( this.animate.bind(this) );
        //      this.render();
    };

    addObject(obj) {
        this.update_objects.push(obj);
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

        //this.map?.update(time, delta);
        this.renderer.render(this.scene, this.camera);
    };
}

