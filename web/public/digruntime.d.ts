/// <reference types="webxr" />
export declare var gameApp: GameApp;

export declare class GameApp {
    private gameContainer;
    initializeApp(gameContainer: HTMLDivElement): void;
    private resizeCanvas;
}

export declare class BoxedGame implements IDigGame {
    private char;
    init(): Promise<void>;
    start(): void;
    stop(): void;
    private moveMonkey;
    private dropObject;
}

export declare function getActions(): IAction[];
export declare function registerActions(): void;

export type CommandBarProps = UiLayerProps & {
    termProps: ShellProps;
    mapEditorState: MapEditorState;
};
export declare class CommandList {
    private actions;
    private listDiv;
    private props;
    constructor(props: CommandBarProps);
    updateList(bar: ICommandBar, parent: HTMLElement): void;
    registerAction(action: IAction): void;
    private updateListSize;
}
export declare class CommandBar extends UiLayer2<CommandBarProps> implements ICommandBar {
    private actionButton;
    private _floatieVisible;
    private _floatie;
    private _commandList;
    private _propPane;
    constructor(props: CommandBarProps);
    displayError(text: string): void;
    openDetailsPane(elem: HTMLElement): void;
    closeDetailsPane(): void;
    private onAction;
}

export declare abstract class CommandAction implements IAction {
    abstract get name(): string;
    abstract get tags(): string[];
    private button;
    renderButton(parent: HTMLElement, bar: ICommandBar): void;
    destroyButton(parent: HTMLElement): void;
    protected onClick(bar: ICommandBar): void;
}
export declare class FormPane {
    readonly element: HTMLDivElement;
    private _values;
    get values(): {
        [id: string]: any;
    };
    constructor();
    addTextField(name: string, value: string, setter?: ((val: string) => void) | undefined): void;
    addIntField(name: string, value: number, setter?: ((val: number) => void) | undefined): void;
    addButtom(name: string, action: () => void): void;
}

export declare class CreateProjectAction extends CommandAction {
    get name(): string;
    get tags(): string[];
    protected onClick(bar: ICommandBar): void;
    private createProject;
}
export declare function createDefaultProject(): Promise<void>;
export declare class CreateLevelAction extends CommandAction {
    get name(): string;
    get tags(): string[];
    protected onClick(bar: ICommandBar): void;
    private createLevel;
    static createLevelParams(name: string, sx: number, sz: number): Promise<void>;
}

export declare class SelectBlockAction extends CommandAction {
    get name(): string;
    get tags(): string[];
}
export declare class EditLevelAction extends CommandAction {
    get name(): string;
    get tags(): string[];
    protected onClick(bar: ICommandBar): void;
}
export declare class EditBlockAction extends CommandAction {
    get name(): string;
    get tags(): string[];
    protected onClick(bar: ICommandBar): void;
}
export declare class EditCodeAction extends CommandAction {
    get name(): string;
    get tags(): string[];
    protected onClick(bar: ICommandBar): void;
}
export declare function registerEditActions(actions: IAction[]): void;

export type UploadFile = {
    fn: string;
    vox: Uint8Array;
    png: ImageData;
};
export declare class ImportVoxAction implements IAction {
    private static _nextId;
    private _id;
    private _element;
    private _inputElem;
    get tags(): string[];
    get name(): string;
    constructor();
    renderButton(parent: HTMLElement, bar: ICommandBar): void;
    destroyButton(parent: HTMLElement): void;
    private createImportButton;
    private processImport;
    private loadVox;
    static renderThumbnail(vox: Vox, tr: ThumbnailRenderer, data: ArrayBuffer, fn: string): Promise<ImageData | string | undefined>;
    private displayPane;
    static upload(uploadFiles: UploadFile[]): Promise<WireModelInfo[] | undefined>;
}

export declare class MoveCameraAction implements IAction {
    private button;
    private propPage;
    get name(): string;
    get tags(): string[];
    constructor();
    renderButton(parent: HTMLElement, bar: ICommandBar): void;
    destroyButton(parent: HTMLElement): void;
    private onMoveCameraClick;
}

export interface IAnimatable {
    get id(): number;
    get startTime(): number;
    onStart(frameTime: number): void;
    onComplete(): void;
    animate(frameTime: number): boolean;
}
export declare class Animatable implements IAnimatable {
    private _id;
    private _startTime;
    constructor();
    get id(): number;
    get startTime(): number;
    onStart(frameTime: number): void;
    onComplete(): void;
    animate(elapsed: number): boolean;
}
export declare class LinearAnimator extends Animatable {
    obj: any;
    prop: string;
    delta: number;
    step: number;
    constructor(obj: object, prop: string, delta: number, step: number);
    animate(frameTime: number): boolean;
}
export declare class DiscreteAnimator extends Animatable {
    obj: any;
    prop: string;
    values: number[];
    index: number;
    intervalMs: number;
    lastFrameTimeMs: number;
    constructor(obj: any, prop: string, values: number[], intervalSeconds: number);
    animate(frameTime: number): boolean;
}
export declare class PropertyAnimationManager {
    private animations;
    private nextKey;
    onUpdateScene?: (isDirty: boolean) => void;
    private ticker?;
    private lastTick;
    onInput?: () => void;
    constructor();
    start(ticker: Ticker): void;
    stop(): void;
    animate(anim: IAnimatable): void;
    cancel(anim: IAnimatable): void;
    nextId(): number;
    get hasAnimations(): boolean;
    private processAnimation;
}
export declare var animator: PropertyAnimationManager;

export type BroadphasePair = {
    first: IRigitBody;
    second: IRigitBody;
};
export declare class BroadphaseCollision {
    private xEdges;
    private yEdges;
    private zEdges;
    getPairs(rigitObjects: IRigitBody[]): BroadphasePair[];
}

export declare class FrameClock {
    private _lastTick;
    private _delta;
    private _running;
    get delta(): number;
    get lastTick(): number;
    start(): void;
    stop(): void;
    tick(): 0 | undefined;
}

export type CodeModule = {
    code: string;
    codeObj: any;
    enabled: boolean;
};
export declare class CodeLoader {
    private codeLib;
    private functionLib;
    getCode(id: string): any;
    updateCode(id: string, code: string): void;
    getCodeModule(id: string): CodeModule | undefined;
    loadFunction(id: string, ...args: string[]): boolean;
    invokeFunction<T>(id: string, ...args: any): T;
}
export declare function printCodeException(avatar: string, e: any): void;
export declare let codeLoader: CodeLoader;

export declare class GamePhysics implements IGamePhysics {
    private map;
    private bodies;
    private broadphase;
    private collisionHandler?;
    private input?;
    private _collideHandler;
    private static collideHandlerSymbol;
    constructor(map: IVoxelLevel);
    attachInputController(handler?: IGamePhysicsInputController): void;
    attachCollisionHandler(handler?: IGameCollisionHandler): void;
    addRigitObject(ro: IRigitBody): void;
    setCollideHandler(func: RigitCollisionHandler | undefined): void;
    removeRigitObject(ro: IRigitBody): void;
    update(dt: number): void;
}

export type WireSpawnCharacterRequest = {
    name: string;
    skinUrl: string;
};
export type WireAvatarMove = {
    id: string;
    currentPos: GridPos;
    newPos: GridPos;
};
export declare enum RtcConnectionStatus {
    pending = 0,
    connected = 1,
    error = 2
}
export type RtcUpdateAvatarPosition = {
    worldId: string;
    avatarId: string;
    newPos: GridPos | undefined;
    oldPos: GridPos | undefined;
};
export declare class RealtimeClient implements IRealtimeClient {
    private sessionId?;
    private connection?;
    private connectionStatus;
    constructor();
    load(): Promise<boolean>;
    spawnCharacter(name: string, skinUrl: string): void;
    private connectSignalR;
    private onUpdateAvatarPositionRtc;
}

export interface ICamera {
    get scene(): Scene;
    get camera(): PerspectiveCamera;
    get canvas(): HTMLDivElement;
    get viewSize(): PxSize;
    get position(): Vector3;
    set position(pos: Vector3);
    scrollBy(pxSize: WorldCoord3): void;
    registerXrSessionHandler(target: any, func: (session: XRSession | undefined) => void): void;
    setEditor(editor: ILevelEditor | undefined): any;
}

export interface IDigGame {
    init(): Promise<void>;
    start(): void;
    stop(): void;
}

export type CreateMoveAnimation = (sprite: Sprite3, pos: Vector3) => IAnimatable;
export interface IGamePhysicsInputController {
}
export type RigitCollisionHandler = (target: IRigitBody[]) => void;
export interface IGamePhysics {
    addRigitObject(ro: IRigitBody, onCollide: RigitCollisionHandler | undefined): void;
    removeRigitObject(ro: IRigitBody): void;
    update(tick: number): void;
    attachInputController(handler?: IGamePhysicsInputController): any;
    setCollideHandler(func: RigitCollisionHandler | undefined): any;
}
export interface IGameCollisionHandler {
}

export interface IRealtimeClient {
}

export interface IRigitModel {
    get size(): Vector3;
    load(uri: string, animations: VoxelAnimationCollection | undefined): Promise<void>;
    animate(id: string): any;
    addToScene(scene: Scene): any;
    removeFromScene(scene: Scene): any;
    setPosition(pos: Vector3): void;
    setDirection(pos: Vector3): void;
    update(): void;
    onRenderFrame(tick: number): any;
}

export interface IInputController {
    start(): any;
    stop(): any;
    onXrSessionChanged(session: XRSession | undefined): any;
    update(tick: number): any;
    readInput<T>(): Promise<T>;
}
export interface IVM {
    get level(): IVoxelLevel;
    get physics(): IGamePhysics;
    get canvas(): HTMLElement;
    get clock(): FrameClock;
    get levelFile(): IVoxelLevelFile;
    get camera(): ICamera;
    attachCamera(camera: ICamera): void;
    registerLevelLoaded(target: any, func: () => void): void;
    setController(controller: IInputController): any;
    loadProject(id: string): Promise<IDigProject>;
    loadLevel(id: string): Promise<void>;
    editLevel(): any;
    start(): Promise<void>;
    stop(): void;
    onRenderFrame(): void;
    createSprite<T extends Sprite3>(AT: {
        new (...args: any[]): T;
    }, uri: string, pos: Vector3, rm: IRigitModel | undefined, ac: VoxelAnimationCollection | undefined): Promise<T>;
    removeSprite(sprite: Sprite3): any;
    forever(func: () => Promise<void>): Promise<void>;
    readInput(): Promise<any>;
    waitCollide(sprite: Sprite3[], timeout: number): Promise<Sprite3>;
    createExplosion(pos: Vector3): void;
    sleep(ms: number): Promise<void>;
    send(msg: string): Promise<void>;
    onStart(func: () => Promise<void>): any;
    onMessage(func: () => Promise<void>): any;
}
export declare let vm: IVM;
export declare function setVM(val: IVM): void;

export declare class MapLayer {
    private size;
    private blockSize;
    private blocks;
    private _mesh;
    private geometry;
    private material;
    dirty: boolean;
    readonly layerY: number;
    get staticMesh(): Mesh;
    constructor(material: MeshPhongMaterial, layerZ: number, blockSize: number);
    load(): void;
    fill(tile: VoxelModel): void;
    build(): void;
    findBlock(point: Vector3): MapBlockCoord | undefined;
    deleteBlock(block: MapBlockCoord): void;
    deleteBlockByCoord(x: number, z: number): void;
    getBlock(xMap: number, zMap: number): MapBlockCoord | undefined;
    addBlock(pos: BlockPos3, block: VoxelModel): void;
}

export interface IMoveEvent2D {
    get speedX(): number;
    get speedZ(): number;
}
export type MoveControllerConfig = {
    keySpeedX: number;
    keySpeedZ: number;
    thumbSpeedX: number;
    thumbSpeedZ: number;
    timeoutSeconds: number;
};
export declare class MoveController2D implements IGamePhysicsInputController, IInputController {
    private input;
    private xrSession;
    private gamePads;
    private config;
    private lastTick;
    private timeoutMilliseconds;
    private started;
    constructor(config: MoveControllerConfig);
    onXrSessionChanged(session: XRSession | undefined): void;
    start(): void;
    stop(): void;
    private onXrInputChanged;
    readInput(): Promise<any>;
    update(tick: number): void;
    private attachGamepad;
}

export declare class Sprite3 implements IRigitBody {
    private static _nextId;
    private _id;
    owner: any;
    rigit: IRigitModel;
    private _inactive;
    private _speed;
    private _position;
    collision: IRigitBody | undefined;
    get id(): number;
    get inactive(): boolean;
    get kind(): RigitBodyKind;
    get speed(): Vector3;
    get position(): Vector3;
    get size(): Vector3;
    constructor(pos: Vector3, size: Vector3, rigit?: IRigitModel);
    load(uri: string, animations: VoxelAnimationCollection | undefined): Promise<void>;
    animate(id: string): void;
    addToScene(scene: Scene): void;
    removeFromScene(scene: Scene): void;
    onRender(tick: number): void;
    setPosition(pos: Vector3): void;
    setSpeed(speed: Vector3): void;
    onMove(pos: Vector3): void;
    setCollision(obj: IRigitBody | undefined): void;
}

export declare class Ticker {
    private inTick;
    private static tickerSymbol;
    private handlers;
    private updates;
    tick(): void;
    add(target: any, func: () => void): void;
    remove(target: any): void;
    private applyUpdates;
}

export type MessageHandler = (msg: string) => Promise<void>;
export type StartHandler = () => Promise<void>;
export declare class VM implements IVM {
    private _running;
    private _ticker;
    private _physics;
    private _canvas;
    private _level?;
    private _levelFile?;
    private _camera?;
    private _game?;
    private readonly _createDefaultProject;
    private readonly _sprites;
    private readonly _collisions;
    readonly clock: FrameClock;
    private inputController;
    private levelEditor;
    private readonly onLevelLoaded;
    private readonly _startHandlers;
    particles: ParticlePool;
    private _messageHandlers;
    get physics(): IGamePhysics;
    get level(): IVoxelLevel;
    get levelFile(): IVoxelLevelFile;
    constructor(canvas: HTMLElement, createDefaultProject: () => Promise<void>);
    get canvas(): HTMLElement;
    get camera(): ICamera;
    attachCamera(camera: ICamera): void;
    registerLevelLoaded(target: any, func: (val: boolean) => void): void;
    setController(controller: IInputController): IInputController;
    loadProject(id: string): Promise<IDigGame>;
    loadLevel(id: string): Promise<void>;
    start(): Promise<void>;
    stop(): void;
    editLevel(): void;
    onRenderFrame(): void;
    createSprite<T extends Sprite3>(AT: {
        new (...args: any[]): T;
    }, uri: string, pos: Vector3, rm?: IRigitModel | undefined, animations?: VoxelAnimationCollection | undefined): Promise<T>;
    removeSprite(sprite: Sprite3): Promise<void>;
    forever(func: () => Promise<void>): Promise<void>;
    readInput(): Promise<any>;
    waitCollide(sprites: Sprite3[], seconds: number): Promise<Sprite3>;
    createExplosion(pos: Vector3): void;
    sleep(seconds: number): Promise<void>;
    send(msg: string): Promise<void>;
    onStart(func: () => Promise<void>): void;
    onMessage(func: () => Promise<void>): void;
    onCollide(ros: IRigitBody[]): void;
    private loadScene;
    private onXrSessionChanged;
}
export declare function createVM(canvas: HTMLElement, createDefaultProject: () => Promise<void>): void;

export declare class MeshModel {
    mesh: Mesh;
    geometry: BufferGeometry;
    material: MeshPhongMaterial;
    constructor(geo: BufferGeometry);
}
export declare class VoxelLevel implements IVoxelLevel {
    private scene;
    objects: any;
    width: number;
    height: number;
    private _blockSize;
    private _file;
    private layers;
    ambient_light: AmbientLight;
    get worldSize(): WorldSize3;
    get blockSize(): BlockSize3;
    get file(): IVoxelLevelFile;
    constructor(file: IVoxelLevelFile);
    onStart(): void;
    onStop(): void;
    update(time: any, delta: any): void;
    load(): Promise<boolean>;
    loadScene(scene: Scene): boolean;
    blockSizeToWorldSize(mapSize: BlockSize3): WorldSize3;
    blockPosToWorldPos(mapPos: BlockPos3): WorldCoord3;
    findBlock(point: Vector3): MapBlockCoord | undefined;
    private deleteBlockCore;
    private deleteBlockByCoord;
    deleteBlock(block: MapBlockCoord): void;
    private addBlockCore;
    addBlock(pos: BlockPos3, block: VoxelModel): void;
    intersectBlocks(ro: IRigitBody, pos: WorldCoord3, func: (target: IRigitBody) => boolean): boolean;
    private onFileChangeBlock;
}

export declare class VoxelLevelFile implements IVoxelLevelFile {
    private _cameraPosition;
    private _cameraLookAt;
    private _cameraRotation;
    private _mapSize;
    private _zStride;
    private _yStride;
    private _blocks;
    private _url;
    private onChangeCamera;
    private onChangeBlock;
    get blocks(): ReadonlyMap<number, FileMapBlock>;
    constructor(url: string);
    load(): Promise<void>;
    static createLevel(url: string): Promise<VoxelLevelFile>;
    get cameraPosition(): Vector3;
    set cameraPosition(value: Vector3);
    get mapSize(): BlockSize3;
    get blockCount(): number;
    registerOnChangeCamera(func: () => void): void;
    registerOnChangeBlock(func: (blocks: FileMapBlock[]) => void): void;
    deleteBlock(block: MapBlockCoord): void;
    addBlock(pos: BlockPos3, blockId: number): void;
    addBlocks(blocks: FileMapBlock[]): void;
    private getBlockKey;
}

export declare class Cube extends Sprite3 {
}

export declare class Mammal4Model implements IRigitModel {
    private meshModels;
    private _size;
    private _dir;
    get size(): Vector3;
    load(uri: string, animations: VoxelAnimationCollection | undefined): Promise<void>;
    animate(id: string): void;
    addToScene(scene: Scene): void;
    removeFromScene(scene: Scene): void;
    onRenderFrame(tick: number): void;
    setPosition(pos: Vector3): void;
    setDirection(dir: Vector3): void;
    update(): void;
}
export declare class Mammal4 extends Sprite3 {
    constructor(pos: Vector3, size: Vector3);
}


export declare class StaticCubeModel implements IRigitModel {
    private meshModel;
    private _size;
    private _position;
    get size(): Vector3;
    load(uri: string, animations: VoxelAnimationCollection | undefined): Promise<void>;
    animate(id: string): void;
    addToScene(scene: Scene): void;
    removeFromScene(scene: Scene): void;
    onRenderFrame(tick: number): void;
    setPosition(pos: Vector3): void;
    setDirection(pos: Vector3): void;
    update(): void;
}

export default class AsyncEventSource<T> {
    private callbackSym;
    private handlers;
    private gaps;
    add(obj: any, func: (val: T) => void): void;
    private invokeWorker;
    invoke(...args: any[]): void;
    invokeWithCompletion(onInvoke: () => void, ...args: any[]): void;
}

export declare var SimplexNoise: (gen: any) => void;

export declare function numberArrayToString(v: number[]): string;

export declare function bytesToBase64(bytes: Uint8ClampedArray | Uint8Array): string;
export declare function base64ToBytes(str: string): Uint8ClampedArray;

export declare function printNetworkError(s: string): void;

export interface IFetchAdapter {
    get(uri: string): Promise<Response>;
    post(uri: string, body: string): Promise<any>;
}
export declare function getSessionId(): string | undefined;
export declare function setSessionId(id: string): void;
export declare function setProjectId(id: string): void;
export declare function getProjectId(): string;
export declare function setFetchAdapter(adapter: IFetchAdapter): void;
export declare function fetchResource(url: string): Promise<ArrayBuffer>;
export type WireString = {
    key: string;
    data: string;
};
export type WireGetStringsRequest = {
    pattern: string | undefined;
    keys: string[];
};
export type WireGetStringsResponse = {
    values: WireString[];
};
export type WireSetArrayRange = {
    key: string;
    pos: number;
    count: number;
    value: string[];
};
export type WireGetArrayRange = {
    key: string;
    pos: number;
    count: number;
};
export type WireCreateProjectRequest = {
    name: string;
};
export type WireCreateProjectResponse = {
    id: string;
};
export type WireLevelInfo = {
    id: string;
    name: string;
    sx: number;
    sy: number;
    sz: number;
};
export type WireProjectConfig = {
    version: number;
};
export declare function wireCreateProject(name: string): Promise<WireCreateProjectResponse>;
export declare function wireGetUserString(key: string): Promise<string | undefined>;
export declare function wireSetUserString(key: string, value: string): Promise<void>;
export declare function wireGetString(key: string): Promise<string | undefined>;
export declare function wireGetObject<T>(key: string): Promise<T | undefined>;
export declare function wireGetStrings(keys: string[]): Promise<WireString[]>;
export declare function wireSetString(key: string, value: string): Promise<void>;
export declare function wireSetStrings(keys: WireString[]): Promise<void>;
export declare function wireSetObject<T>(key: string, value: T): Promise<void>;
export declare function wireSetObjectBackground<T>(key: string, value: T): void;
export type WireDict = {
    field: string;
    value: string;
};
export type WireGetDictRequest = {
    key: string;
    fields: string[] | null | undefined;
};
export type WireGetDictResponse = {
    fields: WireDict[] | null | undefined;
};
export type WireSetDictRequest = {
    key: string;
    fields: WireDict[];
};
export type WireIncrementRequest = {
    count: number;
};
export type WireIncrementResponse = {
    start: number;
    count: number;
};
export declare function wireIncrement(key: string, delta: number): Promise<number | undefined>;
export declare function wireGetDict(key: string, fields: string[] | null | undefined): Promise<WireDict[] | undefined>;
export declare function wireSetDict(key: string, fields: WireDict[]): Promise<void>;
export declare function wireSetDictBackground<T>(key: string, fields: WireDict[]): void;

export declare class FetchAdapterWeb implements IFetchAdapter {
    get(uri: string): Promise<Response>;
    post(uri: string, body: string): Promise<any>;
}

export declare class GameColors {
    static transparent: string;
    static black: string;
    static tileBlock: string;
    static region: string;
    static regionN: number;
    static barButtonBack: string;
    static barButtonSelected: string;
    static wallHidglight: string;
    static buttonFont: '24px serif';
    static readLineFont: '24px serif';
    static material: MeshPhongMaterial;
}

export declare function setElementVisible(elem: HTMLElement | undefined, val: boolean): void;
export declare function setElementDisplay(elem: HTMLElement | undefined, val: boolean): void;
export declare function createTextDiv(): [HTMLDivElement, HTMLSpanElement];
export declare function createButton(parent: HTMLElement, text: string, handler: (evt: any) => any): HTMLButtonElement;
export declare function createCommandButton(parent: HTMLElement, text: string, handler: (evt: any) => any): HTMLButtonElement;
export declare function createTextEntry(parent: HTMLElement, text: string, value: string, handler: ((val: string) => any) | undefined): HTMLDivElement;
export declare function createNumberEntry(parent: HTMLElement, text: string, value: number, handler: ((val: number) => any) | undefined): HTMLDivElement;

export declare function perlinNoise(perilinW: number, perilinH: number, baseX: number, baseY: number, seed: number): Uint8ClampedArray;

export declare function PRNG(): any;

export default class SyncEventSource<T> {
    private callbackSym;
    private handlers;
    private gaps;
    add(obj: any, func: (val: T) => void): void;
    private invokeWorker;
    invoke(...args: any[]): void;
}

export declare const resetColor = "\u001B[0m";
export declare const greenText = "\u001B[1;3;32m";
export declare const redText = "\u001B[1;3;31m";
export declare function decorateCommand(s: string): string;
export declare function decorateSay(s: string): string;

export type PtObj = {
    kind: string;
};
export type PtCall = PtObj & {
    name: object;
    params: object[];
};
export type PtSequence = PtObj & {
    name: object;
    expressions: object[];
};
export declare enum AstNodeKind {
    Sequence = 0,
    Func = 1,
    Param = 2,
    Value = 3
}
export declare class AstNode {
    name: string;
    value: any;
    kind: AstNodeKind;
    children: AstNode[];
    constructor(kind: AstNodeKind, name: string, value: any);
}
export declare function createFuncCall(name: string, args?: any): AstNode;
export declare function intParam(name: string, value: any): AstNode;
export declare function stringParam(name: string, value: any): AstNode;
export declare function formatAst(node: AstNode): string;

export declare enum FuncCategory {
    edit = 0,
    ui = 1,
    help = 2
}
export declare enum ParamType {
    _int = 0,
    _real = 1,
    _string = 2,
    _boolean = 3
}
export declare function paramTypeFromString(s: string): ParamType;
export type ParamDef = {
    name: string;
    t: ParamType;
    optional: boolean;
    default?: any;
};
export declare class FuncDef {
    readonly name: string;
    readonly category: FuncCategory;
    constructor(name: string, category: FuncCategory);
    getParamDefs(): ParamDef[];
    help(): string;
    eval(ast: AstNode): string | undefined;
    parse(parts: string[]): AstNode | string | undefined;
    createAst<T>(x: T): AstNode;
}
export declare class GenericFuncDef extends FuncDef {
    private params;
    constructor(name: string, category: FuncCategory);
    getParamDefs(): ParamDef[];
    protected createParamDefs(): ParamDef[];
    help(): string;
    helpUsage(): string;
    eval(ast: AstNode): string | undefined;
    protected evalCore(params: any): string | undefined;
    createAst<T>(x: T): AstNode;
    private makeParam;
}
export declare function combineParams(a: ParamDef[], b: ParamDef[]): ParamDef[];
export declare function buildFuncAst(ptCall: PtCall): AstNode;

export declare class GenericEditorFuncDef extends GenericFuncDef {
    mapEditorState: MapEditorState;
    constructor(name: string, mapEditorState: MapEditorState);
}
export declare function createCoordinateParams(funcDef: GenericEditorFuncDef): ParamDef[];
export type CoordinateParams = {
    x: number;
    y: number;
    w: number;
    h: number;
};
export declare function coordinateParamsToRect(params: CoordinateParams): {
    x: number;
    y: number;
    w: number;
    h: number;
};

export declare class BindKeyDef extends GenericEditorFuncDef {
    static funcName: string;
    constructor(mapEditorState: MapEditorState);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare class ShowKeyBindingsDef extends GenericEditorFuncDef {
    static funcName: string;
    private keyBindings;
    constructor(mapEditorState: MapEditorState);
    createParamDefs(): ParamDef[];
    help(): string;
    addKeyBinding(key: string, desc: string): void;
    descriptKeyBindings(): string;
    protected evalCore(params: any): string | undefined;
}

export type MapBitmap = {
    w: number;
    h: number;
    data: Uint8ClampedArray;
};
export declare function createMapBitmap(w: number, h: number): MapBitmap;
export declare function updateRect(rect: GridRect, xNew: number, yNew: number): GridRect;
export type MapEditorUpdate = {
    isEditMode?: boolean;
    region?: GridRect;
    scrollSize?: PxSize;
    map?: IVoxelLevel;
};
export declare class MapEditorState {
    private _isEditMode;
    private _region?;
    private _currentLayer?;
    private _scrollSize;
    private _world;
    private eventSource;
    get isEditMode(): boolean;
    get currentLayer(): any | undefined;
    get region(): GridRect | undefined;
    get cameraSize(): PxSize | undefined;
    get world(): any | undefined;
    get currentTileLayer(): any | undefined;
    static unknownLayerError: string;
    constructor();
    onChanged(target: any, func: (evt: MapEditorChangeEvent) => void): void;
    update(val: MapEditorUpdate): void;
}
export declare let mapEditorState: MapEditorState;
export declare function createMapEditorState(): void;

export type GridPos = {
    x: number;
    y: number;
};
export type GridSize = {
    w: number;
    h: number;
};
export type GridRect = {
    x: number;
    y: number;
    w: number;
    h: number;
};
export type PxPos = {
    x: number;
    y: number;
};
export type PxSize = {
    w: number;
    h: number;
};
export type PxRect = {
    x: number;
    y: number;
    w: number;
    h: number;
};
export declare function topLeftPos(rect: GridRect): {
    x: number;
    y: number;
};
export declare function setCellSize(w: number, h: number): void;
export declare function gridPosToPxPos(px: GridPos): PxPos;
export declare function gridPosToPxPosSafe(px: GridPos | undefined): PxPos;
export declare function pxRectToGridRect(px: PxRect): GridRect;
export declare function gridRectToPxRect(px: GridRect): PxRect;
export declare function scaleToGrid(px: GridRect, cw: number, ch: number): GridRect;
export declare function clipRect(rect: GridRect, width: number, height: number): GridRect;
export declare function areRectEqual(r1: GridRect, r2: GridRect): boolean;
export declare function isRectOverlap(r1: GridRect, r2: GridRect): boolean;

export type PoshFunction = {
    params: ParamDef[];
    help: string | undefined;
    (args: any): void;
};
export declare function registerFunction(name: string, args: string[], func: (args: any) => void, help?: string | undefined): void;
export declare function getFunction(name: string): PoshFunction | undefined;
export declare function evalFunction(ast: AstNode): string | undefined;
export declare function printHelp(func: PoshFunction): void;
export declare function printEditModeError(): void;
export declare function printNoRegion(): void;

export interface IRepl {
    getFunc(s: string): FuncDef;
    evalFunc<T>(name: string, x: T): string | undefined;
    onPrint: ((s: string) => void) | undefined;
    evalAst(ast: AstNode, noEcho?: boolean): void;
    getVar(name: string): any | undefined;
    setVar(name: string, value: any | undefined): void;
    onVarChanged(target: any, func: (evt: VarChangedEvent) => void): void;
}
export declare class Repl implements IRepl {
    private readonly funcDefs;
    readonly vars: {
        [id: string]: any;
    };
    onPrint: ((s: string) => void) | undefined;
    private varChangedSource;
    constructor();
    addFunc(funcDef: FuncDef): void;
    getFunc(s: string): FuncDef;
    evalFunc<T>(name: string, x: T): string | undefined;
    getVar(name: string): any | undefined;
    setVar(name: string, value: any | undefined): void;
    evalAst(ast: AstNode, noEcho?: boolean): string | undefined;
    help(filter: string | undefined): string | undefined;
    onVarChanged(target: any, func: (evt: VarChangedEvent) => void): void;
    processLine(s: string): string | undefined;
    private evalAstWorker;
    private buildAst;
    private buildSequenceAst;
    private buildFuncAst;
    private unknownCommand;
}

export type LoginParams = {
    name: string;
};
export declare function login(args: {
    name: string;
}): void;
export declare function logout(): void;
export declare function registerSystemCommands(): void;

export type CameraLayerProps = UiLayerProps & {
    scale: number;
};
export declare class CameraLayer extends UiLayer2<CameraLayerProps> implements ICamera {
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    cameraGroup: Group;
    scene: Scene;
    t_start: number;
    levelEditor: ILevelEditor | undefined;
    visible_distance: number;
    private selected;
    private isDown;
    private vrButton;
    private xrSessionChangedSource;
    chunk_material: MeshPhongMaterial;
    p_light: PointLight;
    maps_ground: number;
    constructor(props: CameraLayerProps);
    get canvas(): HTMLDivElement;
    get position(): Vector3;
    set position(pos: Vector3);
    get viewSize(): PxSize;
    scrollBy(delta: WorldCoord3): void;
    registerXrSessionHandler(target: any, func: (session: XRSession | undefined) => void): void;
    setEditor(editor: ILevelEditor | undefined): void;
    private createCamera;
    private onLevelLoaded;
    reset(): void;
    onWindowResize(): void;
    onMouseDown(htmlEvt: MouseEvent): boolean;
    onMouseUp(htmlEvt: MouseEvent): boolean;
    private animate;
    render(): void;
}

export declare class CodeEditor extends UiLayer2<CodeEditorProps> {
    private flask;
    private onSave;
    private onCancel;
    private saveButton;
    constructor(props: CodeEditorProps);
    load(text: string | null | undefined, onSave: ((text: string) => void) | undefined, onCancel: () => void): void;
    private onMacro;
}

export interface IAction {
    get name(): string;
    get tags(): string[];
    renderButton(parent: HTMLElement, bar: ICommandBar): any;
    destroyButton(parent: HTMLElement): any;
}
export interface ICommandBar {
    displayError(text: string): any;
    openDetailsPane(elem: HTMLElement): void;
    closeDetailsPane(): void;
}

export interface IGameShell {
    login(name: string): void;
    logout(): void;
    refresh(): void;
    printError(s: string): void;
    print(s: string): void;
    printException(e: any): void;
    editFile(text: string | undefined | null, onSave: ((text: string) => void) | undefined): void;
}
export declare let shell: IGameShell;
export declare function setShell(t: IGameShell): void;

export interface ILevelEditor {
    onMouseDown(evt: MEvent): boolean;
    onMouseUp(evt: MEvent): boolean;
    onMouseMove(evt: MEvent): boolean;
}

export type MapProps = {
    id: string;
    gridWidth: number;
    gridHeight: number;
    cellWidth: number;
    cellHeight: number;
    humanStepDuration: number;
};
export type MapBlock = {
    model: VoxelModel;
    frame: number;
    topmost: boolean;
};
export type MapBlockCoord = {
    model: VoxelModel | undefined;
    idx: number;
    mapPos: BlockPos3;
    mapSize: BlockSize3;
};
export type FileMapBlockDef = {
    blockId: number;
    uri: string;
};
export type FileMapBlock = {
    blockId: number;
    x: number;
    y: number;
    z: number;
};
export type WireCamera = {
    xPos: number;
    yPos: number;
    zPos: number;
    xLook: number;
    yLook: number;
    zLook: number;
    xRotation: number;
    yRotation: number;
    zRotation: number;
};
export type WireLevelInfo = {
    xMap: number;
    yMap: number;
    zMap: number;
};
export interface IVoxelLevelFile {
    get cameraPosition(): Vector3;
    set cameraPosition(value: Vector3);
    get mapSize(): BlockSize3;
    get blocks(): ReadonlyMap<number, FileMapBlock>;
    registerOnChangeCamera(func: () => void): any;
    registerOnChangeBlock(func: (blocks: FileMapBlock[]) => void): any;
    load(isTest: boolean): Promise<void>;
    deleteBlock(block: MapBlockCoord): any;
    addBlock(pos: BlockPos3, blockId: number): any;
}
export interface IVoxelLevel {
    get worldSize(): WorldSize3;
    get blockSize(): BlockSize3;
    get file(): IVoxelLevelFile;
    onStart(): any;
    onStop(): any;
    load(): Promise<boolean>;
    loadScene(scene: Scene): any;
    findBlock(point: Vector3): MapBlockCoord | undefined;
    deleteBlock(block: MapBlockCoord): any;
    addBlock(pos: BlockPos3, block: VoxelModel): any;
    blockSizeToWorldSize(gridSize: BlockSize3): WorldSize3;
    blockPosToWorldPos(gridPos: BlockPos3): WorldCoord3;
    intersectBlocks(ro: IRigitBody, pos: WorldCoord3, func: (target: IRigitBody) => boolean): boolean;
}
export declare let defaultMaterial: MeshPhongMaterial;

export declare class MEvent {
    x: number;
    y: number;
    button: number;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    constructor(evt: any, x: number, y: number);
}
export declare function makeMEvent(evt: MouseEvent, offset?: PxPos, scale?: number): MEvent;
export declare class WEvent extends MEvent {
    wheelDeltaX: number;
    wheelDeltaY: number;
    constructor(evt: any, x: number, y: number);
}
export declare class KeyBinder {
    private htmlElem;
    private moveKeys;
    private keyUpHandlers;
    pressedKeys: any;
    private onInput;
    constructor(htmlElem: HTMLElement, onInput?: (() => void) | undefined, attach?: boolean);
    attach(): void;
    detach(): void;
    private onKeyDown;
    private onKeyUp;
    registerKeyUp(key: string, func: () => void, help?: string | undefined): void;
    unregisterKeyUp(key: string): void;
}

export interface IMapEditorHost {
}
export declare class LevelEditor implements ILevelEditor {
    private camera;
    private isDown;
    private level;
    private input;
    static material: LineBasicMaterial;
    private selectedBlock;
    private selection;
    constructor(camera: ICamera, level: IVoxelLevel);
    dispose(): void;
    private onScroll;
    onMouseDown(evt: MEvent): boolean;
    onMouseUp(evt: MEvent): boolean;
    onMouseMove(evt: MEvent): boolean;
    private onCopyBlock;
    private onPasteBlock;
    private pasteBlockWorker;
    private onClearBlock;
    private selectBlockFace;
    private buildSelectionBox;
}

export declare class ShellProps {
    width: number;
    height: number;
    canvasWidth: number;
    canvasHeight: number;
    scale: number;
    scrollX: number;
    scrollY: number;
    commandPaneHeight: number;
    terminalPaneHeightRatio: number;
    uiLayerHeight: number;
    mediumButtonWidth: number;
    mediumButtonHeight: number;
}
export declare class Shell implements IGameShell {
    private map;
    private container;
    camera?: CameraLayer;
    private compositor2;
    private props;
    private barLayer;
    private codeEditor?;
    constructor(gameContainer: HTMLDivElement);
    refresh(): void;
    printError(s: string): void;
    print(s: string): void;
    printException(e: any): void;
    editFile(text: string | null | undefined, onSave: ((text: string) => void) | undefined): void;
    private loginCached;
    login(name: string): void;
    logout(): void;
    private openTextEditor;
    private closeTextEditor;
}

export interface IUiCompositor {
    get size(): PxSize;
}
export declare class UiCompositor2 implements IUiCompositor {
    private container;
    private _size;
    private layerMap;
    get size(): PxSize;
    constructor(container: HTMLDivElement, size: PxSize);
    appendLayer(layer: IUiLayer2): void;
    insertLayerBefore(layer: IUiLayer2, insertBefore: string): void;
    removeLayer(id: string): void;
    getLayer(id: string): IUiLayer2;
}

export type UiLayerProps = {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    visible?: boolean;
};
export interface IUiLayer2 {
    get id(): string;
    get element(): HTMLElement;
    get visible(): boolean;
    set visible(val: boolean);
    focus(): void;
    setCompositor(compositor: IUiCompositor | undefined): void;
}
export declare class UiLayer2<T extends UiLayerProps> implements IUiLayer2 {
    props: T;
    protected _element: HTMLElement;
    private _visible;
    protected _compositor: IUiCompositor | undefined;
    private _onFocusOut?;
    constructor(props: T, element: HTMLElement, attachMouse?: boolean);
    get element(): HTMLElement;
    get id(): string;
    get visible(): boolean;
    set visible(val: boolean);
    focus(): void;
    setCompositor(compositor: IUiCompositor | undefined): void;
    onMouseMove(evt: MouseEvent): boolean;
    onMouseDown(evt: MouseEvent): boolean;
    onMouseUp(evt: MouseEvent): boolean;
    onWheel(evt: WheelEvent): boolean;
    protected updateElementSize(): void;
}

export type TilesetListProps = UiLayerProps & {
    mapEditorState: MapEditorState;
    scale: number;
    scrollY?: number;
};

export declare class VRButton {
    element: HTMLElement;
    private renderer;
    currentSession: XRSession | null;
    xrSessionIsGranted: boolean;
    private sessionChanged;
    constructor(renderer: Renderer, sessionChanged: (xrSession: XRSession | undefined) => void);
    onSessionStarted(session: XRSession): Promise<void>;
    onSessionEnded(): void;
    showEnterVR(): void;
    disableButton(): void;
    showWebXRNotFound(): void;
    private showVRNotAllowed;
    private static stylizeElement;
    registerSessionGrantedListener(): void;
}

export declare class KeyboardState {
    private domElement;
    private keyCodes;
    private modifiers;
    private _onKeyDown;
    private _onKeyUp;
    private _onBlur;
    constructor(domElement: HTMLElement);
    destroy(): void;
    MODIFIERS: string[];
    ALIAS: {
        left: number;
        up: number;
        right: number;
        down: number;
        space: number;
        pageup: number;
        pagedown: number;
        tab: number;
        escape: number;
    };
    _onKeyChange(event: any): void;
    pressed(keyDesc: any): boolean;
    eventMatches(event: any, keyDesc: any): boolean;
}

export declare class MapBlockRigitBody implements IRigitBody {
    private mapBlock;
    private pos;
    constructor(mapBlock: MapBlockCoord, pos: WorldCoord3);
    get id(): number;
    get inactive(): boolean;
    get kind(): RigitBodyKind;
    get owner(): any;
    get speed(): Vector3;
    get position(): Vector3;
    get size(): Vector3;
    get blocks(): MapBlockCoord[];
    setSpeed(speed: Vector3): void;
    onMove(pos: Vector3): void;
    setCollision(obj: IRigitBody): void;
}
export declare class MapBoundaryRigitBody implements IRigitBody {
    private _size;
    private _pos;
    constructor(pos: Vector3, size: Vector3);
    get id(): number;
    get inactive(): boolean;
    get kind(): RigitBodyKind;
    get owner(): any;
    get speed(): Vector3;
    get position(): Vector3;
    get size(): Vector3;
    setSpeed(speed: Vector3): void;
    onMove(pos: Vector3): void;
    setCollision(obj: IRigitBody): void;
}

export declare class ParticlePool {
    particles: Particle[];
    queue: any[];
    size: number;
    pos: number;
    neg: number;
    opts: number;
    update_cnt: number;
    lights: any[];
    box_material: MeshPhongMaterial;
    sprite_material: SpriteMaterial;
    constructor(scene: Scene, size: number, type: number);
    update(time: any, delta: any): void;
    createParticle(opts: any): -1 | Particle;
    queueParticleDef(opts: any): void;
    fire(x: any, y: any, z: any): void;
    explosion(x: number, y: number, z: number, power: number, type: any): void;
    chunkDebris(x: any, y: any, z: any, chunk: any, dirx: any, diry: any, dirz: any, power: any): void;
    empty_shell(x: any, y: any, z: any, mesh: any): void;
    radioactive_splat(x: any, y: any, z: any, size: any, dirx: any, diry: any, dirz: any): void;
    radioactive_leak(x: any, y: any, z: any, size: any): void;
    blood(x: any, y: any, z: any, size: any, dirx: any, diry: any, dirz: any): void;
    world_debris(x: any, y: any, z: any, size: any, r: any, g: any, b: any): void;
    debris(x: any, y: any, z: any, size: any, r: any, g: any, b: any, virtual: any, dirx: any, diry: any, dirz: any, stay: any): void;
    walkSmoke(x: any, y: any, z: any): void;
    portalMagic(x: any, y: any, z: any): void;
    radiation(x: any, y: any, z: any): void;
    blueMagic(x: any, y: any, z: any): void;
    debris_smoke(x: any, y: any, z: any, size: any): void;
    smoke(x: any, y: any, z: any, size: any): void;
    gunSmoke(x: any, y: any, z: any, dirx: any, diry: any, dirz: any): void;
    ammoGrenadeLauncher(x: any, y: any, z: any, dirx: any, diry: any, dirz: any, speed: any, dmg: any): void;
    ammoMissile(x: any, y: any, z: any, dirx: any, diry: any, dirz: any, owner: any, chunk: any, speed: any, dmg: any): void;
    ammoShell(x: any, y: any, z: any, dirx: any, diry: any, dirz: any, owner: any, speed: any, dmg: any): void;
    ammoSniper(x: any, y: any, z: any, dirx: any, diry: any, dirz: any, owner: any, speed: any, dmg: any): void;
    ammoP90(x: any, y: any, z: any, dirx: any, diry: any, dirz: any, owner: any, speed: any, dmg: any): void;
    ammoMinigun(x: any, y: any, z: any, dirx: any, diry: any, dirz: any, owner: any, speed: any, dmg: any): void;
    ammoAk47(x: any, y: any, z: any, dirx: any, diry: any, dirz: any, owner: any, speed: any, dmg: any): void;
}
export declare class Particle {
    type: string;
    chunk: any;
    light: boolean;
    owner: any;
    life: number;
    active: number;
    mesh: Sprite | Mesh | undefined;
    chunk_mesh: any;
    gravity: number;
    e: number;
    mass: number;
    airDensity: number;
    area: number;
    avg_ay: number;
    power: number;
    vy: number;
    vx: number;
    vz: number;
    avg_ax: number;
    avg_az: number;
    bounces: number;
    bounces_orig: number;
    fx_: number;
    fz_: number;
    ray: undefined;
    new_ay: number;
    new_ax: number;
    new_az: number;
    fx: number;
    fy: number;
    fz: number;
    dx: number;
    dy: number;
    dz: number;
    newPos: number;
    ticks: number;
    flip: number;
    grav_mass: number;
    air_area: number;
    r: number;
    g: number;
    b: number;
    damage: number;
    old_mesh: Sprite | Mesh | undefined;
    spin: number;
    hit: boolean;
    size: number;
    stay: boolean;
    set(opts: any): void;
    reset(): void;
    init(scene: Scene, mesh: Sprite | Mesh): void;
    checkLife(): void;
    update(time: any, delta: any): void;
}

export type WorldCoord3 = {
    x: number;
    y: number;
    z: number;
};
export type WorldSize3 = {
    sx: number;
    sy: number;
    sz: number;
};
export type BlockPos3 = {
    x: number;
    y: number;
    z: number;
};
export type BlockSize3 = {
    sx: number;
    sy: number;
    sz: number;
};

export declare class SoundLoader {
    sounds: any[];
    context: any;
    muted: boolean;
    isPlaying(name: any): boolean;
    stopSound(name: any): void;
    playSound(name: any, position: any, radius: any, loop?: any): void;
    Add(args: any): void;
    Load(name: any, buffer: any): void;
}
export declare class BufferLoader {
    context: any;
    urlList: any;
    onload: any;
    bufferList: any[];
    loadCount: number;
    constructor(context: any, urlList: any, callback: any);
    loadBuffer(url: any, index: any): void;
    load(): void;
}

export declare class SoundCollection {
    sounds: SoundLoader;
    constructor();
}

export declare const MAP1 = 0;
export declare const WALL1 = 1;
export declare const ROAD1 = 2;
export declare const GRASS1 = 3;
export declare const TREE1 = 4;
export declare const DIRT1 = 5;
export declare const STONE_WALL = 6;
export declare const WALL2 = 7;
export declare const FLOOR1 = 8;
export declare const RADIOACTIVE_BARREL = 9;
export declare const LEVEL1_WALL = 10;
export declare const WOOD_WALL = 11;
export declare const LEVEL1_WALL2 = 12;
export declare class Textures {
    files: (string | number)[][];
    tex: any;
    loaded: number;
    heightMap: {};
    clean(): void;
    getMap(map_id: any): any;
    isLoaded(): boolean;
    prepare(): void;
    getPixel(x: any, y: any, tex_id: any): {
        r: any;
        g: any;
        b: any;
    };
    loadHeightMap(filename: any, id: any): void;
    load(filename: any, id: any): void;
}

export declare class ThumbnailRenderer {
    private renderer;
    private camera;
    private scene;
    private width;
    private height;
    visible_distance: number;
    constructor(width: number, height: number);
    render(target: Mesh): ImageData;
}

export declare function get_rand(): number;
export declare function loadImageFile(file: any, callback: any): void;

export declare class Vox {
    voxColors: number[];
    readInt(buffer: any, from: any): number;
    readId(buffer: any, i: any): string;
    loadModel(data: ArrayBuffer, name: string): VoxelFile | undefined;
}

export declare class VoxelGeometryWriter {
    private triangles;
    private total_blocks;
    dirty: boolean;
    private positions;
    private colors;
    private v;
    private c;
    private start_x;
    private start_y;
    private start_z;
    private scale;
    appendVertice(x: number, y: number, z: number): void;
    appendColor(n: number, r: number, g: number, b: number): void;
    setPosition(x: number, y: number, z: number): void;
    setScale(scale: number): void;
    getGeometry(): BufferGeometry;
}

export declare enum RigitBodyKind {
    sprite = 0,
    block = 1,
    boundary = 2
}
export interface IRigitBody {
    get id(): number;
    get kind(): RigitBodyKind;
    get inactive(): boolean;
    get owner(): any;
    get speed(): Vector3;
    get position(): Vector3;
    get size(): Vector3;
    setSpeed(speed: Vector3): void;
    onMove(pos: Vector3): void;
    setCollision(obj: IRigitBody | undefined): void;
}
export type VoxelAnimationFrame = {
    idx: number;
    dur: number;
};
export type VoxelAnimationCollection = {
    [name: string]: VoxelAnimationFrame[];
};
export declare class VoxelMeshModel {
    private frames;
    private scale;
    private readonly _size;
    private readonly _pos;
    private _qt;
    private readonly material;
    private currentFrame;
    private currentAnimation;
    private currentAnimationFrame;
    private lastFrameTick;
    private readonly animations;
    get size(): Vector3;
    static create(uri: string, animations?: VoxelAnimationCollection | undefined): Promise<VoxelMeshModel>;
    constructor(animations: VoxelAnimationCollection | undefined);
    private load;
    playAnimation(name: string): void;
    onRender(tick: number): void;
    addToScene(parent: Scene): void;
    removeFromScene(parent: Scene): void;
    setPosition(pos: Vector3): void;
    setRotation(qt: Quaternion): void;
}

export type VoxelPoint = {
    x: number;
    y: number;
    z: number;
    color: number;
};
export type VoxelFile = {
    name: string;
    frames: VoxelFileFrame[];
};
export type VoxelFileFrame = {
    data: VoxelPoint[];
    sx: number;
    sy: number;
    sz: number;
};
export declare function makeVoxelPoint(buffer: Uint8Array, i: number): VoxelPoint;
export declare class VoxelModel {
    readonly uri: string;
    readonly id: number;
    readonly frames: VoxelModelFrame[];
    constructor(uri: string, id: number);
    get size(): Vector3;
}
export declare class VoxelModelFrame {
    private readonly data;
    chunk_sx: number;
    chunk_sy: number;
    chunk_sz: number;
    stride_z: number;
    voxels: Uint32Array;
    wireframe: boolean;
    geometry: BufferGeometry;
    v: BufferAttribute;
    c: BufferAttribute;
    prev_len: number;
    material: MeshPhongMaterial;
    constructor(data: VoxelFileFrame);
    static sameColor(block1: number, block2: number): boolean;
    private getIdx;
    build(writer: VoxelGeometryWriter): void;
}

export type WireModelInfo = {
    id: number;
    voxUrl: string;
    thumbnailUrl: string;
};
export declare class VoxelModelCache {
    private readonly modelsByUrl;
    private readonly modelsById;
    getVoxelModelById(id: number): VoxelModel | undefined;
    getVoxelModel(url: string): VoxelModel | undefined;
    load(): Promise<boolean>;
    loadModelEntries(modelEntries: WireDict[]): Promise<void>;
    static addModelReferences(models: {
        voxUrl: string;
        thumbnailUrl: string;
    }[]): Promise<WireModelInfo[] | undefined>;
    private loadModelFromString;
    private loadModelFromArray;
}
export declare let modelCache: VoxelModelCache;
export declare function getCharacterModelList(): string[];
export declare function getBlockModelList(): string[];
export declare function getObjectModelList(): string[];
