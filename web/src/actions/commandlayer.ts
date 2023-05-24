import { MapEditorState } from "../ui/mapeditorstate";
import { createButton, setElementVisible } from "../lib/htmlutils";
import { IAction, ICommandLayer } from "./iaction";
import { ShellProps } from "../ui/shell";
import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { getActions } from "./actionregistry";

export type CommandBarProps = UiLayerProps & {
  termProps: ShellProps;
  // world: World;
  mapEditorState: MapEditorState;
}

// list of commands and props
export class CommandList {
  private actions: IAction[] = [];
  private listDiv: HTMLDivElement | undefined;
  private props: CommandBarProps;

  public constructor(props: CommandBarProps) {
    this.props = props;
  }

  public updateList(bar: ICommandLayer, parent: HTMLElement) {
    if (this.listDiv === undefined) {
      this.listDiv = document.createElement('div');
      this.listDiv.className = 'commandList';
      parent.appendChild(this.listDiv);
      this.updateListSize();
    }

    for (let a of this.actions) {
      a.destroyButton(this.listDiv);
    }

    for (let a of this.actions) {
      a.renderButton(this.listDiv, bar);
    }

    setElementVisible(this.listDiv, true);
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
 */
export class CommandLayer extends UiLayer2<CommandBarProps> implements ICommandLayer {
  //private editButton: HTMLButtonElement;
  //private tileButton: HTMLButtonElement;
  private actionButton: HTMLButtonElement;
  private _floatieVisible: boolean = false;
  private _floatie: HTMLDivElement | undefined;
  private _commandList: CommandList;
  private _propPane: HTMLElement | undefined;

  public constructor(props: CommandBarProps) {
    let element = document.createElement('div');
    element.className = 'commandLayer';

    // reset layer size to 0
    props.w = 0;
    props.h = 0;
    super(props, element, false);

    this.actionButton = createButton(element, 'A', this.onAction.bind(this));

    this._floatie = document.createElement('div') as HTMLDivElement;
    this._floatie.className = 'commandFloatie';
    setElementVisible(this._floatie, false);
    this.element.appendChild(this._floatie);

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
  closeDetailsPane(): void {
    if (this._propPane === undefined) {
      return;
    }

    this.element.removeChild(this._propPane);
    this._propPane = undefined;
  }

  private onAction() {
    this._floatieVisible = !this._floatieVisible;
    if (this._floatieVisible) {
      this._commandList.updateList(this, this._floatie!);
    }
    setElementVisible(this._floatie, this._floatieVisible);
  }
}
