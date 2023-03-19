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
  onToggleEdit: () => void;
  onToggleTerm: () => void;
  onToggleMap: () => void;
}

export interface ICommandBar {
  displayError(text: string);
}

export class CommandBar extends UiLayer2<CommandBarProps> implements ICommandBar {
  //private editButton: HTMLButtonElement;
  //private tileButton: HTMLButtonElement;
  private actions: IAction[] = [];

  public constructor(props: CommandBarProps) {
    let element = document.createElement('div');
    element.className = 'barLayer';

    super(props, element);

    this.actions.push(new UploadVoxAction(this));

    for (let a of this.actions) {
      a.render(this.element);
    }
    // <button type="button" class="nes-btn is-primary">Primary</button>
    //this.editButton = createButton(this._element, 'EDIT', (evt: any): any => props.onToggleEdit());

    // this.onUpdateMapEditorState();
  }

  public displayError(text: string) {
    console.log(text);
  }
}
