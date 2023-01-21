import { throws } from "assert";
import { MapEditorChangeEvent, MapEditorState } from "../posh/mapeditorstate";
import { IRepl, VarChangedEvent } from "../posh/repl";
import { resourceLib } from "../graphics/resourceLib";
import { TileLayer } from "../world/tilelayer";
import { createTextDiv, setElementVisible } from "./htmlutils";
import { TerminalProps } from "./terminal";
import { UiLayer2, UiLayerProps } from "./uilayer";

type NewType = {
  // world: World;
  mapEditorState: MapEditorState;
  repl: IRepl;
};

export type MapInfoLayerProps = UiLayerProps & NewType

export class MapInfoLayer extends UiLayer2<MapInfoLayerProps> {
  private xElem: HTMLSpanElement;
  private yElem: HTMLSpanElement;
  private layerElem: HTMLSpanElement;
  private tileElem: HTMLSpanElement;
  private catElem: HTMLSpanElement;

  public constructor(props: MapInfoLayerProps) {
    let element = document.createElement('div');
    element.className = 'mapInfoLayer';
    super(props, element);

    let x = createTextDiv();
    this.xElem = x[1];
    this.element.appendChild(x[0]);

    let y = createTextDiv();
    this.yElem = y[1];
    this.element.appendChild(y[0]);

    let tile = createTextDiv();
    this.tileElem = tile[1];
    this.element.appendChild(tile[0]);

    let layer = createTextDiv();
    this.layerElem = layer[1];
    this.element.appendChild(layer[0]);

    let cat = createTextDiv();
    this.catElem = cat[1];
    this.element.appendChild(cat[0]);

    this.props.mapEditorState.onChanged(this, (evt: MapEditorChangeEvent) => {
      this.onUpdateMapEditorState();
    });

    this.props.repl.onVarChanged(this, (evt: VarChangedEvent) => { this.onUpdateMapEditorState(); })
    this.onUpdateMapEditorState();
  }

  onUpdateMapEditorState() {
    let region = this.props.mapEditorState.region;
    let layer = this.props.mapEditorState.currentLayer;

    this.catElem.textContent = '';
    this.tileElem.textContent = '';

    if (region !== undefined) {
      this.xElem.textContent = 'x: ' + region.x;
      this.yElem.textContent = 'y: ' + region.y;
      if (layer !== undefined) {
        if (layer instanceof TileLayer) {
          let tileDef = layer.getTile(region.x, region.y);
          if (tileDef !== undefined) {
            this.tileElem.textContent = 'tileId:' + tileDef.props.id;
            this.catElem.textContent = 'categories: ' + tileDef.categoriesAsString();
          }
        }
      }
    } else {
      this.xElem.textContent = '';
      this.yElem.textContent = '';
    }


    let layerName = (layer !== undefined) ? layer.id : 'all';
    this.layerElem.textContent = 'layer: ' + layerName;
    // setElementVisible(this.tileButton, this.props.mapEditorState.isEditMode);
  }
}
