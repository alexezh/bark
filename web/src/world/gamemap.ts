import { IGameLayer, WireMapData } from "./gamelayer";
import { GamePhysics } from "../graphics/gamephysics";
import { TileLayer, TileLayerProps_fromWireProps } from "./tilelayer";
import { GridRect, GridSize, PxRect, pxRectToGridRect } from "../posh/pos";
import { IGameMap, MapCodeLib, MapLocation, MapProps } from "./igamemap";
import { gameState } from "./igamestate";
import { CodeCategory } from "../mechanics/iavatarcode";
import { codeLoader } from "../mechanics/codeloader";
import { createGameMechanics, IGameMechanics } from "../mechanics/igamemechanics";
import { fetchFiles, fetchMap } from "../fetchadapter";

export type PixelSize = {
  x: number;
  y: number;
}

export type WorldProps = {
  id: string;
  maps: string[];
}


export class GameMap implements IGameMap {
  public readonly props: MapProps;
  public readonly codeLib: MapCodeLib;
  // layers in display order
  private readonly layers: IGameLayer[] = [];
  private viewportArea?: GridRect;
  // unclipped prefetch area (can be negative x)
  private prefetchArea?: GridRect;
  private prefetchSize: GridSize = { w: 10, h: 10 };

  // layers for lookup
  private layerMap: { [id: string]: IGameLayer } = {};

  public readonly physics: GamePhysics;
  public readonly mechanics: IGameMechanics;

  public constructor(data: WireMapData) {
    this.props = data.props;
    if (data.codeLib === undefined || data.codeLib == null) {
      this.codeLib = { battle: null };
    } else {
      this.codeLib = data.codeLib;
    }

    this.physics = new GamePhysics(this);
    this.mechanics = createGameMechanics(this, this.physics, gameState.avatarCollection);

    data.layers.forEach((x, idx) => {
      if (x.tileProps !== undefined && x.tileProps !== null) {
        let tileLayer = new TileLayer(TileLayerProps_fromWireProps(data.props.id, x.tileProps));
        this.addLayer(tileLayer);
        tileLayer.loadSegments(x.segments);
      }
    });
  }

  public static async load(name: string) {
    let wireMap = await fetchMap("default");
    //let locations = await fetchFiles("");

    return new GameMap(wireMap);
  }

  public addLayer(layer: IGameLayer, insertAfter: string | undefined = undefined) {
    if (insertAfter === undefined) {
      this.layers.push(layer);
    }
    else {
      let idx = this.layers.findIndex((x) => x.id === insertAfter);
      this.layers.splice(idx, 0, layer);
    }
    this.layerMap[layer.id] = layer;
  }

  public removeLayer(id: string) {
    let idx = this.layers.findIndex((x) => x.id === id);
    if (idx != -1) {
      this.layers.splice(idx, 1);
    }
    delete this.layerMap[id];
  }

  public getLayer(id: string | undefined): IGameLayer | undefined {
    if (id === undefined) {
      return undefined;
    }
    return this.layerMap[id];
  }

  public setViewport(pxRect: PxRect) {
    let newPort = pxRectToGridRect(pxRect);
    this.viewportArea = newPort;

    let prefetchArea = {
      x: newPort.x - this.prefetchSize.w,
      y: newPort.y - this.prefetchSize.h,
      w: newPort.w + this.prefetchSize.w * 2,
      h: newPort.h + this.prefetchSize.h * 2,
    }

    let prefetch = false;
    if (this.prefetchArea !== undefined) {
      if (Math.abs(this.prefetchArea.x - prefetchArea.x) > this.prefetchSize.w / 2 ||
        Math.abs(this.prefetchArea.y - prefetchArea.y) > this.prefetchSize.h / 2) {
        prefetch = true;
      }
    }
    else {
      prefetch = true;
    }

    if (prefetch) {
      for (let layer of this.layers) {
        layer.prefetchArea(prefetchArea!);
      }

      this.prefetchArea = prefetchArea;
    }
  }

  public forEachLayer(startLayer: string | undefined, func: (layer: IGameLayer) => void) {
    let found: boolean = (startLayer === undefined);
    this.layers.forEach((layer: IGameLayer) => {
      if (found) {
        func(layer);
      } else {
        if (layer.id === startLayer) {
          func(layer);
          found = true;
        }
      }
    })
  }
}
