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

  //get x(): number;
  //get y(): number;
  //get w(): number;
  //get h(): number;

  get element(): HTMLElement;
  get visible(): boolean;
  set visible(val: boolean);

  focus(): void;
  setCompositor(compositor: IUiCompositor | undefined): void;
}

export class UiLayer2<T extends UiLayerProps> implements IUiLayer2 {
  public props: T;
  protected _element: HTMLElement;
  private _visible: boolean = true;
  protected _compositor: IUiCompositor | undefined;
  private _onFocusOut?: () => void;

  public constructor(props: T, element: HTMLElement, attachMouse: boolean = true) {
    this.props = props;
    this._element = element;

    element.id = props.id;
    this.updateElementSize();

    // if (attachMouse) {
    //   element.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    //   element.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    //   element.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    //   element.addEventListener('wheel', this.onWheel.bind(this), false);

    //   element.addEventListener('contextmenu', this.onContextMenu.bind(this), false);

    //   element.addEventListener('pointerdown', this.onPointerDown.bind(this), false);
    //   element.addEventListener('pointercancel', this.onPointerUp.bind(this), false);
    // }

    // update initial visibility
    this.visible = (props.visible !== undefined && props.visible === true);
  }

  get element(): HTMLElement { return this._element };

  get id(): string { return this.props.id; }
  //get x(): number { return this.props.x; }
  //get y(): number { return this.props.y; }
  //get w(): number { return this.props.w; }
  //get h(): number { return this.props.h; }

  get visible(): boolean { return this._visible; }
  set visible(val: boolean) {
    this._visible = val;
    this.element.style.display = (val) ? 'block' : 'none';
  }

  public focus(): void {
    this._element.focus();
  }

  public setCompositor(compositor: IUiCompositor | undefined): void {
    this._compositor = compositor;
  }

  protected updateElementSize() {
    this.element.style.left = this.props.x.toString();
    this.element.style.top = this.props.y.toString();
    if (this.props.w !== 0) {
      this.element.style.width = this.props.w.toString();
    }
    if (this.props.h !== 0) {
      this.element.style.height = this.props.h.toString();
    }
  }
}

