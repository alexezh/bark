import { GridPos, GridRect } from "../posh/pos";
import { Container as PixiContainer } from 'pixijs';
import { IAvatar } from "./iavatar";
import { MapCodeLib, MapLocation, MapProps } from "./igamemap";

export type WireTileLayerSegment = {
  id: number;
  rect: GridRect;
  tiles: number[];
}

export type WireWorldLayerProps = {
  id: string;
  pxX: number;
  pxY: number;
  pxWidth: number;
  pxHeight: number;
}

export type WireTileLayerProps = WireWorldLayerProps & {
  gridWidth: number;
  gridHeight: number;
  cellWidth: number;
  cellHeight: number;
  segmentWidth: number;
  segmentHeight: number;
}

export type WireWorldLayer = {
  tileProps: WireTileLayerProps,
  props: WireWorldLayerProps,
  segments: WireTileLayerSegment[]
}

export type GameLayerProps = {
  mapId: string;
  id: string;
  pxX: number;
  pxY: number;
  pxWidth: number;
  pxHeight: number;
}

export type WireMapData = {
  props: MapProps;
  codeLib: MapCodeLib;
  layers: WireWorldLayer[];
}

export function GameLayerProps_fromWireProps(mapId: string, props: WireWorldLayerProps): GameLayerProps {
  return {
    mapId: mapId,
    id: props.id,
    pxX: props.pxX,
    pxY: props.pxY,
    pxWidth: props.pxWidth,
    pxHeight: props.pxHeight
  };
}

export enum WordLayerKind {
  unknown,
  tile,
  sprite,
}

export interface IGameLayer {
  get id(): string;

  get visible(): boolean;
  set visible(val: boolean);

  renderArea(rect: GridRect): void;
  prefetchArea(rect: GridRect): void;
  get container(): PixiContainer | undefined;

  addAvatar(avatar: IAvatar): void;
  removeAvatar(avatar: IAvatar): void;

  addLocation(id: string, region: GridRect): void;
  getLocation(id: string): MapLocation | undefined;
  deleteLocation(id: string): void;
  getLocationsByRect(pos: GridPos): IterableIterator<MapLocation>;

  startEdit(): void;
  endEdit(): void;

  onAvatarPosChanged(avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined): void;
}

// abstract class for game layers
export abstract class GameLayer<T extends GameLayerProps> implements IGameLayer {
  public readonly props: T;
  protected isVisible: boolean = true;

  public constructor(props: T) {
    this.props = props;
  }

  get id(): string { return this.props.id; }

  set visible(val: boolean) { this.isVisible = val; }
  get visible(): boolean { return this.isVisible; }

  get container(): PixiContainer | undefined {
    return undefined;
  }

  addLocation(id: string, region: GridRect): void {

  }
  getLocation(id: string): MapLocation | undefined {
    return undefined;
  }

  deleteLocation(id: string): void {

  }

  *getLocationsByRect(pos: GridPos): IterableIterator<MapLocation> {

  }

  addAvatar(avatar: IAvatar): void {

  }

  removeAvatar(avatar: IAvatar): void {

  }

  renderArea(rect: GridRect): void {

  }

  prefetchArea(rect: GridRect): void {

  }

  public startEdit(): void {

  }

  public endEdit(): void {

  }

  public onAvatarPosChanged(avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined): void {

  }
}