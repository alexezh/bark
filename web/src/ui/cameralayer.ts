import { Fog, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Scene, Vector3, WebGLRenderer } from "three";
import { makeMEvent } from "./keybinder";
import { UiLayer2, UiLayerProps } from "./uilayer";
import { ICameraLayer } from "../engine/icameralayer";
import { vm } from "../engine/ivm";
import { VRButton } from "./vrbutton";
import SyncEventSource from "../lib/synceventsource";
import { ILevelEditor } from "./ileveleditor";
import { PxSize } from "../lib/pos";
import { ITrackingCamera, Sprite3, TrackingCameraKind } from "../engine/sprite3";
import { ThirtPersonCamera } from "../engine/thirdpersoncamera";
import { DirectCamera } from "../engine/directcamera";
//import { VRButton } from 'three/addons/webxr/VRButton';

export type CameraLayerProps = UiLayerProps & {
    scale: number;
}

export class CameraLayer extends UiLayer2<CameraLayerProps> implements ICameraLayer {
    public renderer!: WebGLRenderer;
    public camera!: PerspectiveCamera;
    public cameraGroup!: Group;
    public scene: Scene | undefined;
    //private input!: KeyBinder;

    public t_start = Date.now();
    public levelEditor: ILevelEditor | undefined;

    public visible_distance = 500; // from player to hide chunks + enemies.
    private selected: Object3D | undefined;
    private isDown: boolean = false;
    private vrButton!: VRButton;
    private xrSessionChangedSource = new SyncEventSource<XRSession | undefined>();
    private trackingCamera: ITrackingCamera | undefined;

    // Particle stuff.
    public chunk_material = new MeshPhongMaterial({ vertexColors: true, wireframe: false });
    public p_light = new PointLight(0xFFAA00, 1, 10);

    public get scale(): number { return this.props.scale }

    public constructor(props: CameraLayerProps) {
        super(props, (() => {
            let dd = document.createElement('div');
            dd.id = props.id;
            dd.className = 'gameCanvas';
            dd.style.visibility = (props.visible) ? 'visible' : 'hidden';
            dd.setAttribute('tabindex', '0');
            return dd;
        })());

        //this.input = new KeyBinder(this.element, () => { });
        this.element.addEventListener('contextmenu', this.onContextMenu.bind(this));

        // Iosmetric view
        //Object3D.DefaultUp = new Vector3(0, 0, 1);
        this.createCamera(this.props.w / 10, this.props.h / 10);

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

        this.vrButton = new VRButton(this.renderer, (x) => {
            this.xrSessionChangedSource.invoke(x);
        });
        this.element.appendChild(this.vrButton.element);

        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        vm.attachCamera(this);
        vm.registerLevelLoaded(this, this.onLevelLoaded.bind(this));
    };

    public get canvas(): HTMLDivElement { return this.element as HTMLDivElement; }
    public get position(): Vector3 { return this.cameraGroup.position }
    public set position(pos: Vector3) { this.cameraGroup.position.copy(pos); }
    public get viewSize(): PxSize { return { w: this.props.w, h: this.props.h } }

    public createScene() {
        this.scene = new Scene();

        //  this.scene.fog = new FogExp2( 0xFFA1C1, 0.0059 );
        this.scene.fog = new Fog(0x000000, 240, this.visible_distance);

        this.element.appendChild(this.renderer.domElement);

        // create VR elements
        let controller1 = this.renderer.xr.getController(0);
        controller1.userData.id = 0;
        this.scene.add(controller1);

        let controller2 = this.renderer.xr.getController(1);
        controller2.userData.id = 1;
        this.scene.add(controller2);

        // add camera to group for UI
        this.scene.add(this.cameraGroup);
    }

    public setThirdPersonCamera(sprite: Sprite3, cameraOffset: Vector3): void {
        this.trackingCamera?.dispose();
        this.trackingCamera = undefined;
        this.trackingCamera = new ThirtPersonCamera(sprite, cameraOffset, this.camera, this.cameraGroup);
    }

    public setDirectCamera(): void {
        if (this.trackingCamera instanceof DirectCamera) {
            return;
        }

        this.trackingCamera?.dispose();
        this.trackingCamera = undefined;
        this.trackingCamera = new DirectCamera(this.camera, this.cameraGroup);
    }

    public registerXrSessionHandler(target: any, func: (session: XRSession | undefined) => void): void {
        this.xrSessionChangedSource.add(target, func);
        if (this.vrButton.currentSession !== null) {
            this.xrSessionChangedSource.invoke(this.vrButton.currentSession);
        }
    }

    public setEditor(editor: ILevelEditor | undefined) {
        this.levelEditor = editor;
    }

    private onContextMenu(event: Event) {
        event.preventDefault();
    }

    private createCamera(w: number, h: number) {
        this.camera = new PerspectiveCamera(70, w / h, 1, this.visible_distance);
        //this.camera.up.set(0, 0, 1);
        this.camera.layers.enable(1);

        this.cameraGroup = new Group();
        this.cameraGroup.add(this.camera);

        this.trackingCamera = new DirectCamera(this.camera, this.cameraGroup);
    }

    /**
     * called by VM when new level loaded
     */
    private onLevelLoaded() {
        if (vm.level === undefined) {
            return;
        }

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

    private animate() {
        //      requestAnimationFrame( this.animate.bind(this) );
        //      this.render();
    };


    render() {
        if (!this.scene) {
            return;
        }

        vm.onRenderFrame();
        this.renderer.render(this.scene, this.camera);
    };
}

