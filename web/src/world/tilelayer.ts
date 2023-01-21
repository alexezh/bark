import { WireTileLayerProps, WireTileLayerSegment, GameLayer, GameLayerProps } from "./gamelayer";
import { resourceLib } from "../graphics/resourceLib";
import { updateTileLayer } from "../fetchadapter";
import { areRectEqual, clipRect, GridPos, gridPosToPxPos, GridRect, isRectOverlap, scaleToGrid } from "../posh/pos";
import { isAddOn, TileDef } from "./tiledef";
import { Container as PixiContainer, Rectangle } from 'pixijs';
import { IAvatar } from "./iavatar";
import { TileBuffer } from "../graphics/spritesheet";
import { gameMechanics } from "../mechanics/igamemechanics";
import { MapLocation, MapLocationProps } from "./igamemap";
import { Quadtree } from '../quadtree/Quadtree';
import { Rectangle as QRect } from '../quadtree/Rectangle';

export type TileLayerProps = GameLayerProps & {
  gridWidth: number;
  gridHeight: number;
  cellWidth: number;
  cellHeight: number;
  // width of segment (in grid units)
  // must be power of 2
  segmentWidth: number;
  // height of segment (in grid units)
  // must be power of 2
  segmentHeight: number;
}

export function TileLayerProps_fromWireProps(mapId: string, props: WireTileLayerProps): TileLayerProps {
  return {
    mapId: mapId,
    id: props.id,
    pxX: props.pxX,
    pxY: props.pxY,
    pxWidth: props.pxWidth,
    pxHeight: props.pxHeight,
    gridWidth: props.gridWidth,
    gridHeight: props.gridHeight,
    cellWidth: props.cellWidth,
    cellHeight: props.cellHeight,
    segmentWidth: props.segmentWidth,
    segmentHeight: props.segmentHeight
  };
}

export type WireTileUpdate = {
  x: number;
  y: number;
  tileId: number;
}

export type WireTileLayerUpdate = {
  mapId: string;
  layerId: string;
  tiles: WireTileUpdate[];
}

export class TileLayerSegment {
  public data: WireTileLayerSegment;
  private tileContainer?: PixiContainer;
  private avatars: Map<string, IAvatar> = new Map<string, IAvatar>();

  public get loaded() { return this.tileContainer !== undefined; }

  public constructor(data: WireTileLayerSegment) {
    this.data = data;
  }

  public load(parent: PixiContainer) {
    if (this.tileContainer !== undefined) {
      return;
    }

    let rect = this.data.rect;
    this.tileContainer = new PixiContainer();
    this.tileContainer.position = gridPosToPxPos(rect);
    parent.addChild(this.tileContainer);

    this.loadTiles();

    for (let a of this.avatars) {
      gameMechanics.addLiveAvatar(a[1]);
    }
  }

  public unload(parent: PixiContainer) {
    if (this.tileContainer === undefined) {
      return;
    }

    parent.removeChild(this.tileContainer);
    this.tileContainer.destroy();
    this.tileContainer = undefined;

    for (let a of this.avatars) {
      gameMechanics.removeLiveAvatar(a[1]);
    }
  }

  private loadTiles() {
    let rect = this.data.rect;

    for (let i = 0; i < rect.h; i++) {
      for (let j = 0; j < rect.w; j++) {
        if (this.data.tiles === null) {
          continue;
        }

        let tileId = this.data.tiles[i * rect.w + j];
        let tile = resourceLib.getTileById(tileId);
        if (tile === undefined) {
          continue;
        }

        if (tile.sheet !== undefined) {
          let sprite = resourceLib.createTileSprite(tile, gridPosToPxPos({ x: j, y: i }));
          if (sprite !== undefined) {
            this.tileContainer!.addChild(sprite);
          }
        } else {

          let baseSprite = resourceLib.createTileSprite(tile.baseTile, gridPosToPxPos({ x: j, y: i }));
          if (baseSprite !== undefined) {
            this.tileContainer!.addChild(baseSprite);
          }

          let addOnSprite = resourceLib.createTileSprite(tile.addOnTile, gridPosToPxPos({ x: j, y: i }));
          if (addOnSprite !== undefined) {
            this.tileContainer!.addChild(addOnSprite);
          }
        }
      }
    }
  }

  public getTile(x: number, y: number): number {
    return this.data.tiles[y * this.data.rect.w + x];
  }

  public setTile(x: number, y: number, tileId: number) {
    this.data.tiles[y * this.data.rect.w + x] = tileId;

    if (this.tileContainer !== undefined) {
      this.tileContainer.removeChildren();
      this.loadTiles();
    }
  }

  public addAvatar(avatar: IAvatar) {
    this.avatars.set(avatar.id, avatar);
    if (this.tileContainer !== undefined) {
      gameMechanics.addLiveAvatar(avatar);
    }
  }

  public removeAvatar(avatar: IAvatar) {
    this.avatars.delete(avatar.id);
    gameMechanics.removeLiveAvatar(avatar);
  }

  public getAvatarByPos(x: number, y: number): IAvatar | undefined {
    for (let el of this.avatars) {
      let pos = el[1].props.pos!;
      if (pos.x === x && pos.y === y) {
        return el[1];
      }
    }

    return undefined;
  }
}

export class TileLayer extends GameLayer<TileLayerProps> {
  private pendingChange?: WireTileLayerUpdate;
  private dirty: boolean = false;
  private _segments: TileLayerSegment[] = [];
  private _segmentPrefetchRect?: GridRect;
  private readonly layerContainer: PixiContainer;
  private readonly segmentContainer: PixiContainer;
  private segmentStride: number;
  // ATT: with segment logic, we might want to move sprites to actual segments
  private readonly spriteContainer: PixiContainer;
  private readonly locationTree: Quadtree<QRect<MapLocation>>;
  private readonly locations: Map<string, MapLocation>;

  public constructor(props: TileLayerProps) {
    super(props);
    this.layerContainer = new PixiContainer();
    this.segmentContainer = new PixiContainer();
    this.spriteContainer = new PixiContainer();
    this.layerContainer.addChild(this.segmentContainer);
    this.layerContainer.addChild(this.spriteContainer);
    this.segmentStride = Math.floor(this.props.gridWidth / this.props.segmentWidth);

    this.locations = new Map<string, MapLocation>();
    this.locationTree = new Quadtree({
      width: this.props.gridWidth,
      height: this.props.gridHeight
    });
  }

  get container(): PixiContainer | undefined {
    return this.layerContainer;
  }

  public loadSegments(segments: WireTileLayerSegment[]) {
    segments.forEach(segment => {
      this._segments.push(new TileLayerSegment(segment));
    });
  }

  public prefetchArea(prefetchRect: GridRect): void {
    let rect = clipRect(prefetchRect, this.props.gridWidth, this.props.gridHeight);

    let segRect = scaleToGrid(rect, this.props.segmentWidth, this.props.segmentHeight);
    if (this._segmentPrefetchRect !== undefined && areRectEqual(segRect, this._segmentPrefetchRect)) {
      return;
    }

    this.prefetchSegments(segRect);
  }

  private prefetchSegments(segRect: GridRect) {
    // unload existing segments
    if (this._segmentPrefetchRect !== undefined) {
      let oldRect = this._segmentPrefetchRect;
      for (let i = 0; i < oldRect.h; i++) {
        for (let j = 0; j < oldRect.w; j++) {
          let segment = this._segments[(i + oldRect.y) * this.segmentStride + oldRect.x + j];
          // check if segment overlaps with new rect
          if (!isRectOverlap(segment.data.rect, segRect)) {
            segment.unload(this.segmentContainer);
          }
        }
      }
    }

    let loaded = 0
    for (let i = 0; i < segRect.h; i++) {
      for (let j = 0; j < segRect.w; j++) {
        let segment = this._segments[(i + segRect.y) * this.segmentStride + segRect.x + j];
        if (!segment.loaded) {
          segment.load(this.segmentContainer);
          loaded++;
        }
      }
    }
    if (loaded > 0) {
      console.log('Loaded segments :' + loaded);
    }

    this._segmentPrefetchRect = segRect;
  }

  public addAvatar(avatar: IAvatar): void {
    avatar.layer = this;

    let segment = this._getSegment(avatar.currentPos!.x, avatar.currentPos!.y);
    segment.addAvatar(avatar);
    //avatar.layer = this;
    if (avatar.skin !== undefined) {
      this.spriteContainer.addChild(avatar.skin!.pixiSprite);
    }
  }

  public removeAvatar(avatar: IAvatar): void {
    let segment = this._getSegment(avatar.currentPos!.x, avatar.currentPos!.y);
    segment.removeAvatar(avatar);
    avatar.layer = undefined;
    this.spriteContainer.removeChild(avatar.skin!.pixiSprite);
  }

  public onAvatarPosChanged(avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined): void {
    let oldSegment: TileLayerSegment | undefined = undefined;
    let newSegment: TileLayerSegment | undefined = undefined;
    if (oldPos !== undefined) {
      oldSegment = this._getSegment(oldPos.x, oldPos.y);
    }
    if (newPos !== undefined) {
      newSegment = this._getSegment(newPos.x, newPos.y);
    }

    if (oldSegment !== newSegment) {
      if (oldSegment !== undefined) {
        oldSegment.removeAvatar(avatar);
      }
      if (newSegment !== undefined) {
        newSegment.addAvatar(avatar);
      }
    }
  }

  public getAvatarByPos(x: number, y: number): IAvatar | undefined {
    let segment = this._getSegment(x, y);

    // for avatars we use absolute positions
    return segment.getAvatarByPos(x, y);
  }

  public setTile(x: number, y: number, tileId: number | undefined) {
    if (tileId === undefined) {
      return;
    }

    this._setTile(x, y, tileId);
    if (this.pendingChange !== undefined) {
      this.pendingChange.tiles.push({
        x: x,
        y: y,
        tileId: tileId
      });

      this.flushPendingQueueIf();
    }
    this.dirty = true;
  }

  public getTile(x: number, y: number): TileDef | undefined {
    if (x < 0 || y < 0) {
      return undefined;
    }

    let id = this._getTile(x, y);
    let tileDef = resourceLib.getTileById(id);
    return tileDef;
  }

  private _getSegment(x: number, y: number): TileLayerSegment {
    let segX = Math.floor(x / this.props.segmentWidth);
    let segY = Math.floor(y / this.props.segmentHeight);

    let segment = this._segments[segY * this.segmentStride + segX];
    return segment;
  }

  private _getTile(x: number, y: number): number {

    let segment = this._getSegment(x, y);
    if (segment.data.tiles === null) {
      return 0;
    }

    return segment.data.tiles[(y % this.props.segmentHeight) * this.props.segmentWidth + (x % this.props.segmentWidth)];
  }

  private _setTile(x: number, y: number, tileId: number) {
    let segment = this._getSegment(x, y);
    if (segment.data.tiles === null) {
      segment.data.tiles = new Array(segment.data.rect.w * segment.data.rect.h).fill(0);
    }

    segment.setTile(x % this.props.segmentWidth, y % this.props.segmentHeight, tileId);
  }

  public forEachTile(reg: GridRect, func: (tileId: number) => void) {
    let clip = clipRect(reg, this.props.gridWidth, this.props.gridHeight);
    for (let i = 0; i < clip.h; i++) {
      for (let j = 0; j < clip.w; j++) {
        let y = clip.y + i;
        let id = this._getTile(clip.x + j, y);
        func(id);
      }
    }
  }

  public clearRegion(reg: GridRect) {
    let clip = clipRect(reg, this.props.gridWidth, this.props.gridHeight);
    for (let i = 0; i < clip.h; i++) {
      for (let j = 0; j < clip.w; j++) {
        let y = clip.y + i;
        let x = clip.x + j;
        this._setTile(clip.x + j, y, 0);
        if (this.pendingChange !== undefined) {
          this.pendingChange.tiles.push({
            x: x,
            y: y,
            tileId: 0
          })
          this.flushPendingQueueIf();
        }
      }
    }
    this.dirty = true;
  }

  public fillRegion(reg: GridRect, tileId: number) {
    let clip = clipRect(reg, this.props.gridWidth, this.props.gridHeight);
    for (let i = 0; i < clip.h; i++) {
      for (let j = 0; j < clip.w; j++) {
        let y = clip.y + i;
        let x = clip.x + j;
        this._setTile(clip.x + j, y, tileId);
        if (this.pendingChange !== undefined) {
          this.pendingChange.tiles.push({
            x: x,
            y: y,
            tileId: tileId
          })
          this.flushPendingQueueIf();
        }
      }
    }
    this.dirty = true;
  }

  public async updateRegion(pos: GridPos, tileBuffer: TileBuffer): Promise<boolean> {
    let rect = { x: pos.x, y: pos.y, w: tileBuffer.w, h: tileBuffer.h };
    let clip = clipRect(rect, this.props.gridWidth, this.props.gridHeight);
    let idx = 0;
    for (let i = 0; i < clip.h; i++) {
      for (let j = 0; j < clip.w; j++) {
        let y = clip.y + i;
        let x = clip.x + j;
        let tileId = tileBuffer.tiles[idx];
        idx++;
        tileId = await this.updateTile(x, y, tileId);
        if (this.pendingChange !== undefined) {
          this.pendingChange.tiles.push({
            x: x,
            y: y,
            tileId: tileId
          });
          this.flushPendingQueueIf();
        }
      }
    }
    this.dirty = true;
    return true;
  }

  public getRegion(rect: GridRect): TileBuffer {
    let clip = clipRect(rect, this.props.gridWidth, this.props.gridHeight);
    let buffer: TileBuffer = {
      w: clip.w,
      h: clip.h,
      tiles: []
    }

    for (let i = 0; i < clip.h; i++) {
      for (let j = 0; j < clip.w; j++) {
        let y = clip.y + i;
        let tileId = this._getTile(clip.x + j, y);
        buffer.tiles.push(tileId);
      }
    }

    return buffer;
  }

  public startEdit() {
    this.pendingChange = {
      mapId: this.props.mapId,
      layerId: this.props.id,
      tiles: []
    };
  }

  public endEdit() {
    if (!this.dirty) {
      return;
    }

    updateTileLayer(this.pendingChange!);
    this.pendingChange = undefined;
  }

  addLocation(id: string, region: GridRect): void {
    let loc = new MapLocation({
      mapId: this.props.mapId,
      layerId: this.props.id,
      id: id,
      rect: region,
      code: ''
    });

    this.locations.set(id, loc);

    this.locationTree.insert(new QRect<MapLocation>({
      x: region.x,
      y: region.y,
      width: region.w,
      height: region.h,
      data: loc
    }));
  }

  getLocation(id: string): MapLocation | undefined {
    return this.locations.get(id);
  }

  *getLocationsByRect(pos: GridPos): IterableIterator<MapLocation> {
    let rects = this.locationTree.retrieve(new QRect({
      x: pos.x,
      y: pos.y,
      width: 1,
      height: 1,
    }));

    if (rects === undefined || rects.length === 0) {
      return;
    }

    for (let e of rects) {
      yield e.data!;
    }
  }

  deleteLocation(id: string): void {
    let loc = this.locations.get(id);
    if (loc === undefined) {
      return;
    }

    this.locations.delete(id);
    //this.locationTree.
  }

  private async updateTile(x: number, y: number, tileId: number): Promise<number> {
    let tileIdx = y * this.props.gridWidth + x;
    let currentTileId = this._getTile(x, y);
    if (currentTileId === 0) {
      this._setTile(x, y, tileId);
    } else {
      // check if tile is addon and make composed tile
      let currentTile = resourceLib.getTileById(currentTileId);
      let newTile = resourceLib.getTileById(tileId);

      if (newTile === undefined) {
        return tileId;
      }

      if (!isAddOn(newTile.props) || currentTile === undefined) {
        this._setTile(x, y, tileId);
        return tileId;
      }

      let combimedTile = await resourceLib.findOrAddTile(currentTile, newTile);
      this._setTile(x, y, combimedTile.props.id);
      return combimedTile.props.id;
    }

    return tileId;
  }

  private flushPendingQueueIf() {
    if (this.pendingChange!.tiles.length > 20000) {
      updateTileLayer(this.pendingChange!);
      this.pendingChange = {
        mapId: this.props.mapId,
        layerId: this.props.id,
        tiles: []
      };
    }
  }
}

