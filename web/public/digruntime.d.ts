/// <reference types="webxr" />
export declare var gameApp: GameApp;

export declare class GameApp {
    private gameContainer;
    initializeApp(gameContainer: HTMLDivElement): void;
    private resizeCanvas;
}

export declare function boxedGame(): void;
export declare function boxedBasic(): string;
export declare function boxedMonkey(): string;
export declare function boxedBread(): string;
export declare function boxedBasic2(): string;

export declare function getTopLevelActions(): IAction[];
export declare function registerActions(): void;

export declare class CodeEditor {
    private _textModule;
    private _selectedNode;
    private initialSelectedNode;
    private _selectedElem;
    readonly editEditor: HTMLDivElement;
    private readonly editArea;
    private _textEditActive;
    private _textDirty;
    private _module?;
    constructor();
    loadContent(): void;
    copyText(): void;
    cutText(): void;
    pasteText(): void;
    deleteText(): void;
    addAbove(): void;
    addBelow(): void;
    addTemplate(astFunc: (module: ModuleNode) => AstNode): void;
    editText(): void;
    addBlock(text: string): void;
    private onEditTextCompleted;
    private renderNode;
    private onTextInput;
    private onTextScroll;
    private onTextClick;
    private selectNode;
    private static isParentText;
}

export type BasicActionParams = {
    tags?: string[];
    closePane?: boolean;
};
export declare abstract class BasicAction implements IAction {
    private readonly _name;
    private readonly _tags;
    private readonly closePane;
    get name(): string;
    get tags(): string[];
    private button;
    get element(): HTMLElement | undefined;
    constructor(name: string, params: BasicActionParams);
    renderButton(bar: ICommandLayer): HTMLElement;
    destroyButton(): void;
    getChildActions(): Iterable<IAction>;
    protected onClick(bar: ICommandLayer): void;
}
export declare class MenuAction extends BasicAction {
    private isExtended;
    private children;
    constructor(name: string, tags: string[], children: IAction[]);
    getChildActions(): Iterable<IAction>;
    protected onClick(bar: ICommandLayer): void;
}
export declare class FolderAction implements IAction {
    private isExtended;
    private readonly _name;
    private readonly _tags;
    get name(): string;
    get tags(): string[];
    private container;
    private add;
    private button;
    get element(): HTMLElement | undefined;
    constructor(name: string);
    renderButton(bar: ICommandLayer): HTMLElement;
    destroyButton(): void;
    getChildActions(): Iterable<IAction>;
    protected onClick(bar: ICommandLayer): void;
    protected onAdd(bar: ICommandLayer): void;
}
export declare class FuncAction extends BasicAction {
    private _func;
    constructor(name: string, params: BasicActionParams, func: (ICommandLayer: any) => void);
    protected onClick(bar: ICommandLayer): void;
}
export declare class PaneAction extends BasicAction {
    private _func;
    private _opened;
    private _lastElem;
    constructor(name: string, func: (ICommandLayer: any) => HTMLElement);
    protected onClick(bar: ICommandLayer): void;
}

export type CommandBarProps = UiLayerProps & {
    shellProps: ShellProps;
};
export declare class CommandLayer extends UiLayer2<CommandBarProps> implements ICommandLayer {
    private bar;
    private pane;
    private homeButton;
    private startButton;
    private pauseButton;
    private levelButton;
    private spriteButton;
    private cameraButton;
    private _commandList;
    private _getCommandListActions;
    private _detailsPane;
    private _fullHeight;
    private _fullWidth;
    constructor(props: CommandBarProps);
    displayError(text: string): void;
    openDetailsPane(elem: HTMLElement, kind: DetailsPaneKind): void;
    closeDetailsPane(): HTMLElement | undefined;
    pushActions(actions: IAction[]): void;
    openMenu(group: IMenuAction): void;
    closeMenu(group: IMenuAction): void;
    private createButtons;
    private onAppModeChanged;
    private onKeyDown;
    private onCommandStart;
    private onCommandPause;
    private closeCommandList;
    private openCommandList;
    private onLevel;
    private onSprite;
    private onCamera;
    private updateCommandButtons;
    private getCommandListWidth;
    private getPropertyPaneWidth;
    protected updateElementSize(): void;
}

export declare class CommandList {
    private navStack;
    private renderedActions;
    private props;
    private wrapperDiv;
    private listDiv;
    private opened;
    private readonly layer;
    get isOpened(): boolean;
    get navStackDepth(): number;
    constructor(props: CommandBarProps, layer: ICommandLayer);
    open(parent: HTMLElement): void;
    close(parent: HTMLElement): false | undefined;
    pushActions(actions: IAction[]): void;
    loadActions(actions: IAction[]): void;
    popActions(): void;
    openMenu(group: IMenuAction): void;
    closeMenu(group: IMenuAction): void;
    private renderList;
    private updateListSize;
}

export declare class CreateProjectAction extends BasicAction {
    get name(): string;
    get tags(): string[];
    constructor();
    protected onClick(bar: ICommandLayer): void;
    private createProject;
}
export declare function createDefaultProject(): Promise<void>;
export declare class CreateLevelAction extends BasicAction {
    constructor();
    protected onClick(bar: ICommandLayer): void;
    private createLevel;
    static createLevelParams(name: string, sx: number, sz: number): Promise<void>;
}

export declare class SelectBlockAction extends BasicAction {
    get name(): string;
    get tags(): string[];
}
export declare class EditBlockAction extends BasicAction {
    constructor();
    protected onClick(bar: ICommandLayer): void;
}
export declare function registerEditActions(actions: IAction[]): void;

export declare function registerEditCodeActions(actions: IAction[]): void;
export declare class AddAstAction extends BasicAction {
    private tmpl;
    private editor;
    constructor(editor: CodeEditor, t: AstTemplate);
    protected onClick(bar: ICommandLayer): void;
}
export declare class EditCodeAction extends BasicAction {
    private codeEditor?;
    get name(): string;
    get tags(): string[];
    constructor();
    protected onClick(bar: ICommandLayer): void;
    editCode(): void;
}

export declare function getLevelActions(): IAction[];

export declare function getSpriteActions(): IAction[];

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
export declare class FormAction implements IAction {
    private button;
    private propPage;
    private _name;
    private _tags;
    private createForm;
    get element(): HTMLElement | undefined;
    get name(): string;
    get tags(): string[];
    constructor(name: string, tags: string[], createForm: (cl: ICommandLayer) => FormPane);
    renderButton(bar: ICommandLayer): HTMLElement;
    destroyButton(): void;
    getChildActions(): Iterable<IAction>;
    private onClick;
}

export declare class RunGameAction extends BasicAction {
    constructor();
    protected onClick(bar: ICommandLayer): void;
}

export interface IAction {
    get name(): string;
    get tags(): string[];
    get element(): HTMLElement | undefined;
    renderButton(bar: ICommandLayer): HTMLElement;
    destroyButton(): any;
    getChildActions(): Iterable<IAction>;
}
export declare enum DetailsPaneKind {
    Partial = 0,
    Full = 1
}
export interface IMenuAction extends IAction {
    getChildActions(): Iterable<IAction>;
}
export interface ICommandLayer {
    displayError(text: string): any;
    openDetailsPane(elem: HTMLElement, kind: DetailsPaneKind): void;
    closeDetailsPane(): HTMLElement | undefined;
    pushActions(actions: IAction[]): any;
    openMenu(group: IAction): any;
    closeMenu(group: IAction): any;
}

export declare class ImportVoxAction implements IAction {
    private static _nextId;
    private _name;
    private _id;
    private _element;
    private _inputElem;
    private _labelElem;
    private _paneElem;
    private _filesElem;
    get tags(): string[];
    get name(): string;
    get element(): HTMLElement | undefined;
    constructor(name: string);
    renderButton(bar: ICommandLayer): HTMLDivElement;
    destroyButton(): void;
    getChildActions(): Iterable<IAction>;
    private createImportButton;
    private processImport;
    private loadVox;
    static renderThumbnail(vox: Vox, tr: ThumbnailRenderer, file: ImportFile, rotateYZ: boolean): Promise<ImageData | string | undefined>;
    private displayPane;
    private renderFiles;
    static upload(importFiles: ImportFile[]): Promise<WireModelInfo[] | undefined>;
}

export declare class ThirdPersonCameraAction extends BasicAction {
    constructor();
    protected onClick(bar: ICommandLayer): void;
}
export declare function moveCameraForm(bar: ICommandLayer): FormPane;

export declare enum AstErrorCode {
    generic = 0,
    invalidNode = 1
}
export declare class AstError {
    readonly msg: string;
    readonly code: AstErrorCode;
    readonly ast: AstNode | undefined;
    constructor(code: AstErrorCode, ast: AstNode | undefined, msg: string);
}
export declare enum AstNodeKind {
    module = 0,
    paramDef = 1,
    funcDef = 2,
    typeDef = 3,
    varDef = 4,
    return = 5,
    break = 6,
    assingment = 7,
    call = 8,
    op = 9,
    const = 10,
    id = 11,
    expression = 12,
    block = 13,
    if = 14,
    for = 16,
    forever = 17,
    foreach = 18,
    while = 19,
    on = 20,
    comment = 21,
    linePlaceholder = 100,
    idPlaceholder = 101,
    expressionPlaceholder = 102,
    paramPlaceholder = 103,
    bodyPlaceholder = 104
}
export declare function makeAstId(): number;
export type AstNode = {
    kind: AstNodeKind;
    startToken: Token;
    id: number;
    parent?: AstNode;
};
export type CommentNode = AstNode & {
    text?: string;
};
export type LinePlaceholderNode = AstNode & {
    text?: string;
};
export type ModuleNode = AstNode & {
    name: string | undefined;
    types: TypeDefNode[];
    funcs: FuncDefNode[];
    vars: VarDefNode[];
    on: OnNode[];
};
export type ParamDefNode = AstNode & {
    name: Token;
    paramType: Token;
};
export type FuncDefNode = AstNode & {
    module: ModuleNode;
    name: Token | undefined;
    returnType: Token | undefined;
    params: ParamDefNode[];
    isAsync: boolean;
    body: BlockNode | Function;
};
export type OnNode = FuncDefNode & {
    event: Token;
    filter: Token | undefined;
};
export type FieldDef = {
    name: Token;
    fieldType: Token;
};
export type TypeDefNode = AstNode & {
    digName: Token;
    systemType: Function | undefined;
    fields: FieldDef[];
};
export type VarDefNode = AstNode & {
    name: Token;
    value: ExpressionNode | undefined;
};
export type ReturnNode = AstNode & {
    value: ExpressionNode | undefined;
};
export type AssingmentNode = StatementNode & {
    name: Token;
    value: ExpressionNode;
};
export type CallParamNode = ExpressionNode & {
    name: Token | undefined;
};
export type CallNode = StatementNode & {
    name: Token;
    params: CallParamNode[];
    funcDef?: FuncDefNode;
};
export type OpNode = AstNode & {
    op: Token;
};
export type ConstNode = AstNode & {
    value: Token;
};
export declare function makeConstNode(token: Token): ConstNode;
export type IdNode = AstNode & {
    name: Token;
};
export declare function makeIdNode(token: Token): IdNode;
export type ExpressionNode = AstNode & {
    left: AstNode | undefined;
    op: OpNode | undefined;
    right: AstNode | undefined;
};
export type BlockNode = AstNode & {
    statements: StatementNode[];
};
export type IfNode = StatementNode & {
    exp: ExpressionNode;
    th: BlockNode;
    elif: {
        exp: ExpressionNode;
        block: BlockNode;
    }[];
    el: BlockNode | undefined;
};
export type ForNode = StatementNode & {
    name: Token;
    startExp: ExpressionNode;
    endExp: ExpressionNode;
    byExp: ExpressionNode | undefined;
    body: BlockNode;
};
export type ForeverNode = StatementNode & {
    body: BlockNode;
};
export type ForeachNode = StatementNode & {
    name: Token;
    exp: ExpressionNode;
    body: BlockNode;
};
export type WhileNode = StatementNode & {
    exp: ExpressionNode;
    body: BlockNode;
};
export declare function insertPlaceholderBefore(before: AstNode): AstNode;
export declare function getChildNodes(ast: AstNode): Iterable<AstNode>;
export declare function getModule(ast: AstNode): ModuleNode | undefined;
export declare function replaceNode(cur: AstNode, upd: AstNode): void;

export declare function parseModule(parser: BasicParser): ModuleNode;
export declare function parseFuncDef(parser: BasicParser, module: ModuleNode): FuncDefNode;
export declare function parseVarDef(parser: BasicParser): VarDefNode;
export declare function parseOnDef(parser: BasicParser, module: ModuleNode): OnNode;
export declare function parseStatement(token: Token, parser: BasicParser): StatementNode | undefined;
export declare class BasicGenerator {
}

export declare enum EolRule {
    Inherit = 0,
    WhiteSpace = 1,
    Token = 2
}
export declare enum SemiRule {
    Inherit = 0,
    End = 1,
    Disallow = 2
}
export type ParserRules = {
    eolRule?: EolRule;
    semiRule?: SemiRule;
    endTokens?: TokenKind[];
};
export declare enum EndRule {
    Pass = 0,
    Inherit = 1
}
export declare enum IsEndTokenResult {
    No = 0,
    Direct = 1,
    Inherited = 2
}
export declare class ParserContext {
    prev: ParserContext | undefined;
    name: string | undefined;
    endTokens: TokenKind[] | undefined;
    inheritEndTokens: boolean;
    ignoreEol: boolean;
    isEos: boolean;
    isGreedy: boolean;
    endResult: IsEndTokenResult;
    constructor(prev?: ParserContext | undefined, name?: string | undefined);
    isEndToken(token: Token): boolean;
    isEndTokenDeep(token: Token): IsEndTokenResult;
}
export declare class BasicParser {
    readonly tokenizer: BasicLexer;
    private nextIdx;
    private _token;
    private tokens;
    private ctx;
    callDepth: number;
    constructor(tokenizer: BasicLexer);
    withContextGreedy<T>(token: Token, func: (parser: BasicParser, ...args: any[]) => T, ...args: any[]): T;
    withContext<T>(name: string, token: Token, func: (parser: BasicParser, ...args: any[]) => T, ...args: any[]): T;
    withContextGreedy2<T>(name: string, token: Token, func: (parser: BasicParser, ...args: any[]) => T, ...args: any[]): T;
    pushContext(name?: string | undefined): void;
    popContext(): void;
    setEndRule(tokens: TokenKind[], inherit?: boolean): void;
    ignoreEol(val: boolean): void;
    moveTo(token: Token): void;
    get token(): Token;
    triggerEos(): void;
    tryRead(): Token | undefined;
    read(): Token;
    readKind(...kind: TokenKind[]): Token;
    peek(): Token | undefined;
    peekKind(kind: TokenKind): boolean;
    private isWsToken;
}

export declare function validateModule(module: ModuleNode, loader: ICodeLoader | undefined): void;

export declare class CodeLoader implements ICodeLoader {
    private readonly _systemModules;
    private readonly _userModules;
    private readonly modules;
    addSystemModule(ast: ModuleNode): void;
    addUserModule(name: string, text: string | ModuleNode): void;
    updateUserModule(node: AstNode, text: string): void;
    getUserModule(name: string): ModuleNode | undefined;
    systemModules(): Iterable<ModuleNode>;
    userModules(): Iterable<ModuleNode>;
    userFunctions(): Iterable<FuncDefNode>;
    functions(): Iterable<FuncDefNode>;
    vars(): Iterable<VarDefNode>;
    userOns(): Iterable<OnNode>;
    imports(): Iterable<ModuleNode>;
    getModule(name: string): {
        [key: string]: Function;
    };
    getFunction(): Function;
}

export type MessageHandler = (...args: any[]) => Promise<void>;
export type StartHandler = () => Promise<void>;
export type LoadHandler = () => Promise<void>;
export type RuntimeModule = {
    [key: string]: Function;
};
export declare class CodeRunner implements ICodeRunner {
    private readonly _startHandlers;
    private readonly _loadHandlers;
    private _messageHandlers;
    load(loader: ICodeLoader | Function): Promise<void>;
    reset(): void;
    sendMesssage(address: string, ...args: any[]): Promise<void>;
    onMessage(address: string, func: MessageHandler): void;
    onLoad(func: () => Promise<void>): void;
    onStart(func: () => Promise<void>): void;
    start(): Promise<void>;
}

export declare function isParentNode(parent: TextBlock | ATextSegment | TextSpan, node: TextBlock | ATextSegment | TextSpan): boolean;
export declare function findParentNode(node: TextBlock | ATextSegment | TextSpan): TextBlock | ATextSegment | undefined;
export declare function renderNode(rb: TextBlock, ast: AstNode): TextBlock | TextLine;
export declare function renderModule(ast: ModuleNode): TextModule;

interface IDigSprite {
    get x(): number;
    get y(): number;
    get z(): number;
    get name(): string;
    get id(): number;
}
interface IDigBlock {
    get x(): number;
    get y(): number;
    get z(): number;
}
interface IDigBoundary {
    get x(): number;
    get y(): number;
    get z(): number;
}

export type AstTemplate = {
    name: string;
    ast: (module: ModuleNode) => AstNode;
};
export declare function varTemplateAst(module: ModuleNode): VarDefNode;
export declare function functionTemplateAst(module: ModuleNode): FuncDefNode;
export declare function eventTemplateAst(module: ModuleNode, name: string, filter?: string): OnNode;
export declare function eventTemplates(): AstTemplate[];
export declare function statementInsertSuggestion(): ({
    name: string;
    template: string;
} | {
    name: string;
    template?: undefined;
})[];
export declare function ifEditSuggestion(): {
    name: string;
}[];

export declare class JsWriter {
    private output;
    append(s: string): void;
    toString(): string;
}
export declare class CodeLib {
    getCode(name: string): string;
}

export declare function isOpTokenKind(kind: TokenKind): boolean;
export declare function isConstTokenKind(kind: TokenKind): boolean;
export declare class StringReader {
    private source;
    private _pos;
    constructor(source: string);
    get pos(): number;
    get isEol(): boolean;
    readNext(): string;
    peekNext(): string;
    move(n: number): void;
    compare(s: string): boolean;
    skipWs(): number;
    static isWs(c: string): boolean;
}
export declare class BasicLexer {
    private readonly _tokens;
    static load(source: string): BasicLexer;
    get tokens(): Token[];
    private loadTokens;
    private readNext;
    private readId;
    private getIdKind;
    private readString;
    private readNumber;
}

export declare enum ParseErrorCode {
    Unknown = 0,
    NoStringEnding = 1,
    ReadEos = 2,
    WrongToken = 3,
    InvalidArg = 4,
    InvalidExpression = 5,
    InvalidFuncParams = 6,
    InvalidToken = 7,
    UnknownFunctionName = 8,
    NotImpl = 9
}
export declare class ParseError {
    readonly msg: string;
    readonly code: ParseErrorCode;
    readonly token: string | undefined;
    constructor(code: ParseErrorCode, token: Token | undefined, msg: string);
}
export declare function throwUnexpectedError(token: Token, exp: string): void;

type clickHandler = (node: TextBlock | ATextSegment | TextSpan, event: Event) => void;
export type TextStyle = {
    spaceLeft?: boolean;
    selectable?: boolean;
    css?: string;
    insertAbove?: boolean;
    insertBelow?: boolean;
    placeholder?: boolean;
};
export declare enum ChangeStatus {
    clean = 0,
    dirty = 1,
    deleted = 2
}
export declare function parentAstSegment(elem: TextBlock | ATextSegment | TextSpan): ATextSegment | undefined;
export declare class TextSpan {
    readonly id: string;
    readonly parent: ATextSegment;
    private data;
    private style;
    changeStatus: ChangeStatus;
    static fromString(parent: ATextSegment, val: string, style: TextStyle): TextSpan;
    constructor(parent: ATextSegment, token: Token, style: TextStyle);
    insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined;
    render(onClick: clickHandler): HTMLSpanElement | HTMLDivElement;
}
export declare abstract class ATextSegment {
    readonly module: TextModule;
    readonly id: string;
    readonly parent: ATextSegment | TextBlock;
    protected segments: (TextSpan | TextSegment)[];
    readonly ast: AstNode | undefined;
    readonly style: TextStyle;
    changeStatus: ChangeStatus;
    constructor(parent: ATextSegment | TextBlock, ast: AstNode | undefined, style: TextStyle, prefix: string);
    abstract render(onClick: clickHandler): HTMLSpanElement | HTMLDivElement;
    abstract appendSegment(ast: AstNode | undefined, style: TextStyle): ATextSegment;
    abstract appendConst(val: string, style: TextStyle): void;
    abstract appendToken(token: Token, style: TextStyle): any;
    abstract insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined;
    clearChildren(): void;
    updateHtmlDom(domNode: HTMLDivElement | HTMLSpanElement, onClick: clickHandler): void;
}
export declare class TextSegment extends ATextSegment {
    constructor(parent: ATextSegment | TextBlock, ast: AstNode | undefined, style: TextStyle);
    appendSegment(ast: AstNode | undefined, style: TextStyle): ATextSegment;
    appendConst(val: string, style: TextStyle): void;
    appendToken(token: Token, style: TextStyle): void;
    insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined;
    render(onClick: clickHandler): HTMLSpanElement | HTMLDivElement;
}
export declare class TextLine extends ATextSegment {
    constructor(parent: TextBlock, ast: AstNode | undefined, style?: TextStyle);
    insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined;
    appendSegment(ast: AstNode | undefined, style: TextStyle): ATextSegment;
    appendConst(val: string, style: TextStyle): void;
    appendToken(token: Token, style: TextStyle): TextSpan;
    render(onClick: clickHandler): HTMLDivElement | HTMLSpanElement;
}
export declare class TextBlock {
    readonly module: TextModule;
    readonly id: string;
    readonly parent: TextBlock | undefined;
    readonly ast: AstNode;
    readonly style: TextStyle;
    changeStatus: ChangeStatus;
    private margin;
    readonly children: (ATextSegment | TextBlock)[];
    renderBlock?: () => void;
    constructor(module: TextModule, parent: TextBlock | undefined, root: AstNode, style?: TextStyle);
    insertLineAbove(cur: TextBlock | ATextSegment | undefined): AstNode | undefined;
    clearChildren(): void;
    appendBlock(ast: AstNode, style?: TextStyle): TextBlock;
    appendEmptyLine(ast: AstNode | undefined, style: TextStyle): TextLine;
    appendLine(line: TextLine | string | Token | undefined, ast: AstNode | undefined, style: TextStyle): TextLine;
    render(onClick: clickHandler): HTMLDivElement | HTMLSpanElement;
    updateHtmlDom(domNode: HTMLDivElement, onClick: clickHandler): void;
}
export declare class TextModule {
    private readonly nodes;
    private _root;
    get root(): TextBlock;
    constructor();
    getNodeById(id: number): TextBlock | ATextSegment | TextSpan | undefined;
    setNode(id: number, node: TextBlock | ATextSegment | TextSpan): Map<number, TextBlock | ATextSegment | TextSpan>;
    removeNode(ast: AstNode): void;
    setRoot(node: TextBlock): void;
}

export declare enum TokenKind {
    Eol = 1,
    Eof = 2,
    Ws = 3,
    Equal = 4,
    NotEqual = 5,
    Less = 6,
    Greater = 7,
    LessOrEqual = 8,
    GreaterOrEqual = 9,
    Or = 10,
    And = 11,
    Not = 12,
    Is = 13,
    Plus = 14,
    Minus = 15,
    Div = 16,
    Mul = 17,
    Assign = 18,
    Comma = 19,
    Semi = 20,
    Colon = 21,
    LeftParen = 22,
    RightParen = 23,
    LeftSquiggly = 24,
    RightSquiggly = 25,
    LeftSquare = 26,
    RightSquare = 27,
    String = 28,
    Number = 29,
    Boolean = 30,
    True = 31,
    False = 32,
    Break = 50,
    Id = 51,
    For = 52,
    Foreach = 53,
    Forever = 54,
    In = 55,
    To = 56,
    By = 57,
    Do = 58,
    While = 59,
    If = 60,
    Then = 61,
    Else = 62,
    ElIf = 63,
    End = 64,
    Begin = 65,
    Function = 66,
    Var = 67,
    Return = 68,
    On = 69,
    Event = 70,
    IdPlaceholder = 100,
    ParamPlaceholder = 101,
    ExpPlaceholder = 102,
    StatementPlaceholder = 103
}
export declare class Token {
    readonly kind: TokenKind;
    readonly value: string;
    readonly pos: number;
    idx: number;
    constructor(kind: TokenKind, value: string, pos: number);
    static makeWs(): Token;
}

export declare function transpile(mainFunction: string | undefined, loader: ICodeLoader): Function;

export declare function updateAst(ast: AstNode, text: string, loader: ICodeLoader): AstNode | undefined;

export declare function registerSystemModules(loader: ICodeLoader): void;

export declare function createMath(): ModuleNode;

export declare function createPhysicsModule(): ModuleNode;

export declare function createSpriteModule(): ModuleNode;

export declare function createSystemModule(): ModuleNode;

export declare function createModuleNode(name: string): ModuleNode;
export declare function addSystemType(digName: string, systemType: Function, fields: string[]): TypeDefNode;
export declare function addSystemFunc(module: ModuleNode, name: string, params: string[], rval: string, isAsync: boolean, impl: Function): FuncDefNode;

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

export declare class DirectCamera implements ITrackingCamera {
    private camera;
    private cameraGroup;
    constructor(camera: PerspectiveCamera, cameraGroup: Group);
    dispose(): void;
    onTargetMove(pos: Vector3): void;
    onTargetSpeed(pos: Vector3): void;
    onTargetDirectionXZ(angle: number): void;
}

export declare const epsilon = 0.01;
export declare const nepsilon = -0.01;
export declare class GamePhysics implements IGamePhysics {
    private level;
    private bodies;
    private projectiles;
    private broadphase;
    private gravity;
    private _collideHandler;
    private static collideHandlerSymbol;
    constructor(level: IVoxelLevel);
    setGravity(val: number): void;
    addRigitObject(ro: IRigitBody): void;
    removeRigitObject(ro: IRigitBody): void;
    addProjectile(ro: IRigitBody): void;
    removeProjectile(ro: IRigitBody): void;
    setCollideHandler(func: RigitCollisionHandler | undefined): void;
    update(dt: number): void;
    private handleMapCollisions;
    private handleMapCollision;
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

export interface ICameraLayer {
    get scene(): Scene | undefined;
    get camera(): PerspectiveCamera;
    get cameraGroup(): Group;
    get canvas(): HTMLDivElement;
    get viewSize(): PxSize;
    get scale(): number;
    get position(): Vector3;
    set position(pos: Vector3);
    registerXrSessionHandler(target: any, func: (session: XRSession | undefined) => void): void;
    editCamera(): any;
    createScene(): any;
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
export type RigitCollisionHandler = (collisions: {
    source: IRigitBody;
    target: IRigitBody;
}[]) => void;
export interface IGamePhysics {
    setGravity(val: number): void;
    addRigitObject(ro: IRigitBody): void;
    removeRigitObject(ro: IRigitBody): void;
    addProjectile(ro: IRigitBody): void;
    removeProjectile(ro: IRigitBody): void;
    update(tick: number): void;
}
export interface IGameCollisionHandler {
}

export interface IRealtimeClient {
}

export interface IRigitModel {
    get size(): Vector3;
    get bottomPoints(): Coord3[];
    load(uri: string): Promise<void>;
    animate(id: string): any;
    addAnimation(name: string): any;
    addFrame(name: string, idx: number, duration: number): any;
    aabb(pos: Vector3 | undefined): RigitAABB;
    addToScene(scene: Scene): any;
    removeFromScene(scene: Scene): any;
    setPosition(pos: Vector3): void;
    setSpeed(speed: Vector3): void;
    setDirectionXZ(angle: number): void;
    setRotationXZ(angle: number): void;
    update(): void;
    onRenderFrame(tick: number): any;
}

export interface IInputController {
    start(): any;
    stop(): any;
    onXrSessionChanged(session: XRSession | undefined): any;
    update(tick: number): any;
}
export declare enum AppMode {
    run = 0,
    stop = 1,
    pause = 2,
    edit = 3
}
export interface ICodeLoader {
    addUserModule(name: string, text: string | ModuleNode): any;
    addSystemModule(module: ModuleNode): any;
    getUserModule(name: string): ModuleNode | undefined;
    systemModules(): Iterable<ModuleNode>;
    userModules(): Iterable<ModuleNode>;
    userFunctions(): Iterable<FuncDefNode>;
    functions(): Iterable<FuncDefNode>;
    vars(): Iterable<VarDefNode>;
    userOns(): Iterable<OnNode>;
    imports(): Iterable<ModuleNode>;
    getFunction(): Function;
}
export interface ICodeRunner {
    sendMesssage(address: string, msg: any): Promise<void>;
    onLoad(func: () => Promise<void>): any;
    onStart(func: () => Promise<void>): any;
    onMessage(address: string, func: (msg: any) => Promise<void>): any;
}
export interface IVM {
    get level(): IVoxelLevel;
    get physics(): IGamePhysics;
    get canvas(): HTMLElement;
    get clock(): FrameClock;
    get levelFile(): IVoxelLevelFile;
    get camera(): ICameraLayer;
    get loader(): ICodeLoader;
    get runner(): ICodeRunner;
    get levelEditor(): ILevelEditor | undefined;
    get appMode(): AppMode;
    attachCamera(camera: ICameraLayer): void;
    registerLevelLoaded(target: any, func: () => void): void;
    registerModeChanged(target: any, func: () => void): void;
    setController(controller: IInputController): any;
    loadProject(id: string): Promise<void>;
    loadLevel(id: string): Promise<void>;
    edit(): any;
    start(): Promise<void>;
    stop(): void;
    pause(): void;
    onRenderFrame(): void;
    createSprite(name: string, uri: string, rm: IRigitModel | undefined, rigitKind?: RigitBodyKind): Promise<Sprite3>;
    removeSprite(sprite: Sprite3): any;
    forever(func: () => Promise<void>): Promise<void>;
    sendMesssage(address: string, msg: any): Promise<void>;
    waitCollide(sprite: Sprite3, timeout: number | undefined): Promise<IRigitBody | null>;
    createExplosion(pos: Vector3): void;
    sleep(seconds: number): Promise<void>;
}
export declare let vm: IVM;
export declare function setVM(val: IVM): void;

export declare class MeshLevelLayer {
    private size;
    private blockSize;
    private blocks;
    private _mesh;
    private _meshDirty;
    private material;
    dirty: boolean;
    private sliceCount;
    private sliceZSize;
    readonly layerY: number;
    constructor(material: MeshPhongMaterial, size: GridSize, layerY: number, blockSize: number);
    build(): void;
    private buildSlice;
    addToScene(scene: Scene): void;
    removeFromScene(scene: Scene): void;
    updateScene(scene: Scene): void;
    getHeight(point: WorldCoord3): number;
    getBlockByPoint(point: WorldCoord3): MapBlockCoord | undefined;
    getBlockByPos(xBlock: number, zBlock: number): MapBlockCoord | undefined;
    deleteBlock(block: MapBlockCoord): void;
    deleteBlockByPos(xPos: number, zPos: number): void;
    addBlock(pos: BlockPos3, block: VoxelModel): void;
}

export interface IMoveEvent2D {
    get speedX(): number;
    get speedZ(): number;
}
export declare class MoveEvent2D implements IMoveEvent2D {
    speedX: number;
    speedZ: number;
}
export type MoveControllerConfig = {
    keySpeedX: number;
    keySpeedZ: number;
    keySpeedXZ: number;
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

export interface ITrackingCamera {
    onTargetMove(pos: Vector3): void;
    onTargetSpeed(pos: Vector3): void;
    onTargetDirectionXZ(angle: number): void;
    dispose(): void;
}
export declare class Sprite3 implements IRigitBody, IDigSprite {
    private static _nextId;
    private _id;
    private _name;
    owner: any;
    readonly rigit: IRigitModel | undefined;
    private _inactive;
    private _rigitKind;
    private _speed;
    private _physicsSpeed;
    private _standing;
    private _angleXZ;
    private _position;
    private _trackingCamera;
    get id(): number;
    get name(): string;
    get rigitKind(): RigitBodyKind;
    get relativeSpeed(): Vector3;
    get position(): Vector3;
    get modelSize(): Vector3;
    get gravityFactor(): number;
    get maxClimbSpeed(): number;
    get physicsSpeed(): Vector3;
    get x(): number;
    get y(): number;
    get z(): number;
    get angleXZ(): number;
    get standing(): boolean;
    getWorldSpeed(): Vector3;
    constructor(name: string, rigit?: IRigitModel, rigitKind?: RigitBodyKind);
    load(uri: string): Promise<void>;
    addToScene(scene: Scene): void;
    removeFromScene(scene: Scene): void;
    onRender(tick: number): void;
    setPosition(pos: Vector3): void;
    setPhysicsSpeed(speed: Vector3 | undefined): void;
    setStanding(val: boolean): void;
    setRelativeSpeed(speed: Vector3): void;
    setDirectionXZ(angle: number): void;
    aabb(pos: Vector3 | undefined): RigitAABB;
    setTrackingCamera(camera: ITrackingCamera | undefined): void;
    onMove(pos: Vector3): void;
}

type WireSpriteFile = {
    id: number;
    code: string;
    skins: {
        id: string;
        url: string;
    }[];
};
export declare class SpriteFile {
    private id;
    private name;
    private _code;
    private _skins;
    private get url();
    constructor(id: number, file?: WireSpriteFile);
    static load(id: number): Promise<SpriteFile>;
    private loadWorker;
    save(): Promise<void>;
    addSkin(skinName: string, url: string): Promise<void>;
    removeSkin(skinName: string): Promise<void>;
    createSprite(skinName: string): Sprite3;
}
export declare class SpriteFileCollection {
    private sprites;
    load(): Promise<void>;
    createSprite(name: string): Promise<SpriteFile>;
}
export declare let spriteFiles: SpriteFileCollection;

export declare class ThirdPersonCamera implements ITrackingCamera {
    private camera;
    private cameraGroup;
    private sprite;
    private cameraOffset;
    private spritePosition;
    private angleXZ;
    constructor(sprite: Sprite3, cameraOffset: Vector3, camera: PerspectiveCamera, cameraGroup: Group);
    dispose(): void;
    onTargetMove(pos: Vector3): void;
    onTargetSpeed(speed: Vector3): void;
    onTargetDirectionXZ(angle: number): void;
    private updateCameraPos;
}

export declare class ThirdPersonControllerMoveEvent {
    readonly speedX: number;
    readonly speedZ: number;
    readonly angleXZ: number;
    readonly fire: boolean;
    constructor(speedX: number, speedZ: number, angleXZ: number, fire: boolean);
}
export type ThirdPersonControllerConfig = {
    maxSpeed: number;
    keySpeed: number;
    keySpeedXZ: number;
    thumbSpeed: number;
    timeoutSeconds: number;
};
export declare class ThirdPersonController implements IGamePhysicsInputController, IInputController {
    private input;
    private xrSession;
    private gamePads;
    private config;
    private lastTick;
    private timeoutMilliseconds;
    private started;
    private angleXZ;
    private speedX;
    private speedZ;
    private pointer;
    private sprite;
    private spriteOffset;
    private trackingCamera;
    constructor(config: ThirdPersonControllerConfig);
    onXrSessionChanged(session: XRSession | undefined): void;
    start(): void;
    stop(): void;
    followSprite(sprite: Sprite3, offset: Vector3): void;
    private onXrInputChanged;
    readInput(): Promise<ThirdPersonControllerMoveEvent | undefined>;
    private computeEvent;
    update(tick: number): undefined;
    private attachGamepad;
}
export declare function createThirdPersonControllerModule(): ModuleNode;

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

export declare class NotRunningError extends Error {
}
export declare class VM implements IVM {
    private _appMode;
    private _ticker;
    private _physics;
    private _canvas;
    private _level?;
    private _levelFile?;
    private _camera?;
    private readonly _createDefaultProject;
    private readonly _sprites;
    private readonly _runner;
    private readonly _loader;
    private readonly _collisions;
    readonly clock: FrameClock;
    private inputController;
    private _levelEditor;
    private readonly onLevelLoaded;
    private readonly onAppModeChanged;
    particles: ParticlePool;
    get levelEditor(): ILevelEditor | undefined;
    get physics(): IGamePhysics;
    get level(): IVoxelLevel;
    get levelFile(): IVoxelLevelFile;
    constructor(canvas: HTMLElement, createDefaultProject: () => Promise<void>);
    get canvas(): HTMLElement;
    get camera(): ICameraLayer;
    get loader(): ICodeLoader;
    get runner(): ICodeRunner;
    get appMode(): AppMode;
    attachCamera(camera: ICameraLayer): void;
    registerLevelLoaded(target: any, func: (val: boolean) => void): void;
    registerModeChanged(target: any, func: () => void): void;
    setController(controller: IInputController): IInputController;
    loadProject(id: string): Promise<void>;
    loadLevel(id: string): Promise<void>;
    start(): Promise<void>;
    private setAppMode;
    private resetVm;
    stop(): void;
    pause(): void;
    sendMesssage(address: string, msg: any): Promise<void>;
    edit(): void;
    onRenderFrame(): void;
    createSprite(name: string, uri: string, rm?: IRigitModel | undefined, rigitKind?: RigitBodyKind): Promise<Sprite3>;
    removeSprite(sprite: Sprite3): Promise<void>;
    forever(func: () => Promise<void>): Promise<void>;
    waitCollide(sprite: Sprite3, seconds: number | undefined): Promise<IRigitBody | null>;
    createExplosion(pos: Vector3): void;
    sleep(seconds: number): Promise<void>;
    onCollide(collections: {
        source: IRigitBody;
        target: IRigitBody;
    }[]): void;
    private checkRunning;
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
export declare const infiniteUp = 1000000;
export declare const infiniteDown = -1000000;
export declare class VoxelLevel implements IVoxelLevel {
    private scene;
    objects: any;
    width: number;
    height: number;
    private _blockSize;
    private _file;
    private layers;
    private _floorLevel;
    private ambientLight;
    private directionalLight;
    get worldSize(): WorldSize3;
    get blockSize(): BlockSize3;
    get file(): IVoxelLevelFile;
    get floorLevel(): number;
    constructor(file: IVoxelLevelFile);
    onStart(): void;
    onStop(): void;
    update(time: any, delta: any): void;
    load(): Promise<boolean>;
    loadScene(scene: Scene, editMode: boolean): boolean;
    blockSizeToWorldSize(mapSize: BlockSize3): WorldSize3;
    blockPosToWorldPos(mapPos: BlockPos3): WorldCoord3;
    worldPosToBlockPos(pos: WorldCoord3): BlockPos3;
    getBlockByPoint(point: Vector3): MapBlockCoord | undefined;
    getBlockByPos(x: number, y: number, z: number): MapBlockCoord | undefined;
    private deleteBlockByPos;
    deleteBlock(block: MapBlockCoord | MapBlockRigitBody): void;
    private addBlockCore;
    addBlock(pos: BlockPos3, block: VoxelModel): void;
    getDistanceY(ro: IRigitBody, pos: WorldCoord3): {
        intersectBody?: IRigitBody;
        height: number;
        distance: number;
    };
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
    deleteBlock(pos: BlockPos3): void;
    addBlock(pos: BlockPos3, blockId: number): void;
    addBlocks(blocks: FileMapBlock[]): void;
    private getBlockKey;
}

export declare class Cube extends Sprite3 {
}

export declare class CubeModel implements IRigitModel {
    private voxelModel;
    private meshModel;
    private _size;
    private _directionAngleXZ;
    private _rotationAngleXZ;
    private _position;
    private _baseX;
    private _baseZ;
    private _scale;
    private _bottomPoints;
    get size(): Vector3;
    get bottomPoints(): Coord3[];
    constructor(scale: number);
    load(uri: string): Promise<void>;
    addAnimation(name: string): void;
    addFrame(name: string, idx: number, duration: number): void;
    aabb(pos: Vector3 | undefined): RigitAABB;
    animate(id: string): void;
    addToScene(scene: Scene): void;
    removeFromScene(scene: Scene): void;
    onRenderFrame(tick: number): void;
    setPosition(pos: Vector3): void;
    setSpeed(speed: Vector3): void;
    setDirectionXZ(angle: number): void;
    setRotationXZ(angle: number): void;
    private updateRotation;
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
    pattern?: string;
    keys?: string[];
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
export declare function wireGetStrings(request: WireGetStringsRequest): Promise<WireString[]>;
export declare function wireGetObjects<T>(request: WireGetStringsRequest): Promise<{
    key: string;
    data: T;
}[] | undefined>;
export declare function wireSetString(key: string, value: string): Promise<void>;
export declare function wireSetStrings(keys: WireString[]): Promise<void>;
export declare function getWireResourceUri(relativeUrl: string): string;
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
    key: string;
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
export declare function createButton(parent: HTMLElement, className: string, text: string, handler: (evt: any) => any): HTMLButtonElement;
export declare function createCommandButton(text: string, handler: (evt: any) => any): HTMLButtonElement;
export declare function createTextEntry(parent: HTMLElement, text: string, value: string, handler: ((val: string) => any) | undefined): HTMLDivElement;
export declare function createNumberEntry(parent: HTMLElement, text: string, value: number, handler: ((val: number) => any) | undefined): HTMLDivElement;
export declare function addText(parent: HTMLElement, text: string, css: string): void;

export declare function perlinNoise(perilinW: number, perilinH: number, baseX: number, baseY: number, seed: number): Uint8ClampedArray;

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

export type CameraLayerProps = UiLayerProps & {
    scale: number;
};
export declare class CameraLayer extends UiLayer2<CameraLayerProps> implements ICameraLayer {
    renderer: WebGLRenderer;
    _camera: PerspectiveCamera;
    _cameraGroup: Group;
    scene: Scene | undefined;
    t_start: number;
    levelEditor: ILevelEditor | undefined;
    visible_distance: number;
    private selected;
    private isDown;
    private vrButton;
    private xrSessionChangedSource;
    chunk_material: MeshPhongMaterial;
    p_light: PointLight;
    get scale(): number;
    constructor(props: CameraLayerProps);
    get canvas(): HTMLDivElement;
    get position(): Vector3;
    get camera(): PerspectiveCamera;
    get cameraGroup(): Group;
    set position(pos: Vector3);
    get viewSize(): PxSize;
    createScene(): void;
    registerXrSessionHandler(target: any, func: (session: XRSession | undefined) => void): void;
    setEditor(editor: ILevelEditor | undefined): void;
    editCamera(): void;
    private onContextMenu;
    private createCamera;
    private onLevelLoaded;
    reset(): void;
    onWindowResize(): void;
    private animate;
    render(): void;
}

export declare class FirstPersonControls {
    constructor(object: any, domElement: any);
}
export { FirstPersonControls };

export interface IGameShell {
    refresh(): void;
    printError(s: string): void;
    print(s: string): void;
    printException(e: any): void;
}
export declare let shell: IGameShell;
export declare function setShell(t: IGameShell): void;

export declare class BlockRegister {
    model: VoxelModel | undefined;
}
export declare function setBlockRegister(model: VoxelModel | undefined): void;
export declare function getBlockRegister(): VoxelModel | undefined;
export interface ILevelEditor {
    copyBlock(): void;
    cutBlock(): void;
    clearBlock(): void;
    pasteBlock(): void;
    editCamera(): void;
    rotateXZ(): void;
    flipX(): void;
    flipZ(): void;
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
    model: VoxelModel;
    frame: number;
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
    deleteBlock(pos: BlockPos3): any;
    addBlock(pos: BlockPos3, blockId: number): any;
}
export interface IVoxelLevel {
    get worldSize(): WorldSize3;
    get blockSize(): BlockSize3;
    get file(): IVoxelLevelFile;
    get floorLevel(): number;
    onStart(): any;
    onStop(): any;
    load(): Promise<boolean>;
    loadScene(scene: Scene, editMode: boolean): any;
    getBlockByPoint(point: Vector3): MapBlockCoord | undefined;
    getBlockByPos(x: number, y: number, z: number): MapBlockCoord | undefined;
    deleteBlock(block: MapBlockCoord | MapBlockRigitBody): any;
    addBlock(pos: BlockPos3, block: VoxelModel): any;
    blockSizeToWorldSize(gridSize: BlockSize3): WorldSize3;
    blockPosToWorldPos(gridPos: BlockPos3): WorldCoord3;
    worldPosToBlockPos(pos: WorldCoord3): BlockPos3;
    getDistanceY(ro: IRigitBody, pos: Vector3): {
        intersectBody?: IRigitBody;
        height: number;
        distance: number;
    };
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
    private orbitControls;
    private selectedArea;
    private selection;
    constructor(camera: ICameraLayer, level: IVoxelLevel);
    dispose(): void;
    private onMouseDown;
    private onMouseUp;
    onMouseMove(evt: MouseEvent): boolean;
    editCamera(): void;
    private moveCamera;
    rotateXZ(): void;
    flipX(): void;
    flipZ(): void;
    copyBlock(): void;
    cutBlock(): void;
    pasteBlock(): void;
    private pasteBlockWorker;
    clearBlock(): void;
    private selectBlockFace;
    private buildSelectionBox;
}

export declare class PointerLockControls extends EventDispatcher {
    isLocked: boolean;
    private camera;
    constructor(camera: any, domElement: any);
    connect(): void;
    disconnect(): void;
    dispose(): void;
    getObject(): PerspectiveCamera;
    getDirection(v: any): any;
    moveDirection(dx: number, dz: number): void;
    moveForward(distance: number): void;
    moveRight(distance: number): void;
    lock(): void;
    unlock(): void;
}
export { PointerLockControls };

export declare class ShellProps {
    width: number;
    height: number;
    canvasWidth: number;
    canvasHeight: number;
    scale: number;
    scrollX: number;
    scrollY: number;
    commandPaneHeight: number;
    commandListWidthRation: number;
    propertyPaneWidthRation: number;
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
    constructor(gameContainer: HTMLDivElement);
    refresh(): void;
    printError(s: string): void;
    print(s: string): void;
    printException(e: any): void;
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
    get elements(): HTMLElement[];
    get visible(): boolean;
    set visible(val: boolean);
    focus(): void;
    setCompositor(compositor: IUiCompositor | undefined): void;
}
export declare class UiLayer2<T extends UiLayerProps> implements IUiLayer2 {
    props: T;
    protected _elements: HTMLElement[];
    private _visible;
    protected _compositor: IUiCompositor | undefined;
    private _onFocusOut?;
    constructor(props: T, elements: HTMLElement[]);
    get elements(): HTMLElement[];
    get id(): string;
    get visible(): boolean;
    set visible(val: boolean);
    focus(): void;
    setCompositor(compositor: IUiCompositor | undefined): void;
    protected updateElementSize(): void;
}

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

export declare enum RigitBodyKind {
    object = 0,
    block = 1,
    boundary = 2,
    projectile = 3
}
export declare enum MassKind {
    stationary = 0,
    moveable = 1
}
export type RigitAABB = {
    xStart: number;
    xEnd: number;
    yStart: number;
    yEnd: number;
    zStart: number;
    zEnd: number;
};
export interface IRigitBody {
    get id(): number;
    get name(): string;
    get rigitKind(): RigitBodyKind;
    get owner(): any;
    get rigit(): IRigitModel | undefined;
    get standing(): boolean;
    get gravityFactor(): number;
    get maxClimbSpeed(): number;
    getWorldSpeed(): Vector3;
    get relativeSpeed(): Vector3;
    get position(): Vector3;
    get modelSize(): Vector3;
    get physicsSpeed(): Vector3;
    aabb(pos: Vector3 | undefined): RigitAABB;
    setPhysicsSpeed(speed: Vector3 | undefined): void;
    setStanding(standing: boolean): void;
    onMove(pos: Vector3): void;
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

export declare class MapBlockRigitBody implements IRigitBody, IDigBlock {
    readonly mapBlock: MapBlockCoord;
    private _pos;
    constructor(mapBlock: MapBlockCoord, pos: WorldCoord3);
    get id(): number;
    get name(): string;
    get inactive(): boolean;
    get rigitKind(): RigitBodyKind;
    get owner(): any;
    get relativeSpeed(): Vector3;
    get physicsSpeed(): Vector3;
    get position(): Vector3;
    get modelSize(): Vector3;
    get gravityFactor(): number;
    get maxClimbSpeed(): number;
    get rigit(): IRigitModel | undefined;
    get x(): number;
    get y(): number;
    get z(): number;
    get standing(): boolean;
    getWorldSpeed(): Vector3;
    aabb(pos: Vector3 | undefined): RigitAABB;
    setPhysicsSpeed(speed: Vector3 | undefined): void;
    setSpeed(speed: Vector3): void;
    onMove(pos: Vector3): void;
    setStanding(val: boolean): void;
}
export declare class MapBoundaryRigitBody implements IRigitBody, IDigBoundary {
    private _size;
    private _pos;
    constructor(pos: Vector3, size: Vector3);
    get id(): number;
    get name(): string;
    get inactive(): boolean;
    get rigitKind(): RigitBodyKind;
    get owner(): any;
    get relativeSpeed(): Vector3;
    get physicsSpeed(): Vector3;
    get position(): Vector3;
    get modelSize(): Vector3;
    get gravityFactor(): number;
    get maxClimbSpeed(): number;
    get rigit(): IRigitModel | undefined;
    get standing(): boolean;
    get x(): number;
    get y(): number;
    get z(): number;
    getWorldSpeed(): Vector3;
    aabb(pos: Vector3 | undefined): RigitAABB;
    setPhysicsSpeed(speed: Vector3 | undefined): void;
    setSpeed(speed: Vector3): void;
    setStanding(val: boolean): void;
    onMove(pos: Vector3): void;
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
    createParticle(opts: any): Particle | -1;
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
export type Coord3 = {
    x: number;
    y: number;
    z: number;
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
    loadModel(buffer: Uint8Array, rotateYZ: boolean): VoxelFile | undefined;
}

export declare class VoxelGeometryWriter {
    dirty: boolean;
    private v;
    private c;
    private start_x;
    private start_y;
    private start_z;
    private scale;
    private nextIdxV;
    private nextIdxC;
    private cMult;
    get count(): number;
    constructor(vCount: number, cCount: number, cMult: number);
    appendVertice(x: number, y: number, z: number): void;
    appendVertices(v: number[]): void;
    appendColor(n: number, r: number, g: number, b: number): void;
    appendColors(c: number[]): void;
    setPosition(x: number, y: number, z: number): void;
    setScale(scale: number): void;
    getGeometry(): BufferGeometry;
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
    private readonly _size;
    private readonly _pos;
    private _qt;
    private readonly material;
    private currentFrame;
    private currentAnimation;
    private currentAnimationFrame;
    private lastFrameTick;
    readonly animations: VoxelAnimationCollection;
    get size(): Vector3;
    static create(vmm: VoxelModel, scale?: number): VoxelMeshModel;
    constructor();
    private load;
    playAnimation(name: string): void;
    onRender(tick: number): void;
    addToScene(parent: Scene): void;
    removeFromScene(parent: Scene): void;
    setPosition(pos: Vector3): void;
    setRotation(qt: Quaternion): void;
    setBasePoint(pos: Vector3): void;
}

export type VoxelPoint = {
    x: number;
    y: number;
    z: number;
    color: number;
};
export type VoxelFile = {
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
    readonly voxUri: string;
    readonly thumbnailUri: string;
    readonly id: number;
    readonly scale: number;
    readonly frames: VoxelModelFrame[];
    constructor(id: number, voxUri: string, thumbnailUri: string, scale: number);
    get size(): Vector3;
    get modelSize(): Vector3;
    get modelCenter(): Vector3;
}
export declare class VoxelModelFrame {
    private readonly data;
    chunk_sx: number;
    chunk_sy: number;
    chunk_sz: number;
    stride_z: number;
    min_x: number;
    min_y: number;
    min_z: number;
    max_x: number;
    max_y: number;
    max_z: number;
    wireframe: boolean;
    private v;
    private c;
    private heightMap;
    get verticeCount(): number;
    get colorCount(): number;
    get modelSize(): Vector3;
    get modelCenter(): Vector3;
    private constructor();
    static load(data: VoxelFileFrame): VoxelModelFrame;
    static sameColor(block1: number, block2: number): boolean;
    private getIdx;
    getHeight(x: number, z: number): number;
    build(writer: VoxelGeometryWriter): void;
    private loadHeightMap;
    private loadModel;
    private appendVertice;
    private appendColor;
}

export type ImportFile = {
    fn: string;
    voxUrl?: string;
    thumbnailUrl?: string;
    vox: Uint8Array;
    rotateYZ: boolean | undefined;
    png: ImageData | undefined;
};
export type WireModelInfo = {
    id: number;
    voxUrl: string;
    thumbnailUrl: string;
    rotateYZ: boolean;
};
export declare class VoxelModelCache {
    private readonly modelsByUrl;
    private readonly modelsById;
    getVoxelModelById(id: number): VoxelModel | undefined;
    getVoxelModel(url: string): VoxelModel | undefined;
    getVoxelModels(): Iterable<VoxelModel>;
    load(): Promise<boolean>;
    private loadModelEntries;
    importFiles(importFiles: ImportFile[]): Promise<WireModelInfo[] | undefined>;
    private loadModelFromString;
    private loadModelFromArray;
}
export declare let modelCache: VoxelModelCache;
