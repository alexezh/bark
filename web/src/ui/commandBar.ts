import { MapEditorChangeEvent, MapEditorState } from "../posh/mapeditorstate";
import { createButton, setElementVisible } from "./htmlutils";
import { IAction } from "./iaction";
import { ShellProps } from "./shell";
import { UiLayer2, UiLayerProps } from "./uilayer";
import { UploadVoxAction } from "../actions/uploadaction";

export type CommandBarProps = UiLayerProps & {
  termProps: ShellProps;
  // world: World;
  mapEditorState: MapEditorState;
}

export interface ICommandBar {
  displayError(text: string);
}

export class CommandBar extends UiLayer2<CommandBarProps> implements ICommandBar {
  //private editButton: HTMLButtonElement;
  //private tileButton: HTMLButtonElement;
  private actions: IAction[] = [];
  private actionButton: HTMLButtonElement;
  private commandPaletteVisible = false;
  private commandPalette: HTMLDivElement | undefined;

  public constructor(props: CommandBarProps) {
    let element = document.createElement('div');
    element.className = 'barLayer';

    super(props, element);

    this.actionButton = createButton(element, 'A', this.onAction.bind(this));

    // make list of possible actions
    this.actions.push(new UploadVoxAction(this));

    // <button type="button" class="nes-btn is-primary">Primary</button>
    //this.editButton = createButton(this._element, 'EDIT', (evt: any): any => props.onToggleEdit());

    // this.onUpdateMapEditorState();
  }

  public displayError(text: string) {
    console.log(text);
  }

  private onAction() {
    if (!this.commandPaletteVisible) {
      for (let a of this.actions) {
        a.render(this.element);
      }
  
      this.commandPaletteVisible = false;
    } else {
      setElementVisible(this.commandPalette, false);
      this.commandPaletteVisible = false;
    }
  }
}
