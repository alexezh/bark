import { MapEditorState } from "../ui/mapeditorstate";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { DetailsPaneKind, IAction, ICommandLayer } from "./iaction";
import { ShellProps } from "../ui/shell";
import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { getTopLevelActions } from "./actionregistry";

export type CommandBarProps = UiLayerProps & {
  shellProps: ShellProps;
  // world: World;
  mapEditorState: MapEditorState;
}

/**
 * scrollable list of commands
 */
export class CommandList {
  private actions: IAction[] = [];
  private props: CommandBarProps;
  private listDiv: HTMLDivElement | undefined;
  private opened: boolean = false;

  public get isOpened(): boolean { return this.opened; };

  public constructor(props: CommandBarProps) {
    this.props = props;

    // make list of possible actions
    for (let action of getTopLevelActions()) {
      this.actions.push(action);
    }
  }

  public open(parent: HTMLElement, bar: ICommandLayer) {
    this.opened = true;

    this.listDiv = document.createElement('div');
    this.listDiv.className = 'commandList';
    parent.appendChild(this.listDiv);
    this.updateListSize();
    this.updateList(bar);
  }

  public close(parent: HTMLElement) {
    if (!this.opened) {
      return false;
    }

    parent.removeChild(this.listDiv!);
    this.opened = false;
  }

  public pushActions() {
    this._commandList.pushActions();
  }
  public popActions() {
    this._commandList.popActions();
  }
  public addActions(actions: IAction[]) {
    this._commandList.addActions(actions);
  }

  public updateList(bar: ICommandLayer) {
    for (let a of this.actions) {
      a.destroyButton(this.listDiv!);
    }

    for (let a of this.actions) {
      a.renderButton(this.listDiv!, bar);
    }
  }

  private updateListSize() {
    if (this.listDiv === undefined) {
      return;
    }
    this.listDiv.style.left = '0';
    if (this.props.w !== 0) {
      this.listDiv.style.width = this.props.w.toString();
    }
  }
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
  private grid: HTMLElement;
  private actionButton: HTMLButtonElement;
  private _commandList: CommandList;
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

    this.grid = document.createElement('div');
    this.grid.className = 'commandLayerGrid';
    this.element.appendChild(this.grid);

    // save properties for later
    this._fullWidth = fullWidth;
    this._fullHeight = fullHeight;

    // add button to open pane
    this.actionButton = createButton(this.grid, 'commandOpenButton', 'A', this.onCommandList.bind(this));

    this._commandList = new CommandList(this.props);

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

    this.grid.appendChild(elem);
    this._detailsPane = elem;
    this.props.w = this.getCommandListWidth() + this.getPropertyPaneWidth(kind);
    this.updateElementSize();
  }

  public closeDetailsPane(): void {
    if (this._detailsPane === undefined) {
      return;
    }

    this.grid.removeChild(this._detailsPane);
    this._detailsPane = undefined;
    this.props.w = this.getCommandListWidth();
    this.updateElementSize();
  }

  public pushActions() {
    this._commandList.pushActions();
  }
  public popActions() {
    this._commandList.popActions();
  }
  public addActions(actions: IAction[]) {
    this._commandList.addActions(actions);
  }

  private onCommandList() {
    if (this._commandList.isOpened) {
      this.closeDetailsPane();
      this._commandList.close(this.grid);

      this.props.w = 0;
      this.props.h = 0;
      this.updateElementSize();
    } else {
      this.props.w = this.getCommandListWidth();
      this.props.h = this._fullHeight;
      this.updateElementSize();

      this._commandList.open(this.grid, this);
    }
    //this._commandList.updateList(this, this._pane!);
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
    if (this.grid) {
      this.grid.style.width = this.props.w.toString();
      this.grid.style.height = this.props.h.toString();
    }
  }
}
