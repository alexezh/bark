import { MapEditorChangeEvent, MapEditorState } from "../posh/mapeditorstate";
import { createButton, setElementVisible } from "./htmlutils";
import { ShellProps } from "./shell";
import { UiLayer2, UiLayerProps } from "./uilayer";

export type CommandBarProps = UiLayerProps & {
  termProps: ShellProps;
  // world: World;
  mapEditorState: MapEditorState;
  onToggleEdit: () => void;
  onToggleTerm: () => void;
  onToggleMap: () => void;
}

export class CommandBar extends UiLayer2<CommandBarProps> {
  private editButton: HTMLButtonElement;
  private termButton: HTMLButtonElement;
  //private tileButton: HTMLButtonElement;
  private mapButton: HTMLButtonElement;

  public constructor(props: CommandBarProps) {
    let element = document.createElement('div');
    element.className = 'barLayer';

    super(props, element);

    this.props.mapEditorState.onChanged(this, (evt: MapEditorChangeEvent) => {
      this.onUpdateMapEditorState();
    });


    // <button type="button" class="nes-btn is-primary">Primary</button>
    this.editButton = createButton(this._element, 'EDIT', (evt: any): any => props.onToggleEdit());
    this.termButton = createButton(this._element, 'TERM', (evt: any): any => props.onToggleTerm());
    this.mapButton = createButton(this._element, 'MAP', (evt: any): any => props.onToggleMap());
    //this.tileButton = createButton(this._element, 'TILE', (evt: any): any => props.onToggleTile());

    this.onUpdateMapEditorState();
  }

  private createLayerBox(text: string): HTMLLabelElement {
    let label = document.createElement('label');
    let input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'nes-checkbox';
    label.appendChild(input);
    let span = document.createElement('span');
    span.textContent = text;
    label.appendChild(span);

    this._element.appendChild(label);

    return label;
  }

  onUpdateMapEditorState() {
    // setElementVisible(this.tileButton, this.props.mapEditorState.isEditMode);
  }
}
