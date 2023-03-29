import { MapEditorChangeEvent, MapEditorState } from "../posh/mapeditorstate";
import { createButton, setElementVisible } from "./htmlutils";
import { IAction } from "./iaction";
import { ShellProps } from "./shell";
import { UiLayer2, UiLayerProps } from "./uilayer";
import { UploadVoxAction } from "../actions/uploadaction";
import { MoveCameraAction } from "../actions/movecameraaction";

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

export class CommandPalette {
  private actions: IAction[] = [];
  private _visible: boolean = false;
  private commandPalette: HTMLDivElement | undefined;
  private props: CommandBarProps;

  public get visible(): boolean { return this._visible };

  public constructor(props: CommandBarProps) {
    this.props = props;
  }

  public setVisible(val: boolean, parent: HTMLElement) {
    if (!this._visible) {
      if (this.commandPalette === undefined) {
        this.commandPalette = document.createElement('div');
        this.commandPalette.className = 'commandPalette';
        parent.appendChild(this.commandPalette);
        this.updatePaletteSize();
      }

      for (let a of this.actions) {
        a.destroyButton(this.commandPalette);
      }

      for (let a of this.actions) {
        a.renderButton(this.commandPalette);
      }

      setElementVisible(this.commandPalette, true);
      this._visible = true;
    } else {
      setElementVisible(this.commandPalette, false);
      this._visible = false;
    }
  }

  registerAction(action: IAction): void {
    this.actions.push(action);
  }

  private updatePaletteSize() {
    if (this.commandPalette === undefined) {
      return;
    }
    this.commandPalette.style.left = '0';
    if (this.props.w !== 0) {
      this.commandPalette.style.width = this.props.w.toString();
    }
  }
}

export class CommandBar extends UiLayer2<CommandBarProps> implements ICommandBar {
  //private editButton: HTMLButtonElement;
  //private tileButton: HTMLButtonElement;
  private actionButton: HTMLButtonElement;
  private _palette: CommandPalette;
  private propPane: HTMLElement | undefined;

  public constructor(props: CommandBarProps) {
    let element = document.createElement('div');
    element.className = 'barLayer';

    props.w = 0;
    props.h = 0;
    super(props, element);

    this.actionButton = createButton(element, 'A', this.onAction.bind(this));

    this._palette = new CommandPalette(this.props);

    // make list of possible actions
    this._palette.registerAction(new UploadVoxAction(this));
    this._palette.registerAction(new MoveCameraAction(this));

    // <button type="button" class="nes-btn is-primary">Primary</button>
    //this.editButton = createButton(this._element, 'EDIT', (evt: any): any => props.onToggleEdit());

    // this.onUpdateMapEditorState();
  }

  public displayError(text: string) {
    console.log(text);
  }

  openDetailsPane(elem: HTMLElement): void {
    if (this.propPane !== undefined) {
      this.closeDetailsPane();
    }

    this.element.appendChild(elem);
    this.propPane = elem;
  }
  closeDetailsPane(): void {
    if (this.propPane === undefined) {
      return;
    }

    this.element.removeChild(this.propPane);
    this.propPane = undefined;
  }

  private onAction() {
    this._palette.setVisible(!this._palette.visible, this.element);
  }
}
