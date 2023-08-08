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
  private levelButton: HTMLButtonElement;
  // @ts-ignore
  private spriteButton: HTMLButtonElement;
  // @ts-ignore
  private cameraButton: HTMLButtonElement;
  private _commandList: CommandList;
  private _getCommandListActions: (() => IAction[]) | undefined;
  private _detailsPane: HTMLElement | undefined;
  private _fullHeight: number;
  private _fullWidth: number;

  public constructor(props: CommandBarProps) {
    let bar = document.createElement('div');
    bar.className = 'commandBar';

    let pane = document.createElement('div');
    bar.className = 'commandPane';

    let fullWidth = props.w;
    let fullHeight = props.h;

    // reset layer size to 0 to hide it
    props.w = 0;
    props.h = 0;
    super(props, [bar, pane]);

    this.bar = bar;
    this.bar.className = 'commandBar';

    this.pane = pane;
    this.pane.className = 'commandPane';
    this.pane.setAttribute('tabindex', '0');
    setElementVisible(this.pane, false);

    // save properties for later
    this._fullWidth = fullWidth;
    this._fullHeight = fullHeight;

    this.createButtons();

    vm.registerModeChanged(this, () => this.onAppModeChanged.bind(this));
    this._commandList = new CommandList(this.props, this);

    this.pane.addEventListener('keydown', this.onKeyDown.bind(this));

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
    this.levelButton = createButton(this.bar, 'commandBarButton', 'LEVEL', this.onLevel.bind(this));
    this.spriteButton = createButton(this.bar, 'commandBarButton', 'SPRITE', this.onSprite.bind(this));
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

  private onAppModeChanged() {
    this.updateCommandButtons();
    if (vm.appMode !== AppMode.edit) {
      this.closeCommandList();
    }
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
    if (!this._commandList.isOpened) {
      return;
    }

    this.closeDetailsPane();
    this._commandList.close(this.pane);
    setElementVisible(this.pane, false);

    //this.updateElementSize();
    this._getCommandListActions = undefined;
  }

  private openCommandList(getListActions: () => IAction[]) {

    let getListOld = this._getCommandListActions;

    if (this._commandList.isOpened) {
      this.closeCommandList();
    }

    if (getListOld !== getListActions) {
      //this.props.w = this.getCommandListWidth();
      //this.props.h = this._fullHeight;
      //this.updateElementSize();

      setElementVisible(this.pane, true);
      this._commandList.open(this.pane);
      this._commandList.loadActions(getListActions());
      this._getCommandListActions = getListActions;
    }

    this.updateCommandButtons();
  }

  private onLevel() {
    vm.edit();

    this.openCommandList(getLevelActions);
  }

  private onSprite() {
    console.log('onSprite');
    vm.edit();

    this.openCommandList(getSpriteActions);
    //vm.camera.editCamera();
    //this.updateCommandButtons();
  }

  private onCamera() {
    console.log('onCamera');
    vm.edit();
    vm.camera.editCamera();
    this.updateCommandButtons();
  }

  private updateCommandButtons() {
    this.startButton.textContent = (vm.appMode === AppMode.run) ? 'STOP' : 'START';
    setElementVisible(this.levelButton, vm.appMode !== AppMode.run);
    setElementVisible(this.spriteButton, vm.appMode !== AppMode.run);
    setElementVisible(this.cameraButton, vm.appMode !== AppMode.run);
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
    // not calling super here
    // super.updateElementSize();
    /*
        this.bar.style.left = this.props.x.toString();
        this.bar.style.top = this.props.y.toString();
        if (this.props.w !== 0) {
          this._elements[0].style.width = this.props.w.toString();
        }
        if (this.props.h !== 0) {
          this._elements[0].style.height = this.props.h.toString();
        }
    
        if (this.pane) {
          this.pane.style.width = this.props.w.toString();
          this.pane.style.height = this.props.h.toString();
        }
        */
  }
}
