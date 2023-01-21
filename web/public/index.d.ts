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
    get(uri: string): Promise<any>;
    post(uri: string, body: string): Promise<any>;
}
export declare function currentWorldId(): string;
export declare function setFetchAdapter(adapter: IFetchAdapter): void;
export declare function fetchWorld(id: string): Promise<WorldProps>;
export declare function fetchAtlases(): Promise<SpriteSheetProps[]>;
export declare function fetchTiles(): Promise<WireTileCollectionProps>;
export declare function addTileSet(tileSetProps: SpriteSheetProps): Promise<void>;
export declare function storeFile(name: string, data: string): Promise<boolean>;
export declare function storeFileBackground(name: string, data: string): void;
export type WireFile = {
    name: string;
    data: string;
};
export declare function fetchFiles(pattern: string): Promise<WireFile[]>;
export declare function updateTile(tileProps: WireTileDefProps): Promise<void>;
export declare function fetchMap(mapId: string): Promise<WireMapData>;
export declare function fetchAvatars(): Promise<WireAvatarProps[]>;
export declare function updateTileLayer(updateMsg: WireTileLayerUpdate): Promise<void>;
export declare function addCompositeTile(tileProps: WireTileDefProps): Promise<WireAddCompositeTileResponse>;
export declare function updateAvatarRuntimeProps(avatarId: string, rt: any): void;
export declare function fetchText(uri: string): Promise<any>;
export declare function spawnPokemon(params: WireSpawnPokemonRequest): Promise<WireAvatarProps>;
export declare function spawnCharacter(params: WireSpawnCharacterRequest): Promise<WireAvatarProps>;
export declare function removeAvatar(id: string): Promise<boolean>;

export declare class FetchAdapterWeb implements IFetchAdapter {
    get(uri: string): Promise<any>;
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
    private handleAvatarCollision;
    private canMoveToMapPos;
    private onCompleteMove;
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

export declare class ResourceLibrary {
    private _grammar?;
    private _parser?;
    private spriteSheets;
    private tiles;
    private composedTiles;
    private pokedex;
    get grammar(): string | undefined;
    get parser(): object | undefined;
    load(worldId: string): Promise<void>;
    addSpriteSheet(spriteSheet: SpriteSheet): void;
    getSpriteSheetById(id: string): SpriteSheet;
    loadSpriteSheet(props: SpriteSheetProps): Promise<SpriteSheet>;
    forEachSpriteSheet(func: (x: SpriteSheet) => void): void;
    createTileSprite(tile: TileDef | undefined, pos: PxPos): PixiSprite | undefined;
    getTileById(n: number): TileDef | undefined;
    deleteTile(tile: number): void;
    findTile(pred: (tile: TileDef) => boolean): TileDef | undefined;
    findTiles(pred: (tile: TileDef) => boolean): IterableIterator<TileDef>;
    updateTile(tile: TileDef): void;
    getTileById2(n: number | undefined): TileDef | undefined;
    findOrAddTile(currentTile: TileDef, addOnTile: TileDef): Promise<TileDef>;
    updatePokedexEntry(id: string, e: any): void;
    getPokedexEntry(id: string): any;
}
export declare var resourceLib: ResourceLibrary;

export type TileBuffer = {
    w: number;
    h: number;
    tiles: number[];
};
export declare class SpriteSheet {
    readonly props: SpriteSheetProps;
    private texture?;
    private spriteSheet?;
    private startFrameId;
    private static nextId;
    get id(): string;
    private constructor();
    static load(props: SpriteSheetProps): Promise<SpriteSheet>;
    private load;
    createSprite(idx: number, pos: PxPos): PixiSprite;
    getTexture(idx: number): PixiTexture<import("pixijs").Resource>;
    getRegion(rect: GridRect): TileBuffer;
}

export declare var SimplexNoise: (gen: any) => void;

export type GenerateMapParams = {
    command: string;
    p1: string;
    p2: string;
    p3: string;
    p4: string;
};
export type BiomeProps = {
    level: number;
    perlinBase: number;
    seed: number;
};
export type TileReplacementPattern = {
    category: string;
    w: number;
    h: number;
    current: number[];
    replace: number[];
};
export type HouseDef = {
    id: number;
    w: number;
    h: number;
    tiles: number[];
};
export type GenerateMapProps = {
    mapWidth: number;
    mapHeight: number;
    seed: number;
    perlinBase: number;
    waterLevel: number;
    sandLevel: number;
    grassLevel: number;
    mountainLevel: number;
    clip: PxRect;
    detailsBase: number;
    detailsScale: number;
    ground: BiomeProps;
    tree: BiomeProps;
    city: BiomeProps;
    replacePatterns: TileReplacementPattern[];
    houseDefs: HouseDef[];
};
export type RGB = {
    r: number;
    g: number;
    b: number;
};
export declare enum GroundKind {
    water = 0,
    sand = 1,
    ground = 2,
    grass = 3,
    mountain = 4,
    tree = 5,
    bush = 6,
    city = 7,
    houseContinue = 99,
    houseStart = 100
}
export declare class GenerateMapDef extends GenericEditorFuncDef {
    static funcName: string;
    private repl;
    private loaded;
    private props?;
    private height?;
    private tree?;
    private bush?;
    private ground?;
    private city?;
    private groundDef?;
    mapEditorState: any;
    constructor(mapEditorState: MapEditorState, repl: Repl);
    createParamDefs(): ParamDef[];
    help(): string;
    private ensureLoaded;
    private loadBuffer;
    private saveBuffer;
    private saveProps;
    protected evalCore(params: any): string | undefined;
    private setVar;
    private getVar;
    private generateHeight;
    private generateHeightDetails;
    private generateBiome;
    private generateBiomeParams;
    private generateHouses;
    private getColorByHeight;
    private generateTiles;
    private addPattern;
    private addHouse;
    private clearPattern;
    private displayHeightMap;
    private clipHeight;
    private sinkLand;
    private sinkLine;
    private print;
}
export declare function tileToColor(tileId: number): RGB;

export declare class HouseWriter {
    rnd: any;
    houses: HouseDef[];
    ground: Uint8Array;
    width: number;
    height: number;
    constructor(rnd: any, buildings: HouseDef[], groundDef: Uint8Array, width: number, height: number);
    generate(pos: GridPos, houseCount: number): void;
    private buildHouse;
}

export declare function getIslandGenerationConfig(): {
    landName: string;
    cityNames: string;
    genType: string;
    rivers: number;
    mountains: number;
    cities: number;
    forests: number;
    beaches: number;
    generationSpeed: number;
    sprawlingRivers: boolean;
    wDecorations: boolean;
    lDecorations: boolean;
    ribbon: boolean;
    worldSteps: number;
    detailSteps: number;
};
export declare function getChance(max: any, isLower: any): boolean;

export declare function perlinNoise(perilinW: number, perilinH: number, baseX: number, baseY: number, seed: number): Uint8ClampedArray;

export declare function PRNG(): any;

export declare class TileLayerWriter {
    ground: TileDef;
    grass: TileDef;
    tree: TileDef;
    mountain: TileDef;
    water: TileDef;
    sand: TileDef;
    grassVar: TileDef[];
    buildings: HouseDef[];
    constructor(buildings: HouseDef[]);
    generateTiles(props: GenerateMapProps, layer: TileLayer, groundDef: Uint8Array, usePatterns: boolean): void;
    private fillGroundTiles;
    private fillHouseTiles;
    private replacePatterns;
    private replacePatternsWorker;
    private generateTrees;
}

export declare function CAWorld(options: any): void;

export declare class Markov {
    constructor(type?: string);
    addStates(state: any): void;
    clearChain(): void;
    clearState(): void;
    clearPossibilities(): void;
    getStates(): any;
    setOrder(order?: number): void;
    getOrder(): any;
    getPossibilities(possibility: any): any;
    train(order: any): void;
    generateRandom(chars?: number): any;
    random(obj: any, type: any): any;
    predict(value: any): any;
    getType(): any;
    setType(type?: string): void;
}

export declare class AvatarAPI implements IAvatarAPI {
    self?: IAvatar;
    private map;
    private avatarCollection;
    constructor(avatarCollection: AvatarCollection, map: IGameMap);
    look(func: (x: WObject) => boolean): boolean;
    canMove(dir: MoveDirection): boolean;
    lookFor(id: string): GridPos | null;
    makeMove(dir: MoveDirection): MoveAction;
    makeRelMove(dir: RelMoveDirection): MoveAction;
    makeIdle(): CodeAction;
    say(s: string): SayAction;
}

export declare class PokemonProxy implements IPokemonProxy {
    private props;
    constructor(obj: PokemonProps);
    get id(): string;
    get name(): string;
    get kind(): PokemonKind;
    get hp(): number;
    get hpMax(): number;
    get ownerId(): string | undefined;
    get movesCount(): number;
    moveAt(idx: number): PokemonMove;
}
export declare class CharacterProxy implements ICharacterProxy {
    private props;
    constructor(obj: CharacterProps);
    get id(): string;
    get name(): string;
    get pokemonCount(): number;
    pokemonAt(idx: number): PokemonProxy;
    ballCount(name: string): number;
    balls(): IterableIterator<string>;
}

export type BattleToken = {
    a1: Pokemon;
    a2: Pokemon;
    p1: PokemonProxy;
    p2: PokemonProxy;
    pending: Promise<BattleAction> | undefined;
    currentMover: PokemonProxy | undefined;
};
export declare function startBattle(a1: IAvatar, a2: IAvatar): void;
export declare function runBattles(): void;

export declare class CatchAPI implements ICatchAPI {
    makeLeaveAction(): CatchAction;
    makeCatchAction(ball: string): ThrowBallAction;
    makeFeedAction(item: string): FeedAction;
    prompt(s: string): Promise<string>;
    promptMenu(s: string): Promise<string>;
}
export type CatchToken = {
    character: Character;
    pokemon: Pokemon;
    p1: CharacterProxy;
    p2: PokemonProxy;
    pending: Promise<CatchAction> | undefined;
    currentMover: PokemonProxy | CharacterProxy | undefined;
};
export declare function startCatch(character: Character, pokemon: Pokemon): void;
export declare function runCatch(): void;

export type CodeLoaderEntry = {
    code: string;
    codeObj: any;
    enabled: boolean;
};
export declare class CodeLoader {
    private codeLib;
    battleCode?: IBattleCode;
    getCode(id: string): IAvatarCode | undefined;
    updateCode(id: string, code: string): void;
    getCodeObject(id: string): CodeLoaderEntry | undefined;
    loadCode(category: CodeCategory, code: string): any;
}
export declare function printCodeException(avatar: string, e: any): void;
export declare let codeLoader: CodeLoader;

export declare class BattleAPI implements IBattleAPI {
    prompt(s: string): Promise<string>;
    makeRunAction(): BattleAction;
    makeAttackAction(moveId: string): BattleAttackAction;
}
export declare class GameMechanics implements IGameMechanics, IGameCollisionHandler {
    private ticker?;
    private lastMoveTick;
    private physics;
    private map;
    private readonly avatarCollection;
    private readonly liveAvatars;
    constructor(map: IGameMap, physics: IGamePhysics, avatarCollection: AvatarCollection);
    start(ticker: PixiTicker): void;
    addLiveAvatar(avatar: IAvatar): void;
    removeLiveAvatar(avatar: IAvatar): void;
    onCollision(a1: IAvatar, a2: IAvatar): void;
    private runStep;
    private runMoveStep;
    private executeAction;
}

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
export declare const maxLookDistance = 5;
export declare function dirByRelDirection(dir: MoveDirection, newDir: RelMoveDirection): MoveDirection;
export declare function deltaByAbsDirection(dir: MoveDirection): GridPos;

export declare enum CodeCategory {
    avatar = "avatar",
    battle = "battle"
}
export declare function describeCodeCategory(): string;
export interface IPokemonProxy {
    get id(): string;
    get name(): string;
    get kind(): PokemonKind;
    get hp(): number;
    get hpMax(): number;
    get ownerId(): string | undefined;
    get movesCount(): number;
    moveAt(idx: number): PokemonMove;
}
export interface ICharacterProxy {
    get id(): string;
    get name(): string;
    get pokemonCount(): number;
    pokemonAt(idx: number): PokemonProxy;
    ballCount(name: string): number;
    balls(): IterableIterator<string>;
}
export interface IAvatarCode {
    next(self: IPokemonProxy, abi: IAvatarAPI): CodeAction | undefined;
    battleTurn(self: IPokemonProxy, opponent: IPokemonProxy, api: IBattleAPI): Promise<BattleAction>;
    catchTurn(self: ICharacterProxy, opponent: IPokemonProxy, api: ICatchAPI): Promise<CatchAction>;
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

export interface IGameMechanics {
    start(ticker: PixiTicker): unknown;
    addLiveAvatar(avatar: IAvatar): void;
    removeLiveAvatar(avatar: IAvatar): void;
}
export declare let gameMechanics: IGameMechanics;
export declare function createGameMechanics(map: IGameMap, physics: IGamePhysics, avatarCollection: AvatarCollection): IGameMechanics;

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
export declare function editJson(args: {
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

export type TeleportParams = {
    id: string;
    x: number;
    y: number;
};
export declare class TeleportDef extends GenericEditorFuncDef {
    static funcName: string;
    constructor(mapEditorState: MapEditorState);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}

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

export type LayerParams = {
    layer: string | undefined;
};
export declare class SelectLayerDef extends GenericEditorFuncDef {
    constructor(mapEditorState: MapEditorState);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare class ShowLayerCoreDef extends GenericEditorFuncDef {
    private show;
    constructor(name: string, show: boolean, mapEditorState: MapEditorState);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare class ShowLayerDef extends ShowLayerCoreDef {
    constructor(mapEditorState: MapEditorState);
    help(): string;
}
export declare class HideLayerDef extends ShowLayerCoreDef {
    constructor(mapEditorState: MapEditorState);
    help(): string;
}

export declare let fillRegionDef: FillRegionDef | undefined;
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
    map?: GameMap;
    mapBitmap?: MapBitmap;
    tileListSheet?: SpriteSheet;
    invalidator?: ICameraControl | null;
};
export declare class MapEditorState {
    private _isEditMode;
    private _region?;
    private _currentLayer?;
    private _tileClipboard?;
    private _scrollSize;
    private _world;
    private _cameraControl;
    private _mapBitmap?;
    private _tileListSheet?;
    private eventSource;
    get isEditMode(): boolean;
    get currentLayer(): IGameLayer | undefined;
    get tileClipboard(): TileBuffer | undefined;
    get region(): GridRect | undefined;
    get cameraSize(): PxSize | undefined;
    get world(): GameMap | undefined;
    get cameraControl(): ICameraControl | undefined;
    get mapBitmap(): MapBitmap | undefined;
    get tileListSheet(): SpriteSheet | undefined;
    get currentTileLayer(): TileLayer | undefined;
    static unknownLayerError: string;
    constructor();
    onChanged(target: any, func: (evt: MapEditorChangeEvent) => void): void;
    invalidateCamera(): void;
    update(val: MapEditorUpdate): void;
    selectLayer(layerId: string): void;
    showLayer(layerId: string, isVisible: boolean): void;
}
export declare let mapEditorState: MapEditorState;
export declare function createMapEditorState(): void;

export type AddPokemonTypeParams = {
    id: string;
    name: string;
    kind: string;
};
export declare class AddPokemonTypeDef extends GenericEditorFuncDef {
    private static funcName;
    constructor(mapEditorState: MapEditorState);
    help(): string;
    createParamDefs(): ParamDef[];
    protected evalCore(params: any): string | undefined;
}
export type SpawnPokemonParams = {
    pokedexId: number;
    name: string;
};
export declare function spawnPokemon(args: {
    pokedexId: number;
    x: number;
    y: number;
}): void;
export declare function printAvatarInfo(args: {
    id: string;
}): void;
export declare function registerPokemonCommands(): void;

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
    (args: any): void;
};
export declare function registerFunction(name: string, args: string[], func: (args: any) => void): void;
export declare function getFunction(name: string): PoshFunction | undefined;
export declare function evalFunction(ast: AstNode): string | undefined;
export declare function printEditModeError(): void;
export declare function printNoRegion(): void;

export type FillRegionParams = CoordinateParams & {
    tile: number | undefined;
};
export declare class FillRegionDef extends GenericEditorFuncDef {
    static funcName: string;
    private repl;
    constructor(mapEditorState: MapEditorState, repl: Repl);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare class CutRegionDef extends GenericEditorFuncDef {
    static funcName: string;
    constructor(mapEditorState: MapEditorState);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare class CopyRegionDef extends GenericEditorFuncDef {
    static funcName: string;
    constructor(mapEditorState: MapEditorState);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare class PasteRegionDef extends GenericEditorFuncDef {
    static funcName: string;
    private repl;
    constructor(mapEditorState: MapEditorState, repl: Repl);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare class SelectRegionDef extends GenericEditorFuncDef {
    private static funcName;
    constructor(mapEditorState: MapEditorState);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare class GetRegionInfoDef extends GenericEditorFuncDef {
    constructor(mapEditorState: MapEditorState);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare function saveRegion(args: {
    name: string;
}): void;
export declare function loadRegion(args: {
    name: string;
}): void;
export declare function registerRegionCommands(): void;
export declare function withRegion(func: (layer: TileLayer, region: GridRect) => Promise<boolean>): boolean;

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
export declare class LoginDef extends GenericFuncDef {
    private func;
    constructor(func: (x: string) => void);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}
export declare class LogoutDef extends GenericFuncDef {
    private func;
    constructor(func: () => void);
    createParamDefs(): ParamDef[];
    help(): string;
    protected evalCore(params: any): string | undefined;
}

export declare const resetColor = "\u001B[0m";
export declare const greenText = "\u001B[1;3;32m";
export declare const redText = "\u001B[1;3;31m";
export declare function decorateCommand(s: string): string;
export declare function decorateSay(s: string): string;

export type AddTileCategoryParams = CoordinateParams & {
    category: string;
};
export declare class AddTileCategoryDef extends GenericEditorFuncDef {
    private static funcName;
    constructor(mapEditorState: MapEditorState);
    help(): string;
    createParamDefs(): ParamDef[];
    protected evalCore(params: any): string | undefined;
    private addCategory;
}
export declare class RemoveTileCategoryDef extends GenericEditorFuncDef {
    private static funcName;
    constructor(mapEditorState: MapEditorState);
    help(): string;
    createParamDefs(): ParamDef[];
    protected evalCore(params: any): string | undefined;
    private removeCategory;
}
export type DeleteTileParams = {
    tile: number;
};
export declare class DeleteTileDef extends GenericEditorFuncDef {
    private static funcName;
    constructor(mapEditorState: MapEditorState);
    help(): string;
    createParamDefs(): ParamDef[];
    protected evalCore(params: any): string | undefined;
}
export type AddTileSetParams = {
    id: string;
    url: string;
    w: number;
    h: number;
};
export declare class AddTileSetDef extends GenericEditorFuncDef {
    private static funcName;
    private repl;
    private image?;
    constructor(mapEditorState: MapEditorState, repl: Repl);
    help(): string;
    createParamDefs(): ParamDef[];
    protected evalCore(params: any): string | undefined;
    private onImageError;
    private onImageLoaded;
}
export declare class ListTileSetsDef extends GenericEditorFuncDef {
    private static funcName;
    private repl;
    constructor(mapEditorState: MapEditorState, repl: Repl);
    help(): string;
    createParamDefs(): ParamDef[];
    protected evalCore(params: any): string | undefined;
}
export declare class SelectTileSetDef extends GenericEditorFuncDef {
    private static funcName;
    private repl;
    constructor(mapEditorState: MapEditorState, repl: Repl);
    help(): string;
    createParamDefs(): ParamDef[];
    protected evalCore(params: any): string | undefined;
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

export type CameraLayerProps = UiLayerProps & {
    scale: number;
    gameMap: IGameMap;
    mapEditorState: MapEditorState;
    onOpenTerminal: () => void;
    onToggleEdit: () => void;
    onToggleTile: () => void;
};
export interface ICameraControl {
    refresh(): void;
    scrollBy(pxSize: PxSize): void;
    ensureVisible(pos: GridPos): void;
}
export declare function addCameraShortcuts(showKeyBindingsDef: ShowKeyBindingsDef): void;
export declare class CameraLayer extends UiLayer2<CameraLayerProps> implements ICameraControl {
    private isViewDirty;
    private scroll;
    private avatar?;
    private keyboardHandler?;
    private get canvasWidth();
    private get canvasHeight();
    private mapEditor?;
    private input;
    private pixiRenderer;
    private rootContainer;
    private viewportContainer;
    private editorContainer;
    private ticker;
    constructor(props: CameraLayerProps);
    setEditor(mapEditor?: IMapEditor): void;
    setAvatar(avatar: IAvatar, keyboardHandler: IGameKeyboardHandler): void;
    resetAvatar(): void;
    scrollBy(pxSize: PxSize): void;
    ensureVisible(pos: GridPos): void;
    ensureVisiblePx(px: PxPos): void;
    refresh(): void;
    onSpriteMove(sprite: Sprite): void;
    private onAvatarMove;
    onToggleLayer(nid: number): void;
    private setScrollPos;
    onMouseDown(htmlEvt: MouseEvent): boolean;
    onMouseUp(htmlEvt: MouseEvent): boolean;
    onMouseMove(htmlEvt: MouseEvent): boolean;
    onWheel(evt: WheelEvent): boolean;
    private computeScrollPos;
    private onUpdateScene;
    private _repaint;
}

export declare class CodeEditor extends UiLayer2<CodeEditorProps> {
    private flask;
    private onSave;
    private onCancel;
    private saveButton;
    constructor(props: CodeEditorProps);
    load(text: string | null | undefined, onSave: ((text: string) => void) | undefined, onCancel: () => void): void;
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
    attach(container: PixiContainer, input: KeyBinder): void;
    detach(): void;
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

export type MapViewerProps = UiLayerProps & {
    mapEditorState: MapEditorState;
};
export declare class MapBitmapViewer extends UiLayer2<MapViewerProps> {
    selectedRect?: GridRect;
    private isViewDirty;
    private canvas;
    private imageData?;
    constructor(props: MapViewerProps);
    private get canvasWidth();
    private get canvasHeight();
    private updateMap;
    onMouseDown(htmlEvt: MouseEvent): boolean;
    refresh(): void;
    private _repaint;
    private drawContent;
}

export type MapEditorProps = UiLayerProps & {
    world: GameMap;
    mapEditorState: MapEditorState;
    repl: IRepl;
};
export declare function addEditorShortcuts(showKeyBindingsDef: ShowKeyBindingsDef): void;
export declare class MapEditor implements IMapEditor {
    private props;
    private isMouseDown;
    private lastEditedPos;
    private input?;
    private container?;
    private selection?;
    constructor(props: MapEditorProps);
    attach(editorContainer: PixiContainer, input: KeyBinder): void;
    detach(): void;
    private onStateChanged;
    private getGridPos;
    private updateSelection;
    onCopyRegion(): void;
    onPasteRegion(): void;
    onClearRegion(): void;
    onFillRegion(): void;
    onScroll(x: number, y: number): void;
    onMouseDown(evt: MEvent): boolean;
    onMouseUp(evt: MEvent): boolean;
    onMouseMove(evt: MEvent): boolean;
}

type NewType = {
    mapEditorState: MapEditorState;
    repl: IRepl;
};
export type MapInfoLayerProps = UiLayerProps & NewType;
export declare class MapInfoLayer extends UiLayer2<MapInfoLayerProps> {
    private xElem;
    private yElem;
    private layerElem;
    private tileElem;
    private catElem;
    constructor(props: MapInfoLayerProps);
    onUpdateMapEditorState(): void;
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
    private container;
    private map?;
    camera?: CameraLayer;
    private compositor2;
    private props;
    private interactiveAvatar?;
    private barLayer;
    private terminalLayer;
    private mapInfoLayer;
    private mapEditor?;
    private codeEditor?;
    private tileViewer?;
    private mapViewer?;
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
    setGameMap(map: GameMap): void;
    private setInteractiveAvatar;
    private populateBasicCommands;
    private loginCached;
    private onLogin;
    private onLogout;
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

export interface IGameKeyboardHandler {
    handleKeyboard(input: KeyBinder): void;
}
export type AvatarPosChanged = (avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined) => void;
export declare class Avatar implements IAvatar {
    readonly props: AvatarProps;
    get rt(): any;
    skin?: Sprite;
    nextPos?: GridPos;
    dir: MoveDirection;
    private _currentPosVersion;
    private _gameMode;
    get gameState(): AvatarGameState;
    set gameState(mode: AvatarGameState);
    private readonly posChanged;
    private cameraUpdate;
    get id(): string;
    get stepDuration(): number;
    get currentPos(): GridPos | undefined;
    set currentPos(pos: GridPos | undefined);
    get currentPosVersion(): number;
    layer?: IGameLayer;
    get tileLayer(): TileLayer;
    constructor(props: AvatarProps, posChanged: AvatarPosChanged);
    onRemoteUpdateCurrentPos(pos: GridPos | undefined): void;
    updateRuntimeProps(props: any): void;
    updateCode(code: string): void;
    attachCamera(func: AvatarPosChanged | undefined): void;
    protected getAvatarCodeFile(): string;
}

export type BallBag = {
    red: number;
    blue: number;
    black: number;
};
export declare function createBallBag(): BallBag;
export type FoodBag = {
    berry: number;
    banana: number;
};
export declare function createFoodBag(): FoodBag;
export type CharacterRuntimeProps = {
    name: string;
    balls: BallBag;
    food: FoodBag;
    activePokemons: string[];
    restingPokemons: string[];
    code: string;
};
export type CharacterProps = AvatarProps & {
    skinUrl: string;
    rt: CharacterRuntimeProps;
};
export declare class Character extends Avatar {
    get rt(): CharacterRuntimeProps;
    get characterProps(): CharacterProps;
    constructor(wireProps: WireCharacterProps, posChanged: AvatarPosChanged);
    load(): Promise<void>;
    updateRuntimeProps(props: any): void;
    updateCode(code: string): void;
    restPokemon(a2: Pokemon): void;
    caughtPokemon(pokemon: Pokemon): void;
    private clearLayer;
}

export type WireTileLayerSegment = {
    id: number;
    rect: GridRect;
    tiles: number[];
};
export type WireWorldLayerProps = {
    id: string;
    pxX: number;
    pxY: number;
    pxWidth: number;
    pxHeight: number;
};
export type WireTileLayerProps = WireWorldLayerProps & {
    gridWidth: number;
    gridHeight: number;
    cellWidth: number;
    cellHeight: number;
    segmentWidth: number;
    segmentHeight: number;
};
export type WireWorldLayer = {
    tileProps: WireTileLayerProps;
    props: WireWorldLayerProps;
    segments: WireTileLayerSegment[];
};
export type GameLayerProps = {
    mapId: string;
    id: string;
    pxX: number;
    pxY: number;
    pxWidth: number;
    pxHeight: number;
};
export type WireMapData = {
    props: MapProps;
    codeLib: MapCodeLib;
    layers: WireWorldLayer[];
};
export declare function GameLayerProps_fromWireProps(mapId: string, props: WireWorldLayerProps): GameLayerProps;
export declare enum WordLayerKind {
    unknown = 0,
    tile = 1,
    sprite = 2
}
export interface IGameLayer {
    get id(): string;
    get x(): number;
    get y(): number;
    get w(): number;
    get h(): number;
    get visible(): boolean;
    set visible(val: boolean);
    renderArea(rect: GridRect): void;
    prefetchArea(rect: GridRect): void;
    get container(): PixiContainer | undefined;
    addAvatar(avatar: IAvatar): void;
    removeAvatar(avatar: IAvatar): void;
    startEdit(): void;
    endEdit(): void;
    onAvatarPosChanged(avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined): void;
}
export declare class GameLayer<T extends GameLayerProps> implements IGameLayer {
    readonly props: T;
    protected isVisible: boolean;
    constructor(props: T);
    get id(): string;
    get x(): number;
    get y(): number;
    get w(): number;
    get h(): number;
    set visible(val: boolean);
    get visible(): boolean;
    get container(): PixiContainer | undefined;
    addAvatar(avatar: IAvatar): void;
    removeAvatar(avatar: IAvatar): void;
    renderArea(rect: GridRect): void;
    prefetchArea(rect: GridRect): void;
    startEdit(): void;
    endEdit(): void;
    onAvatarPosChanged(avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined): void;
}

export type PixelSize = {
    x: number;
    y: number;
};
export type WorldProps = {
    id: string;
    maps: string[];
};
export declare class GameMap implements IGameMap {
    readonly props: MapProps;
    readonly codeLib: MapCodeLib;
    private readonly layers;
    private viewportArea?;
    private prefetchArea?;
    private prefetchSize;
    private layerMap;
    readonly physics: GamePhysics;
    readonly mechanics: IGameMechanics;
    constructor(data: WireMapData);
    updateCode(category: CodeCategory, code: string): void;
    addLayer(layer: IGameLayer, insertAfter?: string | undefined): void;
    removeLayer(id: string): void;
    getLayer(id: string | undefined): IGameLayer | undefined;
    setViewport(pxRect: PxRect): void;
    forEachLayer(startLayer: string | undefined, func: (layer: IGameLayer) => void): void;
}

export type WireSpawnPokemonRequest = {
    pokedexId: string;
    layerId: string;
};
export type WireRemovePokemonRequest = {
    id: string;
};
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
    readonly avatarCollection: AvatarCollection;
    constructor();
    load(): Promise<boolean>;
    spawnPokemon(pokedexId: string, layerId: string, pos: GridPos): Promise<IAvatar>;
    spawnCharacter(name: string, skinUrl: string): void;
    removePokemon(p: Pokemon): void;
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
    removed = 0,
    move = 1,
    battle = 2,
    catch = 3,
    resting = 4,
    suspended = 5
}
export interface IAvatar {
    get props(): AvatarProps;
    get rt(): any;
    get id(): string;
    get stepDuration(): number;
    dir: MoveDirection;
    get currentPosVersion(): number;
    get currentPos(): GridPos | undefined;
    set currentPos(pos: GridPos | undefined);
    nextPos?: GridPos;
    gameState: AvatarGameState;
    layer?: IGameLayer;
    get tileLayer(): TileLayer;
    skin?: Sprite;
    onRemoteUpdateCurrentPos(pos: GridPos | undefined): void;
    updateCode(code: string): void;
    updateRuntimeProps(props: any): void;
    attachCamera(func: ((avatar: IAvatar) => void) | undefined): void;
}
export declare class AvatarCollection {
    private avatars;
    getAvatar(id: number | string | null | undefined): IAvatar | undefined;
    findCharacterByName(name: string): IAvatar | undefined;
    removeAvatar(avatar: IAvatar): void;
    addAvatar(avatar: IAvatar): void;
}

export type MapProps = {
    id: string;
    gridWidth: number;
    gridHeight: number;
    cellWidth: number;
    cellHeight: number;
    humanStepDuration: number;
};
export type MapCodeLib = {
    battle: string | null | undefined;
};
export interface IGameMap {
    readonly props: MapProps;
    readonly codeLib: MapCodeLib;
    readonly physics: IGamePhysics;
    readonly mechanics: IGameMechanics;
    setViewport(pxRect: PxRect): void;
    getLayer(id: string | undefined): IGameLayer | undefined;
    forEachLayer(startLayer: string | undefined, func: (layer: IGameLayer) => void): void;
    updateCode(category: CodeCategory, code: string): void;
}

export interface IGameState {
    gameMap?: IGameMap;
    avatarCollection: AvatarCollection;
    onLoaded: boolean;
    load(): Promise<boolean>;
    spawnPokemon(pokedexId: string, layerId: string, pos: GridPos): Promise<IAvatar>;
    spawnCharacter(name: string, skinUrl: string): void;
    removePokemon(p: Pokemon): void;
}
export declare function setGameState(state: IGameState): void;
export declare var gameState: IGameState;

export declare enum MessageKind {
    join = 0,
    leave = 1,
    spawnNpc = 2,
    spawnPokemon = 3,
    deletePokemon = 4,
    mapChange = 5
}
export interface IMessage {
    kind: MessageKind;
}
export interface IJoinMessage extends IMessage {
    name: string;
    avatar: string;
}
export interface ILeaveMessage extends IMessage {
    name: string;
}
export interface ISpawnPokemon extends IMessage {
    name: string;
    id: string;
    speces: string;
    x: number;
    y: number;
}
export interface IMoveHuman extends IMessage {
    name: string;
    x: number;
    y: number;
}
export type MapTile = {
    x: number;
    y: number;
    id: number;
};
export interface IMapChange extends IMessage {
    layer: string;
    tiles: MapTile[];
}

export declare enum BallKind {
    red = "red",
    blue = "blue",
    black = "black"
}
export declare enum BattleMoveType {
    normal = "normal",
    grass = "grass",
    poison = "poison",
    water = "water"
}
export type PokemonMove = {
    name: string;
    moveType: BattleMoveType;
    power: number;
    accuracy: number;
    pp: number;
};
export type PokemonRuntimeProps = {
    name: string;
    ownerId: string | null | undefined;
    hp: number;
    hpMax: number;
    moves: PokemonMove[];
    code: string;
};
export type PokemonProps = AvatarProps & {
    pokedexId: string;
    kind: PokemonKind;
    rt: PokemonRuntimeProps;
};
export declare enum PokemonKind {
    grass = "grass",
    water = "water",
    fire = "fire"
}
export type WirePokedexEntry = {
    id: string;
    value: string;
};
export type PokedexEntry = {
    id: string;
    name: string;
    kind: PokemonKind;
    battlerFrontUrl: string;
    battlerBackUrl: string;
    iconUrl: string;
    skinUrl: string;
    hp: number;
    hpMax: number;
    moves: string[];
};
export declare enum DamageResult {
    minor = 0,
    effective = 1,
    fainted = 2
}
export declare class Pokemon extends Avatar {
    get rt(): PokemonRuntimeProps;
    get pokemonProps(): PokemonProps;
    get hasOwner(): boolean;
    constructor(wireProps: WirePokemonProps, posChanged: AvatarPosChanged);
    load(): Promise<void>;
    updateRuntimeProps(props: any): void;
    updateCode(code: string): void;
    takeDamage(power: number): DamageResult;
    tryCatch(ball: BallKind): boolean;
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

export declare enum TileCategory {
    ground = "ground",
    barrier = "barrier",
    water = "water",
    sand = "sand",
    grass = "grass",
    drygrass = "drygrass",
    bush = "bush",
    tree = "tree",
    mountain = "mountain",
    house = "house",
    addon = "addon",
    ladder = "ladder",
    gen0 = "gen0",
    custom = "custom"
}
export declare function describeTileCategories(): string;
export type WireTileDefProps = {
    atlasId?: string;
    idx?: number;
    id: number;
    categories?: {
        [id: string]: boolean;
    };
    baseTile?: number;
    addOnTile?: number;
    onEnter?: string;
    onLeave?: string;
    onTimer?: string;
    timerIntervalSec?: number;
};
export type WireAddCompositeTileResponse = {
    tileId: number;
};
export declare function isAddOn(props: WireTileDefProps): boolean;
export declare function getComposedTileId(base: number | undefined, addon: number | undefined): string;
export type WireTileCollectionProps = {
    tiles: WireTileDefProps[];
};
export declare class TileDef {
    readonly props: WireTileDefProps;
    readonly sheet?: SpriteSheet;
    readonly baseTile: TileDef | undefined;
    readonly addOnTile: TileDef | undefined;
    constructor(props: WireTileDefProps, sheet: SpriteSheet | undefined, baseTile: TileDef | undefined, addOnTile: TileDef | undefined);
    categoriesAsString(): string;
}

export declare function numberArrayToString(v: number[]): string;
export type TileLayerProps = GameLayerProps & {
    gridWidth: number;
    gridHeight: number;
    cellWidth: number;
    cellHeight: number;
    segmentWidth: number;
    segmentHeight: number;
};
export declare function TileLayerProps_fromWireProps(mapId: string, props: WireTileLayerProps): TileLayerProps;
export type WireTileUpdate = {
    x: number;
    y: number;
    tileId: number;
};
export type WireTileLayerUpdate = {
    mapId: string;
    layerId: string;
    tiles: WireTileUpdate[];
};
export declare class TileLayerSegment {
    data: WireTileLayerSegment;
    private tileContainer?;
    private avatars;
    get loaded(): boolean;
    constructor(data: WireTileLayerSegment);
    load(parent: PixiContainer): void;
    unload(parent: PixiContainer): void;
    private loadTiles;
    getTile(x: number, y: number): number;
    setTile(x: number, y: number, tileId: number): void;
    addAvatar(avatar: IAvatar): void;
    removeAvatar(avatar: IAvatar): void;
    getAvatarByPos(x: number, y: number): IAvatar | undefined;
}
export declare class TileLayer extends GameLayer<TileLayerProps> {
    private pendingChange?;
    private dirty;
    private _segments;
    private _segmentPrefetchRect?;
    private readonly layerContainer;
    private readonly segmentContainer;
    private segmentStride;
    private readonly spriteContainer;
    constructor(props: TileLayerProps);
    get container(): PixiContainer | undefined;
    loadSegments(segments: WireTileLayerSegment[]): void;
    prefetchArea(prefetchRect: GridRect): void;
    private prefetchSegments;
    addAvatar(avatar: IAvatar): void;
    removeAvatar(avatar: IAvatar): void;
    onAvatarPosChanged(avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined): void;
    getAvatarToPos(x: number, y: number): IAvatar | undefined;
    setTile(x: number, y: number, tileId: number | undefined): void;
    getTile(x: number, y: number): TileDef | undefined;
    private _getSegment;
    private _getTile;
    private _setTile;
    forEachTile(reg: GridRect, func: (tileId: number) => void): void;
    clearRegion(reg: GridRect): void;
    fillRegion(reg: GridRect, tileId: number): void;
    updateRegion(pos: GridPos, tileBuffer: TileBuffer): Promise<boolean>;
    getRegion(rect: GridRect): TileBuffer;
    startEdit(): void;
    endEdit(): void;
    private updateTile;
    private flushPendingQueueIf;
}
