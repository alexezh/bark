import { createButton, setElementVisible } from "../lib/htmlutils";
import { DetailsPaneKind, IAction, ICommandLayer, IMenuAction } from "./iaction";
import { ShellProps } from "../ui/shell";
import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { AppMode, vm } from "../engine/ivm";
import { CommandList } from "./commandlist";
import { getLevelActions } from "./editlevelaction";
import { getSpriteActions } from "./editspriteactions";

export type CommandBarProps = UiLayerProps & {
  shellProps: ShellProps;
  // world: World;
  //mapEditorState: MapEditorState;
}


/**
 * shows scrollable bar with searchable command list
 * click on command extends the bar
 * 
 * layout following
 * 
 * commandlayer
 *    button
 *    commandlist | (propertypane | editorpane | blockpane)
 *  
 *  data pane is used for properties and editor
 * 
 */
export class CommandLayer extends UiLayer2<CommandBarProps> implements ICommandLayer {
  //private editButton: HTMLButtonElement;
  //private tileButton: HTMLButtonElement;
  private bar: HTMLDivElement;
  private pane: HTMLDivElement;
  // @ts-ignore
  private homeButton: HTMLButtonElement;
  // @ts-ignore
  private startButton: HTMLButtonElement;
  // @ts-ignore
  private pauseButton: HTMLButtonElement;
  // @ts-ignore
  private editButton: HTMLButtonElement;
  // @ts-ignore
  private cameraButton: HTMLButtonElement;
  private _commandList: CommandList;
  private _getCommandListActions: (() => IAction[]) | undefined;
  private _detailsPane: HTMLElement | undefined;
  private _fullHeight: number;
  private _fullWidth: number;

  public constructor(props: CommandBarProps) {
    let element = document.createElement('div');
    element.className = 'commandLayer';
    let fullWidth = props.w;
    let fullHeight = props.h;

    // reset layer size to 0 to hide it
    props.w = 0;
    props.h = 0;
    super(props, element, false);

    this.bar = document.createElement('div');
    this.bar.className = 'commandBar';
    this.element.appendChild(this.bar);

    this.pane = document.createElement('div');
    this.pane.className = 'commandPane';
    this.element.appendChild(this.pane);

    // save properties for later
    this._fullWidth = fullWidth;
    this._fullHeight = fullHeight;

    this.createButtons();

    this._commandList = new CommandList(this.props, this);

    this.element.addEventListener('keydown', this.onKeyDown.bind(this));

    // <button type="button" class="nes-btn is-primary">Primary</button>
    //this.editButton = createButton(this._element, 'EDIT', (evt: any): any => props.onToggleEdit());

    // this.onUpdateMapEditorState();
  }

  public displayError(text: string) {
    console.log(text);
  }

  public openDetailsPane(elem: HTMLElement, kind: DetailsPaneKind): void {
    if (this._detailsPane !== undefined) {
      this.closeDetailsPane();
    }

    elem.style.gridColumn = '2';
    elem.style.gridRow = '2';

    this.pane.appendChild(elem);
    this._detailsPane = elem;
    this.props.w = this.getCommandListWidth() + this.getPropertyPaneWidth(kind);
    this.updateElementSize();
  }

  public closeDetailsPane(): HTMLElement | undefined {
    if (this._detailsPane === undefined) {
      return;
    }

    let lastPane = this._detailsPane;
    this.pane.removeChild(this._detailsPane);
    this._detailsPane = undefined;
    this.props.w = this.getCommandListWidth();
    this.updateElementSize();
    return lastPane;
  }

  public pushActions(actions: IAction[]) {
    this.homeButton.textContent = '<Back';
    this._commandList.pushActions(actions);
  }

  public openMenu(group: IMenuAction) {
    this._commandList.openMenu(group);
  }

  public closeMenu(group: IMenuAction) {
    this._commandList.closeMenu(group);
  }

  private createButtons() {
    // add button to open pane
    //this.homeButton = createButton(this.pane, 'commandBarButton', 'Home', this.onCommandHome.bind(this));
    this.startButton = createButton(this.bar, 'commandBarButton', 'START', this.onCommandStart.bind(this));
    this.pauseButton = createButton(this.bar, 'commandBarButton', 'PAUSE', this.onCommandPause.bind(this));
    this.editButton = createButton(this.bar, 'commandBarButton', 'LEVEL', this.onLevel.bind(this));
    this.editButton = createButton(this.bar, 'commandBarButton', 'SPRITE', this.onSprite.bind(this));
    this.cameraButton = createButton(this.bar, 'commandBarButton', 'CAMERA', this.onCamera.bind(this));

    //this.cameraButton.toolto
    /**
    .tooltip {
        position: relative;
        display: inline-block;
        border-bottom: 1px dotted black; 
    }
    .tooltip .tooltiptextstyle {
        visibility: hidden; 
        display: block;
        width: 120px;
        background-color: black;
        color: #fff;
        text-align: center;
        padding: 5px 0;
        border-radius: 6px;
        position: absolute;
        z-index: 1;
    }
    */
  }

  private onCommandHome() {
    if (this._commandList.navStackDepth > 1) {
      this._commandList.popActions();
      if (this._commandList.navStackDepth === 1) {
        this.homeButton.textContent = 'A';
      }
    } else {
      if (this._commandList.isOpened) {
        this.closeDetailsPane();
        this._commandList.close(this.pane);

        this.props.w = 0;
        this.props.h = 0;
        this.updateElementSize();
      } else {
        this.props.w = this.getCommandListWidth();
        this.props.h = this._fullHeight;
        this.updateElementSize();

        this._commandList.open(this.pane);
      }
    }
    //this._commandList.updateList(this, this._pane!);
  }

  private onKeyDown(evt: Event) {
    let ke = evt as KeyboardEvent;
    if (ke.code === 'Escape') {
      this.closeDetailsPane();
      evt.preventDefault();
    }
  }

  private onCommandStart() {
    setTimeout(async () => {
      if (vm.appMode !== AppMode.run) {
        await vm.start();
      } else {
        await vm.stop();
      }

      this.updateCommandButtons();
    });
  }

  private onCommandPause() {
    vm.pause();
  }

  private closeCommandList() {
    this.closeDetailsPane();
    this._commandList.close(this.pane);

    this.props.w = 0;
    this.props.h = 0;
    this.updateElementSize();
    this._getCommandListActions = undefined;
  }

  private openCommandList(getListActions: () => IAction[]) {

    let getListOld = this._getCommandListActions;

    if (this._commandList.isOpened) {
      this.closeCommandList();
    }

    if (getListOld !== getListActions) {
      this.props.w = this.getCommandListWidth();
      this.props.h = this._fullHeight;
      this.updateElementSize();

      this._commandList.open(this.pane);
      this._commandList.loadActions(getListActions());
      this._getCommandListActions = getListActions;
    }
  }

  private onLevel() {
    this.openCommandList(getLevelActions);
    //vm.editLevel();


    this.updateCommandButtons();
  }

  private onSprite() {
    console.log('onSprite');
    this.openCommandList(getSpriteActions);
    //vm.camera.editCamera();
    //this.updateCommandButtons();
  }

  private onCamera() {
    console.log('onCommandCamera');
    vm.camera.editCamera();
    this.updateCommandButtons();
  }

  private updateCommandButtons() {
    this.startButton.textContent = (vm.appMode === AppMode.run) ? 'STOP' : 'START';
    setElementVisible(this.editButton, vm.appMode !== AppMode.run);
    setElementVisible(this.cameraButton, vm.appMode === AppMode.edit);
  }

  private getCommandListWidth() {
    return this._fullWidth * this.props.shellProps.commandListWidthRation;
  }

  private getPropertyPaneWidth(kind: DetailsPaneKind) {
    if (kind === DetailsPaneKind.Partial) {
      return this._fullWidth * this.props.shellProps.propertyPaneWidthRation;
    } else {
      return this._fullWidth * (1 - this.props.shellProps.commandListWidthRation);
    }
  }

  protected updateElementSize() {
    super.updateElementSize();
    if (this.pane) {
      this.pane.style.width = this.props.w.toString();
      this.pane.style.height = this.props.h.toString();
    }
  }
}
