import _ from "lodash";
import { CommandBar } from "./commandBar";
import { TextTerminalLayer } from "./textterminallayer";
import { populateMapEditCommands } from "../posh/mapeditcommands";
import { Repl } from "../posh/repl";
import { HelpDef } from "../posh/helpdef";
import { UiCompositor2 } from "./uicompositor";
import { createMapEditorState, mapEditorState } from "../posh/mapeditorstate";
import { CodeEditor } from "./codeeditor";
import { IGameTerminal } from "./igameterminal";
import { registerSystemCommands } from "../posh/systemcommands";
import { decorateCommand } from "../posh/termcolors";
import { MapEditor } from "./mapeditor";
import { CameraLayer } from "../voxel/cameralayer";
import { IGameMap } from "../voxel/igamemap";

//registerRegionCommands();
registerSystemCommands();
//registerMapCommands();

export class TerminalProps {
  public width: number = 0;
  public height: number = 0;
  // scaled width and height for drawing
  // will go to layer at some point
  public canvasWidth: number = 0;
  public canvasHeight: number = 0;
  public scale: number = 1;
  public scrollX: number = 0;
  public scrollY: number = 0;
  public commandPaneHeight: number = 48;
  public terminalPaneHeightRatio: number = 0.25;
  public uiLayerHeight: number = 32;
  public mediumButtonWidth = 64;
  public mediumButtonHeight = 32;
}

export class Terminal implements IGameTerminal {
  private map!: IGameMap;
  private container: HTMLDivElement;
  public camera?: CameraLayer;
  private compositor2: UiCompositor2;
  private props: TerminalProps;
  private barLayer: CommandBar;
  private terminalLayer: TextTerminalLayer;
  private mapEditor?: MapEditor;
  private codeEditor?: CodeEditor;
  private repl: Repl;

  public constructor(gameContainer: HTMLDivElement) {
    this.container = gameContainer;
    this.props = new TerminalProps();
    this.props.width = this.container.offsetWidth;
    this.props.height = this.container.offsetHeight;
    this.props.scale = 1; // window.devicePixelRatio;
    this.props.canvasWidth = this.props.width / this.props.scale;
    this.props.canvasHeight = this.props.height / this.props.scale;
    this.repl = new Repl();

    _.bindAll(this, [
      'onOpenTerm',
      'onCloseTerm',
      'onToggleEdit',
      'onToggleTile',
      'onToggleTerm',
      'onToggleMap',
    ]);

    this.populateBasicCommands();


    createMapEditorState();
    mapEditorState.onChanged(this, (evt) => this.refresh());
    populateMapEditCommands(this.repl, mapEditorState);

    this.compositor2 = new UiCompositor2(gameContainer, { w: this.props.width, h: this.props.height });

    this.refresh();

    // now add UI layers
    this.barLayer = new CommandBar({
      id: "bar", x: 0, y: 0,
      w: this.props.width, h: this.props.commandPaneHeight,
      termProps: this.props,
      visible: true,
      mapEditorState: mapEditorState,
      onToggleEdit: this.onToggleEdit,
      onToggleTerm: this.onToggleTerm,
      onToggleMap: this.onToggleMap
    });
    this.compositor2.appendLayer(this.barLayer);

    // add terminal
    let terminalHeight = this.props.height * this.props.terminalPaneHeightRatio;
    this.terminalLayer = new TextTerminalLayer({
      id: 'terminal',
      x: 0, y: this.props.height - terminalHeight, w: this.props.width, h: terminalHeight,
      repl: this.repl,
      mapEditorState: mapEditorState,
      visible: true,
      onCloseTerminal: this.onCloseTerm
    });
    this.compositor2.appendLayer(this.terminalLayer);

    this.terminalLayer.fit();
  }

  public refresh() {
    //this.camera?.refresh();
  }

  public printError(s: string): void {
    this.terminalLayer.print(s);
  }

  public print(s: string): void {
    this.terminalLayer.print(s);
  }

  public async prompt(s: string): Promise<string> {
    this.terminalLayer.focus();
    let res = await this.terminalLayer.prompt(s);
    this.camera?.focus();
    return res;
  }

  public promptMenu(s: string): Promise<string> {
    this.terminalLayer.focus();
    let res = this.terminalLayer.promptMenu(s);
    this.camera?.focus();
    return res;
  }

  public editFile(text: string | null | undefined, onSave: ((text: string) => void) | undefined) {

    if (onSave !== undefined) {
      this.openTextEditor(text, (text: string) => {
        onSave(text);
        this.closeTextEditor();
      });
    } else {
      this.openTextEditor(text, undefined);
    }
  }

  public printException(e: any): void {
    let message: string;
    if (typeof e === "string") {
      this.terminalLayer.print(e as string);
    } else if (e instanceof Error) {
      this.terminalLayer.print((e as Error).message);
    }
  }

  public setGameMap(map: IGameMap) {
    this.map = map;
    //mapEditorState.update({ map: map });

    this.camera = new CameraLayer({
      id: "camera",
      x: 0, y: 0,
      w: this.props.width, h: this.props.height,
      scale: this.props.scale,
      visible: true,
      onOpenTerminal: this.onOpenTerm,
      onToggleEdit: this.onToggleEdit
    });

    this.compositor2.insertLayerBefore(this.camera, 'bar');

    this.loginCached();

    this.refresh();
    this.camera.focus();
  }

  private populateBasicCommands() {
    this.repl.addFunc(new HelpDef(this.repl))
  }

  private loginCached() {
    this.terminalLayer.print('Welcome to nomekop world\r\n');

    let user = window.localStorage.getItem('user');
    if (user === undefined || user === null) {
      this.print(`Run ${decorateCommand('login name')} to login. Type ${decorateCommand('help')} to see more commands`);
      return;
    }

    this.login(user);
  }

  public login(name: string) {
    /*
        if (this.interactiveAvatar !== undefined) {
          this.printError(`Already logged in.You have to logout to switch avatar`);
          return;
        }
    
        let avatar: IAvatar | undefined;
        let id = parseInt(name);
        if (isNaN(id)) {
          avatar = gameState.avatarCollection.findCharacterByName(name);
        } else {
          avatar = gameState.avatarCollection.getAvatar(id.toString());
        }
    
        if (avatar === undefined) {
          this.printError(`Avatar ${name} not found`);
          return;
        }
    
        window.localStorage.setItem('user', avatar.id);
    
        this.setInteractiveAvatar(avatar);
        this.print(`Welcome ${avatar.rt.name} to Nomekop`);
        this.camera?.focus()
        */
  }

  public logout() {
    /*
    if (this.interactiveAvatar === undefined) {
      this.printError(`Not logged in `);
      return;
    }

    this.print(`Goodbye ${this.interactiveAvatar.rt.name} `);
    this.setInteractiveAvatar(undefined);
    */
  }

  private onToggleTerm() {
    this.terminalLayer!.visible = !this.terminalLayer.visible;
    if (this.terminalLayer.visible) {
      this.terminalLayer.focus();
    } else {
      this.camera?.focus();
    }
  }

  private onOpenTerm() {
    if (!this.terminalLayer!.visible) {
      this.terminalLayer!.visible = true;
      this.terminalLayer.focus();
    }
  }

  private onCloseTerm() {
    if (this.terminalLayer!.visible) {
      this.terminalLayer!.visible = false;
      this.camera!.focus();
    }
  }

  private onToggleMap() {
    if (this.map === undefined) {
      return;
    }
    /*
        if (this.mapViewer === undefined) {
          let mapProps = this.map.props;
          let atlas = resourceLib.getSpriteSheetById("outside3");
    
          this.mapViewer = new MapBitmapViewer({
            id: "mapviewer",
            x: 40,
            y: 40,
            w: mapProps.gridWidth,
            h: mapProps.gridHeight,
            visible: true,
            mapEditorState: mapEditorState
          });
    
          this.compositor2.insertLayerBefore(this.mapViewer, 'bar');
        }
        else {
          this.mapViewer.visible = !this.mapViewer.visible;
        }
    
        this.mapViewer.refresh();
        */
  }

  private onToggleEdit() {
    if (this.map === undefined) {
      return;
    }

    let editMode = !mapEditorState.isEditMode;
    mapEditorState.update({ isEditMode: editMode });
    if (editMode === true) {
      this.terminalLayer.visible = true;
    }
    /*
        if (!editMode) {
          this.mapEditor = undefined;
          this.camera?.setEditor(undefined);
        } else {
          // whole screen
          this.mapEditor = new MapEditor({
            id: "mapeditor",
            x: 0, y: 0, w: this.props.canvasWidth, h: this.props.canvasHeight,
            world: this.map,
            mapEditorState: mapEditorState!,
            repl: this.repl
          });
          this.camera?.setEditor(this.mapEditor);
        }
    */
    this.camera?.focus();
  }

  private openTextEditor(text: string | null | undefined, onSave: ((text: string) => void) | undefined) {
    if (this.codeEditor === undefined) {
      this.codeEditor = new CodeEditor({
        id: "codeeditor",
        x: 40,
        y: 40,
        w: this.props.width - 80,
        h: this.props.height - 80,
        visible: false
      });

      this.compositor2.appendLayer(this.codeEditor);
    }

    this.codeEditor.load(text, onSave, () => this.closeTextEditor());

    this.codeEditor.visible = true;
    this.codeEditor.focus();
  }

  private closeTextEditor() {
    this.codeEditor!.visible = false;
    this.camera?.focus();
  }
}

