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

  public constructor(props: T, element: HTMLElement) {
    this.props = props;
    this._element = element;

    element.id = props.id;
    this.updateElementSize();

    let self = this;
    element.addEventListener('mousedown', (evt) => self.onMouseDown(evt), false);
    element.addEventListener('mouseup', (evt) => self.onMouseUp(evt), false);
    element.addEventListener('mousemove', (evt) => self.onMouseMove(evt), false);
    element.addEventListener('wheel', (evt) => self.onWheel(evt), false);

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

  public onMouseMove(evt: MouseEvent): boolean {
    return false;
  }

  public onMouseDown(evt: MouseEvent): boolean {
    return false;
  }

  public onMouseUp(evt: MouseEvent): boolean {
    return false;
  }

  public onWheel(evt: WheelEvent): boolean {
    return false;
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

