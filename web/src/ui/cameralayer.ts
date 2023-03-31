import { Textures } from "../voxel/textures";
import { Camera, Clock, Fog, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster, Scene, SpriteMaterial, Vector3, WebGLRenderer } from "three";
import { LevelEditor } from "./mapeditor";
import { KeyBinder, makeMEvent } from "./keybinder";
import { UiLayer2, UiLayerProps } from "./uilayer";
import { WorldCoord3 } from "../voxel/pos3";
import { ICamera } from "../engine/icamera";
import { vm } from "../engine/ivm";
import { VRButton } from "./vrbutton";
import { IVoxelLevel } from "./ivoxelmap";
import SyncEventSource from "../lib/synceventsource";
//import { VRButton } from 'three/addons/webxr/VRButton';

export type CameraLayerProps = UiLayerProps & {
    scale: number;
}

export class CameraLayer extends UiLayer2<CameraLayerProps> implements ICamera {
    public renderer!: WebGLRenderer;
    public camera!: Camera;
    public cameraGroup!: Group;
    public scene!: Scene;
    //private input!: KeyBinder;

    public t_start = Date.now();
    public map!: IVoxelLevel;
    public mapEditor!: LevelEditor;

    public visible_distance = 500; // from player to hide chunks + enemies.
    private selected: Object3D | undefined;
    private isDown: boolean = false;
    private vrButton!: VRButton;
    private xrSessionChangedSource = new SyncEventSource<XRSession | undefined>();

    // Particle stuff.
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

        //this.input = new KeyBinder(this.element, () => { });

        // Iosmetric view
        //Object3D.DefaultUp = new Vector3(0, 0, 1);
        this.createCamera(this.props.w / 10, this.props.h / 10);

        //  this.scene.fog = new FogExp2( 0xFFA1C1, 0.0059 );
        this.scene.fog = new Fog(0x000000, 240, this.visible_distance);

        this.renderer = new WebGLRenderer({ antialias: false });
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(this.props.w, this.props.h);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.xr.enabled = true;
        this.renderer.xr.setReferenceSpaceType('local');
        //this.renderer.xr.cameraAutoUpdate = false;
        //this.renderer.xr.updateCamera(this.camera as PerspectiveCamera);

        this.element.appendChild(this.renderer.domElement);

        this.vrButton = new VRButton(this.renderer, (x) => {
            this.xrSessionChangedSource.invoke(x);
        });
        this.element.appendChild(this.vrButton.element);

        let controller1 = this.renderer.xr.getController(0);
        controller1.userData.id = 0;
        this.scene.add(controller1);

        let controller2 = this.renderer.xr.getController(1);
        controller2.userData.id = 1;
        this.scene.add(controller2);

        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        vm.attachCamera(this);
        vm.registerMapChanged(this, this.onMapChanged.bind(this));

        //setTimeout(() => this.loadMap());
    };

    public get canvas(): HTMLDivElement { return this.element as HTMLDivElement; }
    public get position(): Vector3 { return this.camera.position }
    public set position(pos: Vector3) { this.camera.position.copy(pos); }

    public scrollBy(delta: WorldCoord3) {
        this.camera.position.add(new Vector3(delta.x, delta.y, delta.z));
    }

    public registerXrSessionHandler(target: any, func: (session: XRSession | undefined) => void): void {
        this.xrSessionChangedSource.add(target, func);
        if (this.vrButton.currentSession !== null) {
            this.xrSessionChangedSource.invoke(this.vrButton.currentSession);
        }
    }

    private createCamera(w: number, h: number) {
        this.camera = new PerspectiveCamera(70, w / h, 1, this.visible_distance);
        //this.camera.up.set(0, 0, 1);
        this.camera.layers.enable(1);

        var point = new Vector3(0, 0, 0);
        this.camera.lookAt(point);
        let angleZ = Math.PI / 4;

        this.cameraGroup = new Group();
        this.cameraGroup.add(this.camera);

        //game.camera.rotation.x = -Math.PI / 1.4;
        this.cameraGroup.rotation.x = -angleZ;
        this.cameraGroup.position.set(100, 200, 100 + 100 * Math.tan(angleZ));
        //game.camera.position.y = 120;
        (this.camera as PerspectiveCamera).updateProjectionMatrix();

        this.scene.add(this.cameraGroup);
    }

    private onMapChanged() {

        if (vm.level === undefined || this.map !== undefined) {
            return;
        }

        this.map = vm.level;

        /*
        this.mapEditor = new MapEditor(
            this,
            { w: this.props.w, h: this.props.h },
            this.scene,
            this.camera,
            this.input,
            this.map);
*/

        // add geometry covering map on the bottom so we can handle all clicks within map
        const geometry = new PlaneGeometry(1000, 1000);

        let plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));
        this.scene.add(plane);

        this.renderer.setAnimationLoop(this.render.bind(this));

        this.render();
    }

    reset() {
    };

    public onWindowResize() {
        (this.camera as PerspectiveCamera).aspect = window.innerWidth / window.innerHeight;
        (this.camera as PerspectiveCamera).updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    public onMouseDown(htmlEvt: MouseEvent): boolean {
        let evt = makeMEvent(htmlEvt, undefined, this.props.scale);
        this.mapEditor?.onMouseDown(evt);
        return true;
    }

    public onMouseUp(htmlEvt: MouseEvent): boolean {
        let evt = makeMEvent(htmlEvt, undefined, this.props.scale);
        this.mapEditor?.onMouseUp(evt);
        return true;
    }

    private animate() {
        //      requestAnimationFrame( this.animate.bind(this) );
        //      this.render();
    };


    render() {
        //requestAnimationFrame(this.render.bind(this));

        vm.onRender();
        this.renderer.render(this.scene, this.camera);
    };
}

