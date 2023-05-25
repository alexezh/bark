import { MapEditorState } from "../ui/mapeditorstate";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { IAction, ICommandLayer } from "./iaction";
import { ShellProps } from "../ui/shell";
import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { getActions } from "./actionregistry";

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

  public updateList(bar: ICommandLayer) {
    for (let a of this.actions) {
      a.destroyButton(this.listDiv!);
    }

    for (let a of this.actions) {
      a.renderButton(this.listDiv!, bar);
    }
  }

  registerAction(action: IAction): void {
    this.actions.push(action);
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
  private actionButton: HTMLButtonElement;
  private _commandList: CommandList;
  private _propPane: HTMLElement | undefined;
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

    // save properties for later
    this._fullWidth = fullWidth;
    this._fullHeight = fullHeight;

    // add button to open pane
    this.actionButton = createButton(element, 'commandOpenButton', 'A', this.onCommandList.bind(this));

    this._commandList = new CommandList(this.props);

    // make list of possible actions
    for (let action of getActions()) {
      this._commandList.registerAction(action);
    }

    // <button type="button" class="nes-btn is-primary">Primary</button>
    //this.editButton = createButton(this._element, 'EDIT', (evt: any): any => props.onToggleEdit());

    // this.onUpdateMapEditorState();
  }

  public displayError(text: string) {
    console.log(text);
  }

  public openDetailsPane(elem: HTMLElement): void {
    if (this._propPane !== undefined) {
      this.closeDetailsPane();
    }

    this.element.appendChild(elem);
    this._propPane = elem;
  }

  public closeDetailsPane(): void {
    if (this._propPane === undefined) {
      return;
    }

    this.element.removeChild(this._propPane);
    this._propPane = undefined;
  }

  private onCommandList() {
    if (this._commandList.isOpened) {
      this._commandList.close(this.element);
    } else {
      this.props.w = this._fullWidth * this.props.shellProps.commandListWidthRation;
      this.props.h = this._fullHeight;
      this.updateElementSize();

      this._commandList.open(this.element, this);
    }
    //this._commandList.updateList(this, this._pane!);
  }
}
