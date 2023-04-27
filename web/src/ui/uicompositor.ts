import { PxSize } from "../lib/pos";
import { IUiLayer2 } from "./uilayer";

export interface IUiCompositor {
  get size(): PxSize;
}

export class UiCompositor2 implements IUiCompositor {
  private container: HTMLDivElement;
  private _size: PxSize;

  // layers for lookup
  private layerMap: { [id: string]: IUiLayer2 } = {};

  public get size(): PxSize { return this._size; }

  public constructor(container: HTMLDivElement, size: PxSize) {
    this.container = container;
    this._size = size;
  }

  public appendLayer(layer: IUiLayer2) {
    layer.setCompositor(this);
    this.container.appendChild(layer.element);
    this.layerMap[layer.id] = layer;
  }

  public insertLayerBefore(layer: IUiLayer2, insertBefore: string) {
    layer.setCompositor(this);
    this.layerMap[layer.id] = layer;

    let insertBeforeLayer = this.layerMap[insertBefore];
    this.container.insertBefore(layer.element, insertBeforeLayer.element);
  }

  public removeLayer(id: string) {
    let layer = this.layerMap[id];
    layer.setCompositor(undefined);
    delete this.layerMap[id];
    this.container.removeChild(layer.element);
  }

  public getLayer(id: string) {
    return this.layerMap[id];
  }
}
