import { MapEditorChangeEvent, MapEditorState } from "../posh/mapeditorstate";
import { createButton, setElementDisplay, setElementVisible } from "../lib/htmlutils";
import { IAction } from "../ui/iaction";
import { ShellProps } from "../ui/shell";
import { UiLayer2, UiLayerProps } from "../ui/uilayer";
import { UploadVoxAction } from "./uploadaction";
import { MoveCameraAction } from "./movecameraaction";
import { EditBlockAction, EditCodeAction, EditLevelAction } from "./editaction";

export type CommandBarProps = UiLayerProps & {
  termProps: ShellProps;
  // world: World;
  mapEditorState: MapEditorState;
}

export interface ICommandBar {
  displayError(text: string);
  openDetailsPane(elem: HTMLElement): void;
  closeDetailsPane(): void;
}

// list of commands and props
export class CommandList {
  private actions: IAction[] = [];
  private listDiv: HTMLDivElement | undefined;
  private props: CommandBarProps;

  public constructor(props: CommandBarProps) {
    this.props = props;
  }

  public updateList(parent: HTMLElement) {
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
      a.renderButton(this.listDiv);
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

export class CommandBar extends UiLayer2<CommandBarProps> implements ICommandBar {
  //private editButton: HTMLButtonElement;
  //private tileButton: HTMLButtonElement;
  private actionButton: HTMLButtonElement;
  private _floatieVisible: boolean = false;
  private _floatie: HTMLDivElement | undefined;
  private _commandList: CommandList;
  private _propPane: HTMLElement | undefined;

  public constructor(props: CommandBarProps) {
    let element = document.createElement('div');
    element.className = 'barLayer';

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
    this._commandList.registerAction(new UploadVoxAction(this));
    this._commandList.registerAction(new MoveCameraAction(this));
    this._commandList.registerAction(new EditLevelAction());
    this._commandList.registerAction(new EditBlockAction());
    this._commandList.registerAction(new EditCodeAction());

    // <button type="button" class="nes-btn is-primary">Primary</button>
    //this.editButton = createButton(this._element, 'EDIT', (evt: any): any => props.onToggleEdit());

    // this.onUpdateMapEditorState();
  }

  public displayError(text: string) {
    console.log(text);
  }

  openDetailsPane(elem: HTMLElement): void {
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
      this._commandList.updateList(this._floatie!);
    }
    setElementVisible(this._floatie, this._floatieVisible);
  }
}
