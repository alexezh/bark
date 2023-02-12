export default class AsyncEventSource<T> {
    private callbackSym;
    private handlers;
    private gaps;
    add(obj: any, func: T): void;
    private invokeWorker;
    invoke(...args: any[]): void;
    invokeWithCompletion(onInvoke: () => void, ...args: any[]): void;
}

export interface IFetchAdapter {
    get(uri: string): Promise<Response>;
    post(uri: string, body: string): Promise<any>;
}
export declare function currentWorldId(): string;
export declare function setFetchAdapter(adapter: IFetchAdapter): void;
export declare function fetchResource(url: string): Promise<ArrayBuffer>;
export declare function storeFile(name: string, data: string): Promise<boolean>;
export declare function storeFileBackground(name: string, data: string): void;
export type WireFile = {
    name: string;
    data: string;
};
export declare function fetchFile(pattern: string): Promise<string | undefined>;
export declare function fetchFiles(pattern: string): Promise<WireFile[]>;
export declare function updateAvatarRuntimeProps(avatarId: string, rt: any): void;
export declare function fetchText(uri: string): Promise<string>;

export declare class FetchAdapterWeb implements IFetchAdapter {
    get(uri: string): Promise<Response>;
    post(uri: string, body: string): Promise<any>;
}

export declare class GameApp {
    private worldId;
    private gameContainer;
    private worldProps?;
    state?: IGameState;
    get terminal(): Terminal;
    constructor();
    run(): Promise<void>;
    setContainer(gameContainer: HTMLDivElement): void;
    private tryOnReady;
    private resizeCanvas;
}

export declare var gameApp: GameApp;
export declare function initGame(canvas: HTMLDivElement): void;

export declare class QueueTTT<T> {
    private items;
    push(x: T): void;
    pop(): T;
    isEmpty(): boolean;
}

export type SpriteProps = {
    pos: PxPos;
    gridOffset: PxPos;
    flipH: boolean;
    costumeIndex: number;
};
export type SprivePosChanged = (sprite: Sprite) => void;
export declare class Sprite {
    readonly id: number;
    private readonly props;
    private readonly spriteSheet;
    readonly pixiSprite: PixiSprite;
    private posChanged;
    get pos(): PxPos;
    set pos(newValue: PxPos);
    constructor(props: SpriteProps, sheet: SpriteSheet);
    setCostume(idx: number): void;
    attachCamera(handler: SprivePosChanged | undefined): void;
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
    start(ticker: PixiTicker): void;
    animate(anim: IAnimatable): void;
    cancel(anim: IAnimatable): void;
    nextId(): number;
    get hasAnimations(): boolean;
    private processAnimation;
}
export declare var animator: PropertyAnimationManager;

export declare function numberArrayToString(v: number[]): string;

export type MoveAnimationToken = {
    animation: IAnimatable;
    nextMove: MoveAvatarParams | undefined;
};
export declare class GamePhysics implements IGamePhysics {
    private map;
    private collisionHandler?;
    private moveAnimations;
    constructor(map: IGameMap);
    attachCollisionHandler(handler?: IGameCollisionHandler): void;
    moveAvatarInteractive(params: MoveAvatarParams, canCancel?: boolean): void;
    moveAvatar(params: MoveAvatarParams): boolean;
    private moveAvatarWorker;
    moveAvatarRemote(avatar: IAvatar, pos: GridPos, func: (props: SpriteMoveAnimationProps) => IAnimatable): boolean;
}

export type MoveAvatarParams = {
    avatar: IAvatar;
    dir: MoveDirection;
    animator: (props: SpriteMoveAnimationProps) => IAnimatable;
};
export interface IGamePhysics {
    moveAvatarInteractive(params: MoveAvatarParams, canCancel: boolean): void;
    moveAvatar(params: MoveAvatarParams): boolean;
    moveAvatarRemote(avatar: IAvatar, pos: GridPos, func: (props: SpriteMoveAnimationProps) => IAnimatable): boolean;
    attachCollisionHandler(handler?: IGameCollisionHandler): void;
}
export interface IGameCollisionHandler {
    onCollision(a1: IAvatar, a2: IAvatar): void;
}

export type SpriteSheetProps = {
    id: string;
    url: string;
    gridWidth: number;
    gridHeight: number;
    cellWidth: number;
    cellHeight: number;
    startTileId: number;
};

export type TileBuffer = {
    w: number;
    h: number;
    tiles: number[];
};
export declare class SpriteSheet {
    readonly props: SpriteSheetProps;
    private startFrameId;
    private static nextId;
    get id(): string;
    private constructor();
    static load(props: SpriteSheetProps): Promise<SpriteSheet>;
    private load;
    createSprite(idx: number, pos: PxPos): any;
    getTexture(idx: number): any;
    getRegion(rect: GridRect): TileBuffer;
}

export declare var SimplexNoise: (gen: any) => void;

export declare function perlinNoise(perilinW: number, perilinH: number, baseX: number, baseY: number, seed: number): Uint8ClampedArray;

export declare function PRNG(): any;


export type CodeModule = {
    code: string;
    codeObj: any;
    enabled: boolean;
};
export declare class CodeLoader {
    private codeLib;
    private functionLib;
    battleCode?: IBattleCode;
    getCode(id: string): IAvatarCode | undefined;
    updateCode(id: string, code: string): void;
    getCodeModule(id: string): CodeModule | undefined;
    loadFunction(id: string, ...args: string[]): boolean;
    invokeFunction<T>(id: string, ...args: any): T;
}
export declare function printCodeException(avatar: string, e: any): void;
export declare let codeLoader: CodeLoader;

export declare enum WObjectKind {
    character = "character",
    pokemon = "pokemon"
}
export type WObject = {
    x: number;
    y: number;
    kind: WObjectKind;
};
export type WCharacter = WObject & {
    friend: boolean;
};
export type WPokemon = WObject & {
    friend: boolean;
    scary: number;
};
export interface IAvatarAPI {
    look(func: (x: WObject) => boolean): void;
    canMove(dir: MoveDirection): boolean;
    lookFor(name: string): GridPos | null;
    makeMove(dir: MoveDirection): MoveAction;
    makeRelMove(dir: RelMoveDirection): MoveAction;
    makeIdle(): CodeAction;
    say(s: string): SayAction;
}
export declare enum CodeActionKind {
    idle = 0,
    move = 1,
    say = 2,
    teleport = 3
}
export type CodeAction = {
    kind: CodeActionKind;
};
export declare enum MoveDirection {
    none = "none",
    up = "up",
    down = "down",
    left = "left",
    right = "right"
}
export declare enum RelMoveDirection {
    none = "none",
    forward = "forward",
    back = "back",
    left = "left",
    right = "right"
}
export type MoveAction = CodeAction & {
    dir: MoveDirection;
};
export type SayAction = CodeAction & {
    text: string;
};
export type TeleportAction = CodeAction & {
    mapId: string | undefined;
    layerId: string | undefined;
    pos: GridPos;
};
export declare const maxLookDistance = 5;
export declare function dirByRelDirection(dir: MoveDirection, newDir: RelMoveDirection): MoveDirection;
export declare function deltaByAbsDirection(dir: MoveDirection): GridPos;

export declare enum CodeCategory {
    avatar = "avatar",
    pokedex = "pokedex",
    battle = "battle"
}
export declare enum FileCategory {
    avatar = "avatar",
    pokedex = "pokedex",
    location = "location",
    tile = "tile"
}
export declare function describeCodeCategory(): string;
export interface IAvatarProxy {
    get id(): string;
    get name(): string;
}
export interface ICharacterProxy extends IAvatarProxy {
    get pokemonCount(): number;
    pokemonAt(idx: number): any;
    ballCount(name: string): number;
    balls(): IterableIterator<string>;
}
export interface IAvatarCode {
}

export interface IBattleCode {
}
export declare enum BattleActionKind {
    run = 0,
    attack = 1,
    defend = 2
}
export type BattleAction = {
    kind: BattleActionKind;
};
export type BattleAttackAction = BattleAction & {
    moveId: string;
};
export declare enum BattleAttackResult {
    continue = 0,
    retreat = 1,
    fainted = 2
}
export interface IBattleAPI {
    prompt(s: string): Promise<string>;
    makeRunAction(): BattleAction;
    makeAttackAction(moveId: string): BattleAttackAction;
}

export declare enum CatchActionKind {
    leave = 0,
    catch = 1,
    feed = 2
}
export type CatchAction = {
    kind: CatchActionKind;
};
export type ThrowBallAction = CatchAction & {
    ball: string;
};
export type FeedAction = CatchAction & {
    item: string;
};
export declare enum CatchResult {
    ranaway = 0,
    escapedball = 1,
    caught = 2
}
export interface ICatchAPI {
    prompt(s: string): Promise<string>;
    promptMenu(s: string): Promise<string>;
    makeLeaveAction(): CatchAction;
    makeCatchAction(ball: string): ThrowBallAction;
    makeFeedAction(item: string): FeedAction;
}

export interface ILocationAPI {
    makeTeleportAction(mapId: string | undefined, layerId: string | undefined, x: number, y: number): TeleportAction;
}
export interface ILocationCode {
    onEnter(avatar: IAvatarProxy): CodeAction;
    onExit(avatar: IAvatarProxy): CodeAction;
}
export declare class LocationAPI implements ILocationAPI {
    makeTeleportAction(mapId: string | undefined, layerId: string | undefined, x: number, y: number): TeleportAction;
}

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

export declare function bytesToBase64(bytes: Uint8ClampedArray): string;
export declare function base64ToBytes(str: string): Uint8ClampedArray;

export declare class SpawnCharacterDef extends GenericEditorFuncDef {
    private static funcName;
    constructor(mapEditorState: MapEditorState);
    help(): string;
    createParamDefs(): ParamDef[];
    protected evalCore(params: any): string | undefined;
}

export declare function editCode(args: {
    category: string;
    id: string;
}): void;
export declare function viewCode(args: {
    category: string;
    id: string;
}): void;
export declare function editObject(args: {
    category: string;
    id: string;
}): void;
export declare function registerCodeCommands(): void;

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

export declare function teleport(args: {
    id: string;
    x: number;
    y: number;
}): undefined;
export declare function registerMoveCommands(): void;

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

export declare class HelpDef extends GenericFuncDef {
    private repl;
    constructor(repl: Repl);
    help(): string;
    createParamDefs(): ParamDef[];
    protected evalCore(params: any): string | undefined;
}

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

export declare let showKeyBindingsDef: ShowKeyBindingsDef | undefined;
export declare function populateMapEditCommands(repl: Repl, mapEditorState: MapEditorState): void;

export type MapBitmap = {
    w: number;
    h: number;
    data: Uint8ClampedArray;
};
export declare function createMapBitmap(w: number, h: number): MapBitmap;
export declare function updateRect(rect: GridRect, xNew: number, yNew: number): GridRect;
export type MapEditorUpdate = {
    isEditMode?: boolean;
    tileClipboard?: TileBuffer;
    region?: GridRect;
    scrollSize?: PxSize;
    map?: IGameMap;
};
export declare class MapEditorState {
    private _isEditMode;
    private _region?;
    private _currentLayer?;
    private _tileClipboard?;
    private _scrollSize;
    private _world;
    private eventSource;
    get isEditMode(): boolean;
    get currentLayer(): any | undefined;
    get tileClipboard(): TileBuffer | undefined;
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

export declare const resetColor = "\u001B[0m";
export declare const greenText = "\u001B[1;3;32m";
export declare const redText = "\u001B[1;3;31m";
export declare function decorateCommand(s: string): string;
export declare function decorateSay(s: string): string;

export interface CircleGeometry {
    x: number;
    y: number;
    r: number;
}
export interface CircleProps<CustomDataType = void> extends CircleGeometry {
    data?: CustomDataType;
}
export declare class Circle<CustomDataType = void> implements CircleGeometry, Indexable {
    x: number;
    y: number;
    r: number;
    data?: CustomDataType;
    constructor(props: CircleProps<CustomDataType>);
    qtIndex(node: NodeGeometry): number[];
    static intersectRect(x: number, y: number, r: number, minX: number, minY: number, maxX: number, maxY: number): boolean;
}

export interface LineGeometry {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
export interface LineProps<CustomDataType = void> extends LineGeometry {
    data?: CustomDataType;
}
export declare class Line<CustomDataType = void> implements LineGeometry, Indexable {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    data?: CustomDataType;
    constructor(props: LineProps<CustomDataType>);
    qtIndex(node: NodeGeometry): number[];
    static intersectRect(x1: number, y1: number, x2: number, y2: number, minX: number, minY: number, maxX: number, maxY: number): boolean;
}

export interface QuadtreeProps {
    width: number;
    height: number;
    x?: number;
    y?: number;
    maxObjects?: number;
    maxLevels?: number;
}
export declare class Quadtree<ObjectsType extends Rectangle | Circle | Line | Indexable> {
    bounds: NodeGeometry;
    maxObjects: number;
    maxLevels: number;
    level: number;
    objects: ObjectsType[];
    nodes: Quadtree<ObjectsType>[];
    constructor(props: QuadtreeProps, level?: number);
    getIndex(obj: ObjectsType): number[];
    split(): void;
    insert(obj: ObjectsType): void;
    retrieve(obj: ObjectsType): ObjectsType[];
    clear(): void;
}

export interface RectangleGeometry {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface RectangleProps<CustomDataType = void> extends RectangleGeometry {
    data?: CustomDataType;
}
export declare class Rectangle<CustomDataType = void> implements RectangleGeometry, Indexable {
    x: number;
    y: number;
    width: number;
    height: number;
    data?: CustomDataType;
    constructor(props: RectangleProps<CustomDataType>);
    qtIndex(node: NodeGeometry): number[];
}

export interface Indexable {
    qtIndex(node: NodeGeometry): number[];
}
export interface NodeGeometry {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Highlighter {
    highlight(line: string, pos: number): string;
    highlightPrompt(prompt: string): string;
    highlightChar(line: string, pos: number): boolean;
}
export declare class IdentityHighlighter implements Highlighter {
    highlight(line: string, pos: number): string;
    highlightPrompt(prompt: string): string;
    highlightChar(line: string, pos: number): boolean;
}

export declare class History {
    entries: string[];
    maxEntries: number;
    cursor: number;
    constructor(maxEntries: number);
    saveToLocalStorage(): void;
    restoreFromLocalStorage(): void;
    append(text: string): void;
    resetCursor(): void;
    next(): string | undefined;
    prev(): string | undefined;
}

export declare enum InputType {
    Text = 0,
    AltEnter = 1,
    ArrowUp = 2,
    ArrowDown = 3,
    ArrowLeft = 4,
    ArrowRight = 5,
    Delete = 6,
    Backspace = 7,
    CtrlA = 8,
    CtrlC = 9,
    CtrlD = 10,
    CtrlE = 11,
    CtrlK = 12,
    CtrlL = 13,
    CtrlQ = 14,
    CtrlS = 15,
    CtrlU = 16,
    End = 17,
    Enter = 18,
    Home = 19,
    ShiftEnter = 20,
    UnsupportedControlChar = 21,
    UnsupportedEscape = 22
}
export interface Input {
    inputType: InputType;
    data: string[];
}
export declare function parseInput(data: string): Input[];

type RepeatCount = number;
export declare class LineBuffer {
    buf: string;
    pos: number;
    buffer(): string;
    pos_buffer(): string;
    length(): number;
    char_length(): number;
    update(text: string, pos: number): void;
    insert(text: string): boolean;
    moveBack(n: number): boolean;
    moveForward(n: number): boolean;
    moveHome(): boolean;
    moveEnd(): boolean;
    startOfLine(): number;
    endOfLine(): number;
    moveLineUp(n: number): boolean;
    moveLineDown(n: number): boolean;
    set_pos(pos: number): void;
    prevPos(n: RepeatCount): number | undefined;
    nextPos(n: RepeatCount): number | undefined;
    backspace(n: RepeatCount): boolean;
    delete(n: RepeatCount): boolean;
    deleteEndOfLine(): boolean;
}

type CheckHandler = (text: string) => boolean;
type CtrlCHandler = () => void;
type PauseHandler = (resume: boolean) => void;
export declare class Readline implements ITerminalAddon {
    private term;
    private highlighter;
    private history;
    private activeRead;
    private disposables;
    private watermark;
    private highWatermark;
    private lowWatermark;
    private highWater;
    private onDataToken?;
    private onDataChar;
    private state;
    private checkHandler;
    private ctrlCHandler;
    private pauseHandler;
    constructor();
    activate(term: Terminal): void;
    dispose(): void;
    appendHistory(text: string): void;
    setHighlighter(highlighter: Highlighter): void;
    setCheckHandler(fn: CheckHandler): void;
    setCtrlCHandler(fn: CtrlCHandler): void;
    setPauseHandler(fn: PauseHandler): void;
    writeReady(): boolean;
    write(text: string): void;
    print(text: string): void;
    println(text: string): void;
    output(): Output;
    tty(): Tty;
    read(prompt: string, suppressHistory?: boolean): Promise<string>;
    readChar(prompt: string): Promise<string>;
    cancelRead(): void;
    private handleKeyEvent;
    private updateOnData;
    private readDataChar;
    private readData;
    private readPaste;
    private readKey;
}

export declare class Position {
    col: number;
    row: number;
    constructor(rows?: number, cols?: number);
}
export declare class Layout {
    promptSize: Position;
    cursor: Position;
    end: Position;
    constructor(promptSize: Position);
}
export declare class State {
    private prompt;
    private promptSize;
    private line;
    private tty;
    private layout;
    private highlighter;
    private highlighting;
    private history;
    constructor(prompt: string, tty: Tty, highlighter: Highlighter, history: History);
    buffer(): string;
    shouldHighlight(): boolean;
    clearScreen(): void;
    editInsert(text: string): void;
    update(text: string): void;
    editBackspace(n: number): void;
    editDelete(n: number): void;
    editDeleteEndOfLine(): void;
    refresh(): void;
    moveCursorBack(n: number): void;
    moveCursorForward(n: number): void;
    moveCursorUp(n: number): void;
    moveCursorDown(n: number): void;
    moveCursorHome(): void;
    moveCursorEnd(): void;
    moveCursorToEnd(): void;
    previousHistory(): void;
    nextHistory(): void;
    moveCursor(): void;
}

export interface Output {
    write(text: string): void;
    print(text: string): void;
    println(text: string): void;
}
export declare class Tty {
    tabWidth: number;
    col: number;
    row: number;
    private out;
    constructor(col: number, row: number, tabWidth: number, out: Output);
    write(text: string): void;
    print(text: string): void;
    println(text: string): void;
    clearScreen(): void;
    calculatePosition(text: string, orig: Position): Position;
    computeLayout(promptSize: Position, line: LineBuffer): Layout;
    refreshLine(prompt: string, line: LineBuffer, oldLayout: Layout, newLayout: Layout, highlighter: Highlighter): void;
    clearOldRows(layout: Layout): void;
    moveCursor(oldCursor: Position, newCursor: Position): void;
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

export type CommandBarProps = UiLayerProps & {
    termProps: TerminalProps;
    mapEditorState: MapEditorState;
    onToggleEdit: () => void;
    onToggleTerm: () => void;
    onToggleTile: () => void;
    onToggleMap: () => void;
};
export declare class CommandBar extends UiLayer2<CommandBarProps> {
    private editButton;
    private termButton;
    private tileButton;
    private mapButton;
    constructor(props: CommandBarProps);
    private createLayerBox;
    onUpdateMapEditorState(): void;
}

export declare function printNetworkError(s: string): void;

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
}

export declare function setElementVisible(elem: HTMLElement, val: boolean): void;
export declare function createTextDiv(): [HTMLDivElement, HTMLSpanElement];
export declare function createButton(parent: HTMLElement, text: string, handler: (evt: any) => any): HTMLButtonElement;

export interface ICameraLayer {
}

export interface IGameTerminal {
    login(name: string): void;
    logout(): void;
    refresh(): void;
    setGameMap(map: IGameMap): void;
    printError(s: string): void;
    print(s: string): void;
    printException(e: any): void;
    prompt(s: string): Promise<string>;
    promptMenu(s: string): Promise<string>;
    editFile(text: string | undefined | null, onSave: ((text: string) => void) | undefined): void;
}
export declare let terminal: IGameTerminal | undefined;
export declare function setTerminal(t: IGameTerminal): void;

export interface IMapEditor {
    onMouseDown(evt: MEvent): boolean;
    onMouseUp(evt: MEvent): boolean;
    onMouseMove(evt: MEvent): boolean;
}

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
    constructor(htmlElem: HTMLElement, onInput: () => void);
    private onKeyDown;
    private onKeyUp;
    registerKeyUp(key: string, func?: () => void): void;
}

export declare class TerminalProps {
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
export declare class Terminal implements IGameTerminal {
    private map;
    private container;
    camera?: CameraLayer;
    private compositor2;
    private props;
    private interactiveAvatar?;
    private barLayer;
    private terminalLayer;
    private mapEditor?;
    private codeEditor?;
    private tileViewer?;
    private keyboardHandler?;
    private repl;
    constructor(gameContainer: HTMLDivElement);
    refresh(): void;
    printError(s: string): void;
    print(s: string): void;
    prompt(s: string): Promise<string>;
    promptMenu(s: string): Promise<string>;
    editFile(text: string | null | undefined, onSave: ((text: string) => void) | undefined): void;
    printException(e: any): void;
    setGameMap(map: IGameMap): void;
    private setInteractiveAvatar;
    private populateBasicCommands;
    private loginCached;
    login(name: string): void;
    logout(): void;
    private onToggleTerm;
    private onOpenTerm;
    private onCloseTerm;
    private onToggleMap;
    private onToggleTile;
    private onToggleEdit;
    private openTextEditor;
    private closeTextEditor;
}

export type TerminalLayerProps = UiLayerProps & {
    repl: Repl;
    visible: boolean;
    mapEditorState: MapEditorState;
    onCloseTerminal: () => void;
};
export declare class TextTerminalLayer extends UiLayer2<TerminalLayerProps> {
    private rl?;
    private term?;
    private repl;
    private fitAddon?;
    private mapEditorState?;
    constructor(props: TerminalLayerProps);
    focus(): void;
    print(s: string): void;
    private onKeyUp;
    private createTerminal;
    fit(count?: number): void;
    prompt(s: string): Promise<string>;
    promptMenu(s: string): Promise<string>;
    private readLine;
    private processLine;
}

export type TilesetListProps = UiLayerProps & {
    mapEditorState: MapEditorState;
    scale: number;
    scrollY?: number;
};
export declare class TilesetList extends UiLayer2<TilesetListProps> {
    selectedRect?: GridRect;
    private isViewDirty;
    private keyBinder;
    private canvas;
    private tileSheet?;
    private tileSheetImage?;
    private pxSize;
    constructor(props: TilesetListProps);
    private get canvasWidth();
    private get canvasHeight();
    refresh(force?: boolean): void;
    onMouseDown(htmlEvt: MouseEvent): boolean;
    onCopyRegion(): void;
    onWheel(evt: WheelEvent): boolean;
    private onUpdate;
    private _repaint;
    private drawContent;
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
    constructor(props: T, element: HTMLElement);
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

export type CameraLayerProps = UiLayerProps & {
    scale: number;
    onOpenTerminal: () => void;
    onToggleEdit: () => void;
    onToggleTile: () => void;
};
export declare class CameraLayer extends UiLayer2<CameraLayerProps> implements ICameraLayer {
    renderer: WebGLRenderer;
    camera: Camera;
    scene: Scene;
    clock: Clock;
    private input;
    t_start: number;
    map: IGameMap;
    mapEditor: MapEditor;
    update_objects: any;
    player: any;
    visible_distance: number;
    textures: Textures;
    ff_objects: never[];
    private selected;
    private isDown;
    box_material: MeshPhongMaterial;
    sprite_material: SpriteMaterial;
    chunk_material: MeshPhongMaterial;
    p_light: PointLight;
    maps_ground: number;
    constructor(props: CameraLayerProps);
    private createCamera;
    private loadMap;
    reset(): void;
    onWindowResize(): void;
    animate(): void;
    addObject(obj: any): void;
    render(): void;
}

export declare class Character {
    private meshFrames;
    private url;
    private currentFrame;
    private scale;
    material: MeshPhongMaterial;
    constructor(url: string, material: MeshPhongMaterial);
    load(): Promise<boolean>;
    getMesh(): Mesh;
}

export declare class MeshModel {
    mesh: Mesh;
    geometry: BufferGeometry;
    material: MeshPhongMaterial;
    constructor(geo: BufferGeometry);
}
export declare class GameMap implements IGameMap {
    private scene;
    objects: any;
    width: number;
    height: number;
    private blockSize;
    private layers;
    private char;
    ambient_light: AmbientLight;
    material: MeshPhongMaterial;
    reset(): void;
    update(time: any, delta: any): void;
    load(): Promise<boolean>;
    loadScene(scene: Scene): boolean;
    gridSizeToWorldSize(gridSize: GridSize3): WorldSize3;
    gridPosToWorldPos(gridPos: GridPos3): {
        x: number;
        y: number;
        z: number;
    };
    findBlock(point: Vector3): MapBlockCoord | undefined;
    deleteBlock(block: MapBlockCoord): void;
    addBlock(pos: GridPos3, block: VoxelModel): void;
}

export interface ICameraLayer {
}

export type MapProps = {
    id: string;
    gridWidth: number;
    gridHeight: number;
    cellWidth: number;
    cellHeight: number;
    humanStepDuration: number;
};
export interface IGameMap {
    load(): Promise<boolean>;
    loadScene(scene: Scene): any;
    findBlock(point: Vector3): MapBlockCoord | undefined;
    deleteBlock(block: MapBlockCoord): any;
    addBlock(pos: GridPos3, block: VoxelModel): any;
    gridSizeToWorldSize(gridSize: GridSize3): WorldSize3;
    gridPosToWorldPos(gridPos: GridPos3): any;
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

export declare function addEditorShortcuts(showKeyBindingsDef: ShowKeyBindingsDef): void;
export interface IMapEditorHost {
}
export declare class MapEditor implements IMapEditor {
    private viewSize;
    private camera;
    private scene;
    private isDown;
    private selectedBlock;
    private selection;
    private map;
    static material: LineBasicMaterial;
    constructor(viewSize: PxSize, scene: Scene, camera: Camera, input: KeyBinder, map: IGameMap);
    private onStateChanged;
    onMouseDown(evt: MEvent): boolean;
    onMouseUp(evt: MEvent): boolean;
    onMouseMove(evt: MEvent): boolean;
    private onCopyBlock;
    private onPasteBlock;
    private pasteBlockWorker;
    private onClearBlock;
    private selectBlockFace;
}

export type MapBlock = {
    model: VoxelModel;
    frame: number;
};
export type MapBlockCoord = {
    model: VoxelModel;
    idx: number;
    gridPos: GridPos3;
};
export declare class MapLayer {
    private size;
    private blockSize;
    private layerZ;
    private blocks;
    private _mesh;
    private geometry;
    private material;
    get staticMesh(): Mesh;
    constructor(material: MeshPhongMaterial, layerZ: number, blockSize: number);
    load(): void;
    fill(tile: VoxelModel): void;
    build(): void;
    findBlock(point: Vector3): MapBlockCoord | undefined;
    deleteBlock(block: MapBlockCoord): void;
    addBlock(pos: GridPos3, block: VoxelModel): void;
}

export declare class ParticlePool {
}

export type GridPos3 = {
    x: number;
    y: number;
    z: number;
};
export type GridSize3 = {
    sx: number;
    sy: number;
    sz: number;
};
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
    id: string;
    frames: VoxelModelFrame[];
    constructor(id: string);
    get gridSize(): GridSize3;
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

export declare class VoxelModelCache {
    private readonly models;
    getVoxelModel(url: string): Promise<VoxelModel>;
}
export declare let modelCache: VoxelModelCache;

export interface IGameKeyboardHandler {
    handleKeyboard(input: KeyBinder): void;
}
export type AvatarPosChanged = (avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined) => void;
export declare class Avatar implements IAvatar {
    readonly props: AvatarProps;
    get rt(): any;
    set rt(val: any);
    skin?: Sprite;
    nextPos?: GridPos;
    dir: MoveDirection;
    private _currentPosVersion;
    get gameState(): AvatarGameState;
    set gameState(mode: AvatarGameState);
    private readonly posChanged;
    private cameraUpdate;
    get id(): string;
    get stepDuration(): number;
    get currentPos(): GridPos | undefined;
    set currentPos(pos: GridPos | undefined);
    get currentPosVersion(): number;
    layer?: any;
    get tileLayer(): any;
    constructor(props: AvatarProps, posChanged: AvatarPosChanged);
    onRemoteUpdateCurrentPos(pos: GridPos | undefined): void;
    updateRuntimeProps(props: any): void;
    getCode(): string;
    updateCode(code: string): void;
    attachCamera(func: AvatarPosChanged | undefined): void;
    protected getAvatarCodeFile(): string;
    clearLayer(): void;
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
export declare class GameState {
    private sessionId?;
    private connection?;
    private connectionStatus;
    gameMap?: IGameMap;
    readonly repl: Repl;
    onLoaded: boolean;
    constructor();
    load(): Promise<boolean>;
    spawnCharacter(name: string, skinUrl: string): void;
    private onAvatarPosChanged;
    private addAvatar;
    private connectSignalR;
    private onUpdateAvatarPositionRtc;
}
export declare function createGameState(): IGameState;

export declare class HumanKeyboardHandler implements IGameKeyboardHandler {
    readonly cellWidth: number;
    readonly cellHeight: number;
    private readonly stepDuration;
    private readonly physics;
    private readonly avatar;
    constructor(avatar: IAvatar, physics: IGamePhysics, cellW: number, cellH: number, stepDuration: number);
    handleKeyboard(input: KeyBinder): void;
}

export type AvatarProps = {
    id: string;
    layerId?: string;
    pos?: GridPos;
};
export type WireCharacterProps = AvatarProps & {
    skinUrl: string;
    rt: string;
};
export type WirePokemonProps = AvatarProps & {
    pokedexId: string;
    kind: string;
    rt: string;
};
export type WireAvatarProps = {
    character?: WireCharacterProps;
    pokemon?: WirePokemonProps;
};
export declare enum AvatarGameState {
    move = 0,
    removed = 1,
    battle = 2,
    catch = 3,
    resting = 4,
    suspended = 5
}
export interface IAvatar {
    get props(): AvatarProps;
    get rt(): any;
    set rt(val: any);
    get id(): string;
    get stepDuration(): number;
    dir: MoveDirection;
    get currentPosVersion(): number;
    get currentPos(): GridPos | undefined;
    set currentPos(pos: GridPos | undefined);
    nextPos?: GridPos;
    gameState: AvatarGameState;
    skin?: Sprite;
    onRemoteUpdateCurrentPos(pos: GridPos | undefined): void;
    getCode(): string;
    updateCode(code: string): void;
    updateRuntimeProps(props: any): void;
    attachCamera(func: ((avatar: IAvatar) => void) | undefined): void;
}

export interface IGameState {
    map?: IGameMap;
    onLoaded: boolean;
    load(): Promise<boolean>;
    spawnCharacter(name: string, skinUrl: string): void;
}
export declare function setGameState(state: IGameState): void;
export declare var gameState: IGameState;

export declare class Python {
}

export type SpriteMoveAnimationProps = {
    sprite: Sprite;
    dx: number;
    dy: number;
    duration: number;
    onComplete: ((anim: IAnimatable) => void) | undefined;
};
export declare class SpriteMoveAnimation extends Animatable {
    private props;
    private x;
    private y;
    private sprite;
    private firstCostume;
    static create(props: SpriteMoveAnimationProps): SpriteMoveAnimation;
    private constructor();
    onComplete(): void;
    animate(elapsed: number): boolean;
}
export declare class InteractivePlayerAnimation extends Animatable {
    private x;
    private y;
    private props;
    private firstCostume;
    static create(props: SpriteMoveAnimationProps): InteractivePlayerAnimation;
    private constructor();
    onComplete(): void;
    animate(elapsed: number): boolean;
}
