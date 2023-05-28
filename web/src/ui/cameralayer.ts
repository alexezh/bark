import { Textures } from "../voxel/textures";
import { Camera, Clock, Fog, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PCFSoftShadowMap, PerspectiveCamera, PlaneGeometry, PointLight, Raycaster, Scene, SpriteMaterial, Vector3, WebGLRenderer } from "three";
import { LevelEditor } from "./leveleditor";
import { KeyBinder, makeMEvent } from "./keybinder";
import { UiLayer2, UiLayerProps } from "./uilayer";
import { WorldCoord3 } from "../voxel/pos3";
import { ICameraLayer } from "../engine/icameralayer";
import { vm } from "../engine/ivm";
import { VRButton } from "./vrbutton";
import { IVoxelLevel } from "./ivoxelmap";
import SyncEventSource from "../lib/synceventsource";
import { ILevelEditor } from "./ileveleditor";
import { PxSize } from "../lib/pos";
import { ITrackingCamera, Sprite3, TrackingCameraKind } from "../engine/sprite3";
//import { VRButton } from 'three/addons/webxr/VRButton';

export type CameraLayerProps = UiLayerProps & {
    scale: number;
}

class DirectCamera implements ITrackingCamera {
    private camera!: PerspectiveCamera;
    private cameraGroup!: Group;

    public constructor(camera: PerspectiveCamera, cameraGroup: Group) {
        this.camera = camera;
        this.cameraGroup = cameraGroup;

        //var point = new Vector3(0, 0, 0);
        //ßthis.camera.lookAt(point);
        let angleZ = Math.PI / 4;

        //this.cameraGroup.position.set(0, 0, 0);
        this.cameraGroup.rotation.set(-angleZ, 0, 0);
        this.cameraGroup.position.set(100, 200, 100 + 100 * Math.tan(angleZ));
        (this.camera as PerspectiveCamera).updateProjectionMatrix();
    }

    get cemraKind(): TrackingCameraKind { return TrackingCameraKind.Direct; }

    dispose() {
    }

    onTargetMove(pos: Vector3): void {
    }

    onTargetSpeed(pos: Vector3): void {
    }
}

class ThirtPersonCamera implements ITrackingCamera {
    private camera!: PerspectiveCamera;
    private cameraGroup!: Group;
    private sprite: Sprite3;
    private cameraOffset: Vector3;

    public constructor(sprite: Sprite3, cameraOffset: Vector3, camera: PerspectiveCamera, cameraGroup: Group) {
        this.camera = camera;
        this.cameraGroup = cameraGroup;
        this.sprite = sprite;
        this.cameraOffset = cameraOffset;
        this.sprite = sprite;

        this.updateCameraPos(this.sprite.position);
        this.sprite.setTrackingCamera(this);
    }

    get cemraKind(): TrackingCameraKind { return TrackingCameraKind.ThirdPerson; }

    dispose() {
        this.sprite.setTrackingCamera(undefined);
    }

    onTargetMove(pos: Vector3): void {
        this.updateCameraPos(pos);
    }

    onTargetSpeed(speed: Vector3): void {
    }

    private updateCameraPos(pos: Vector3) {
        let cpos = pos.clone();
        cpos.add(this.cameraOffset);
        console.log('move: ' + cpos.x + ':' + cpos.z);
        this.cameraGroup.position.copy(cpos);
        this.cameraGroup.rotation.x = 0;
        (this.camera as PerspectiveCamera).updateProjectionMatrix();
    }

}

export class CameraLayer extends UiLayer2<CameraLayerProps> implements ICameraLayer {
    public renderer!: WebGLRenderer;
    public camera!: PerspectiveCamera;
    public cameraGroup!: Group;
    public scene!: Scene;
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
        vm.registerLevelLoaded(this, this.onLevelLoaded.bind(this));
    };

    public get canvas(): HTMLDivElement { return this.element as HTMLDivElement; }
    public get position(): Vector3 { return this.cameraGroup.position }
    public set position(pos: Vector3) { this.cameraGroup.position.copy(pos); }
    public get viewSize(): PxSize { return { w: this.props.w, h: this.props.h } }

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

    private createCamera(w: number, h: number) {
        this.camera = new PerspectiveCamera(70, w / h, 1, this.visible_distance);
        //this.camera.up.set(0, 0, 1);
        this.camera.layers.enable(1);

        this.cameraGroup = new Group();
        this.cameraGroup.add(this.camera);

        this.trackingCamera = new DirectCamera(this.camera, this.cameraGroup);

        this.scene.add(this.cameraGroup);
    }

    /**
     * called by VM when new level loaded
     */
    private onLevelLoaded() {

        if (vm.level === undefined) {
            return;
        }

        let wsz = vm.level.worldSize;
        console.log(`onLevelLoaded: world size ${wsz.sx} ${wsz.sy} ${wsz.sz}`);

        // add geometry covering map on the bottom so we can handle all clicks within map
        const geometry = new PlaneGeometry(wsz.sx, wsz.sz);

        // y is vertical, rotate around x to make it horizontal
        geometry.rotateX(- Math.PI / 2);

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
        this.levelEditor?.onMouseDown(evt);
        return true;
    }

    public onMouseUp(htmlEvt: MouseEvent): boolean {
        let evt = makeMEvent(htmlEvt, undefined, this.props.scale);
        this.levelEditor?.onMouseUp(evt);
        return true;
    }

    private animate() {
        //      requestAnimationFrame( this.animate.bind(this) );
        //      this.render();
    };


    render() {
        //requestAnimationFrame(this.render.bind(this));

        vm.onRenderFrame();
        this.renderer.render(this.scene, this.camera);
    };
}

