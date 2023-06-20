import _ from "lodash";
import { IUiCompositor } from "./uicompositor";

export type UiLayerProps = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible?: boolean;
}

export interface IUiLayer2 {
  get id(): string;

  get elements(): HTMLElement[];
  get visible(): boolean;
  set visible(val: boolean);

  focus(): void;
  setCompositor(compositor: IUiCompositor | undefined): void;
}

export class UiLayer2<T extends UiLayerProps> implements IUiLayer2 {
  public props: T;
  protected _elements: HTMLElement[] = [];
  private _visible: boolean = true;
  protected _compositor: IUiCompositor | undefined;
  private _onFocusOut?: () => void;

  public constructor(props: T, elements: HTMLElement[]) {
    this.props = props;
    this._elements = elements;

    this.updateElementSize();

    // update initial visibility
    this.visible = (props.visible !== undefined && props.visible === true);
  }

  get elements(): HTMLElement[] { return this._elements };

  get id(): string { return this.props.id; }

  get visible(): boolean { return this._visible; }
  set visible(val: boolean) {
    this._visible = val;
    this._elements[0].style.display = (val) ? 'block' : 'none';
  }

  public focus(): void {
    this._elements[0].focus();
  }

  public setCompositor(compositor: IUiCompositor | undefined): void {
    this._compositor = compositor;
  }

  protected updateElementSize() {
    this._elements[0].style.left = this.props.x.toString();
    this._elements[0].style.top = this.props.y.toString();
    if (this.props.w !== 0) {
      this._elements[0].style.width = this.props.w.toString();
    }
    if (this.props.h !== 0) {
      this._elements[0].style.height = this.props.h.toString();
    }
  }
}

