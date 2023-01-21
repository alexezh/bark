import { SpriteSheet } from "../graphics/spritesheet";

export enum TileCategory {
  ground = 'ground',
  barrier = 'barrier',
  water = 'water',
  sand = 'sand',
  grass = 'grass',
  drygrass = 'drygrass',
  bush = 'bush',
  tree = 'tree',
  mountain = 'mountain',
  house = 'house',
  addon = 'addon',
  ladder = 'ladder',

  // use by generation 0 stage of map
  gen0 = 'gen0',

  // composition of multiple tiles
  custom = 'custom'
}

export function describeTileCategories(): string {
  let s = '';

  let sep = false;
  for (let c in TileCategory) {
    if (sep) {
      s += ';'
    }
    s += c;
    sep = true;
  }
  return s;
}

export type WireTileDefProps = {
  // actually, spritesheet id
  atlasId?: string;
  // index of tile within a spritesheet
  idx?: number;

  // id of tile for map
  id: number;
  categories?: { [id: string]: boolean };
  // base tiles for this tile
  // we are going to allocate new tiles for map every time we add
  // new combination of new behavior
  baseTile?: number;
  addOnTile?: number;

  codeFile?: string;
}

export type WireAddCompositeTileResponse = {
  tileId: number;
}

function tileIdToString(id: number | undefined): string {
  return id !== undefined ? id.toString() : '0';
}

export function isAddOn(props: WireTileDefProps): boolean {
  if (props.categories === undefined) {
    return false;
  }
  return props.categories[TileCategory.addon];
}

export function getComposedTileId(base: number | undefined, addon: number | undefined) {
  return `${tileIdToString(base)}_${tileIdToString(addon)}`;
}

export type WireTileCollectionProps = {
  tiles: WireTileDefProps[];
}

export class TileDef {
  public readonly props: WireTileDefProps;
  public readonly sheet?: SpriteSheet;
  public readonly baseTile: TileDef | undefined;
  public readonly addOnTile: TileDef | undefined;
  //private readonly base

  public constructor(
    props: WireTileDefProps, sheet: SpriteSheet | undefined, baseTile: TileDef | undefined, addOnTile: TileDef | undefined) {

    this.props = props;
    this.sheet = sheet;
    this.baseTile = baseTile;
    this.addOnTile = addOnTile;
  }

  public categoriesAsString(): string {
    let s: string = '';
    if (this.props.categories !== undefined) {
      let sep = false;
      let keys = Object.keys(this.props.categories);
      for (let x in keys) {
        if (sep) {
          s += ',';
        }
        s += keys[x];
        sep = true;
      }
    }

    return s;
  }
}

