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
    for (let e of layer.elements) {
      this.container.appendChild(e);
    }
    this.layerMap[layer.id] = layer;
  }

  public insertLayerBefore(layer: IUiLayer2, insertBefore: string) {
    layer.setCompositor(this);
    this.layerMap[layer.id] = layer;

    let insertBeforeLayer = this.layerMap[insertBefore];
    for (let e of layer.elements) {
      this.container.insertBefore(e, insertBeforeLayer.elements[0]);
    }
  }

  public removeLayer(id: string) {
    let layer = this.layerMap[id];
    layer.setCompositor(undefined);
    delete this.layerMap[id];
    for (let e of layer.elements) {
      this.container.removeChild(e);
    }
  }

  public getLayer(id: string) {
    return this.layerMap[id];
  }
}
