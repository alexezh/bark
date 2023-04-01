import { CommandBar } from "../actions/commandBar";
import { populateMapEditCommands } from "../posh/mapeditcommands";
import { Repl } from "../posh/repl";
import { HelpDef } from "../posh/helpdef";
import { UiCompositor2 } from "./uicompositor";
import { createMapEditorState, mapEditorState } from "../posh/mapeditorstate";
import { CodeEditor } from "./codeeditor";
import { IGameShell as IGameShell } from "./igameshell";
import { registerSystemCommands } from "../posh/systemcommands";
import { decorateCommand } from "../lib/termcolors";
import { LevelEditor } from "./mapeditor";
import { CameraLayer } from "./cameralayer";
import { IVoxelLevel } from "./ivoxelmap";

//registerRegionCommands();
registerSystemCommands();
//registerMapCommands();

export class ShellProps {
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

export class Shell implements IGameShell {
  private map!: IVoxelLevel;
  private container: HTMLDivElement;
  public camera?: CameraLayer;
  private compositor2: UiCompositor2;
  private props: ShellProps;
  private barLayer: CommandBar;
  private mapEditor?: LevelEditor;
  private codeEditor?: CodeEditor;
  private repl: Repl;

  public constructor(gameContainer: HTMLDivElement) {
    this.container = gameContainer;
    this.props = new ShellProps();
    this.props.width = this.container.offsetWidth;
    this.props.height = this.container.offsetHeight;
    this.props.scale = 1; // window.devicePixelRatio;
    this.props.canvasWidth = this.props.width / this.props.scale;
    this.props.canvasHeight = this.props.height / this.props.scale;
    this.repl = new Repl();

    this.populateBasicCommands();

    createMapEditorState();
    mapEditorState.onChanged(this, (evt) => this.refresh());
    populateMapEditCommands(this.repl, mapEditorState);

    this.compositor2 = new UiCompositor2(gameContainer, { w: this.props.width, h: this.props.height });

    this.refresh();

    // now add UI layers
    this.barLayer = new CommandBar({
      id: "bar", x: 0, y: 0,
      w: this.props.width, h: this.props.height,
      termProps: this.props,
      visible: true,
      mapEditorState: mapEditorState
    });
    this.compositor2.appendLayer(this.barLayer);

    // add camera
    this.camera = new CameraLayer({
      id: "camera",
      x: 0, y: 0,
      w: this.props.width, h: this.props.height,
      scale: this.props.scale,
      visible: true
    });

    this.compositor2.insertLayerBefore(this.camera, 'bar');
  }

  public refresh() {
    //this.camera?.refresh();
  }

  public editLevel(): void {
    console.log('editLevel');
  }

  public printError(s: string): void {
  }

  public print(s: string): void {
  }

  public printException(e: any): void {
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


  private populateBasicCommands() {
    this.repl.addFunc(new HelpDef(this.repl))
  }

  private loginCached() {
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

