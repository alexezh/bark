import { perlinNoise } from "./perlin";
import { base64ToBytes, bytesToBase64 } from "../posh/base64";
import { ParamDef, ParamType } from "../posh/funcdef";
import { createMapBitmap, MapEditorState } from "../posh/mapeditorstate";
import { PxRect, topLeftPos } from "../posh/pos";
import { Repl } from "../posh/repl";
import { TileLayerWriter } from "./tilelayerwriter";
import { HouseWriter } from "./houseswriter";
import { GenericEditorFuncDef } from "../posh/genericeditorfuncdef";
import { PRNG } from "./prng";

export type GenerateMapParams = {
  command: string,
  p1: string,
  p2: string,
  p3: string,
  p4: string,
}

export type BiomeProps = {
  level: number;
  perlinBase: number;
  seed: number;
}

export type TileReplacementPattern = {
  category: string;
  w: number;
  h: number;
  current: number[];
  replace: number[];
}

export type HouseDef = {
  id: number;
  w: number;
  h: number;
  tiles: number[];
}

export type GenerateMapProps = {
  mapWidth: number;
  mapHeight: number;
  seed: number;
  perlinBase: number;

  waterLevel: number;
  sandLevel: number;
  grassLevel: number;
  mountainLevel: number;

  clip: PxRect;
  detailsBase: number;
  detailsScale: number;

  ground: BiomeProps;
  tree: BiomeProps;
  city: BiomeProps;
  replacePatterns: TileReplacementPattern[];
  houseDefs: HouseDef[];
}

function makeDefaultProps(w: number, h: number) {
  return {
    mapWidth: w,
    mapHeight: h,
    seed: 42,
    perlinBase: 100,

    waterLevel: 100,
    sandLevel: 110,
    grassLevel: 150,
    mountainLevel: 200,

    clip: { x: 0, y: 0, w: 0, h: 0 },
    detailsBase: 60,
    detailsScale: 10,

    ground: {
      perlinBase: 100,
      level: 200,
      seed: 43
    },

    tree: {
      perlinBase: 200,
      level: 200,
      seed: 44,
    },

    city: {
      perlinBase: 200,
      level: 200,
      seed: 45,
    },

    replacePatterns: [],
    houseDefs: []
  }
}

export type RGB = {
  r: number;
  g: number;
  b: number;
}

export enum GroundKind {
  water = 0,
  sand = 1,
  ground = 2,
  grass = 3,
  mountain = 4,
  tree = 5,
  bush = 6,
  city = 7,
  // houses start at 100. 99 used to indicate that block is used by
  // some house started
  houseContinue = 99,
  houseStart = 100,
}

export class GenerateMapDef extends GenericEditorFuncDef {
  public static funcName: string = 'generateMap';

  private repl: Repl;
  private loaded: boolean = false;
  private props?: GenerateMapProps;

  private height?: Uint8ClampedArray;

  // we want to mix grass-sand, grass-ground, grass-tree
  // and one height is not enough since we want different transitions
  // the solution is to keep default (from height) and generate
  // multiple masks for sand, ground and mountain
  private tree?: Uint8ClampedArray;
  private bush?: Uint8ClampedArray;
  private ground?: Uint8ClampedArray;
  private city?: Uint8ClampedArray;

  // save as mapBitmap
  private groundDef?: Uint8Array;
  mapEditorState: any;

  public constructor(mapEditorState: MapEditorState, repl: Repl) {
    super(GenerateMapDef.funcName, mapEditorState);
    this.repl = repl;
  }

  public createParamDefs(): ParamDef[] {
    return [
      { name: 'command', t: ParamType._string, optional: false },
      { name: 'p1', t: ParamType._string, optional: true },
      { name: 'p2', t: ParamType._string, optional: true },
      { name: 'p3', t: ParamType._string, optional: true },
      { name: 'p4', t: ParamType._string, optional: true },
    ];
  }

  public help(): string {
    return 'generate map.' + this.helpUsage();
  }

  private ensureLoaded() {
    if (this.loaded) {
      return;
    }

    let props = window.localStorage.getItem('mapProps');
    if (props === undefined || props === null) {
      this.props = makeDefaultProps(
        this.mapEditorState.world!.props.gridWidth,
        this.mapEditorState.world!.props.gridHeight);

      this.loaded = true;

      return;
    } else {
      let defProps = makeDefaultProps(
        this.mapEditorState.world!.props.gridWidth,
        this.mapEditorState.world!.props.gridHeight);

      this.props = JSON.parse(props)
      if (this.props!.replacePatterns === undefined) {
        this.props!.replacePatterns = [];
      }
      if (this.props!.city === undefined) {
        this.props!.city = defProps.city;
      }
      if (this.props!.houseDefs === undefined) {
        this.props!.houseDefs = [];
      }
    }

    this.height = this.loadBuffer('height');
    this.tree = this.loadBuffer('tree');
    this.bush = this.loadBuffer('bush');
    this.ground = this.loadBuffer('ground');

    if (this.height !== undefined) {
      this.displayHeightMap();
    }

    this.loaded = true;
  }

  private loadBuffer(name: string): Uint8ClampedArray | undefined {
    let data64 = window.localStorage.getItem(name);
    if (data64 === undefined || data64 == null) {
      return undefined;
    }

    return base64ToBytes(data64);
  }

  private saveBuffer(name: string, buffer: Uint8ClampedArray): void {
    let data64 = bytesToBase64(buffer);
    window.localStorage.setItem(name, data64);
  }

  private saveProps(): void {
    // this.props!.replacePatterns.sort((a: TileReplacementPattern, b: TileReplacementPattern) => a.h * a.w - b.h * b.w);
    let s = JSON.stringify(this.props);
    window.localStorage.setItem('mapProps', s);
  }

  protected evalCore(params: any): string | undefined {
    this.ensureLoaded();

    let paramsT = params as GenerateMapParams;
    if (paramsT.command === 'set') {
      this.setVar(paramsT);
    } else if (paramsT.command === 'get') {
      return this.getVar(paramsT);
    } else if (paramsT.command === 'height') {
      this.generateHeight();
    } else if (paramsT.command === 'heightDetails') {
      this.generateHeightDetails();
    } else if (paramsT.command === 'sink') {
      this.sinkLand();
    } else if (paramsT.command === 'clip') {
      this.clipHeight(parseInt(paramsT.p1), parseInt(paramsT.p2), parseInt(paramsT.p3), parseInt(paramsT.p4));
    } else if (paramsT.command === 'tiles') {
      this.generateTiles(paramsT.p1);
    } else if (paramsT.command === 'tree' ||
      paramsT.command === 'ground' ||
      paramsT.command === 'city') {
      return this.generateBiome(paramsT);
    } else if (paramsT.command === 'house') {
      return this.generateHouses(paramsT);
    } else if (paramsT.command === 'addPattern') {
      return this.addPattern(paramsT.p1, paramsT.p2);
    } else if (paramsT.command === 'clearPattern') {
      return this.clearPattern(paramsT.p1);
    } else if (paramsT.command === 'addHouse') {
      return this.addHouse();
    } else if (paramsT.command === 'print') {
      return this.print(paramsT);
    } else {
      throw 'Unknown command ' + paramsT.command;
    }
    return undefined;
  }

  private setVar(params: GenerateMapParams) {
    (this.props as any)[params.p1 as string] = parseInt(params.p2);
    this.saveProps();
    this.displayHeightMap();
  }

  private getVar(params: GenerateMapParams) {
    let res = (this.props as any)[params.p1 as string];
    return params.p1 + '=' + res;
  }

  private generateHeight() {
    this.height = perlinNoise(this.props!.mapWidth, this.props!.mapHeight, this.props!.perlinBase, this.props!.perlinBase, this.props!.seed);
    this.saveBuffer('height', this.height);
    this.displayHeightMap();
  }

  // adds noise to height map
  private generateHeightDetails() {
    if (this.height === undefined) {
      return;
    }

    let perlin = perlinNoise(this.props!.mapWidth, this.props!.mapHeight, this.props!.detailsBase, this.props!.detailsBase, this.props!.seed + 1);

    let width = this.props!.mapWidth;
    let height = this.props!.mapHeight;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        let h1 = this.height![i * width + j];
        let h2 = (perlin![i * width + j] - 128) / this.props!.detailsScale;
        h1 = Math.floor(h1 + h2);
        if (h1 > 255) h1 = 255;
        if (h1 < 0) h1 = 0;

        this.height![i * width + j] = h1;
      }
    }

    this.saveBuffer('height', this.height);
    this.displayHeightMap();
  }

  private generateBiome(params: GenerateMapParams) {
    let biomeColor: RGB;
    let defSeed = this.props!.seed;
    if (params.command === 'ground') {
      biomeColor = { r: 200, g: 200, b: 0 };
      defSeed += 1;
    } else if (params.command === 'tree') {
      biomeColor = { r: 0, g: 200, b: 0 };
      defSeed += 2;
    } else if (params.command === 'city') {
      biomeColor = { r: 250, g: 250, b: 250 };
      defSeed += 3;
    } else {
      return;
    }

    let biomeParams: BiomeProps = (this.props as any)[params.command];

    let perlinBase = (params.p1 === undefined) ? biomeParams.perlinBase : parseInt(params.p1);
    let level = (params.p2 === undefined) ? biomeParams.level : parseInt(params.p2);
    let seed = (params.p3 === undefined) ? biomeParams.seed : parseInt(params.p3);

    if (seed === undefined) {
      seed = defSeed;
    }

    biomeParams = {
      perlinBase: perlinBase,
      level: level,
      seed: seed
    };
    (this.props as any)[params.command] = biomeParams;

    (this as any)[params.command] = this.generateBiomeParams(biomeParams);

    this.saveProps();

    this.displayHeightMap();
    return `generated biome: ${params.command} base: ${perlinBase}`;
  }

  private generateBiomeParams(biomeProps: BiomeProps): Uint8ClampedArray {
    return perlinNoise(this.props!.mapWidth, this.props!.mapHeight,
      biomeProps.perlinBase, biomeProps.perlinBase, biomeProps.seed);
  }

  private generateHouses(params: GenerateMapParams) {
    if (this.props === undefined || this.mapEditorState.region === undefined) {
      return;
    }

    // @ts-ignore
    let houseWriter = new HouseWriter(new PRNG(),
      this.props?.houseDefs,
      this.groundDef!,
      this.props?.mapWidth, this.props?.mapHeight);

    houseWriter.generate(topLeftPos(this.mapEditorState.region), 4)
    this.saveProps();

    this.displayHeightMap();
    return `generated houses: ${params.command}` // base: ${perlinBase}`;
  }

  private getColorByHeight(h: number): { color: RGB, kind: GroundKind } {
    let color: RGB;
    if (h < this.props!.waterLevel) {
      return { color: { r: 0, g: 0, b: 200 }, kind: GroundKind.water };
    } else if (h < this.props!.sandLevel) {
      return { color: { r: 200, g: 200, b: 0 }, kind: GroundKind.sand };
    } else if (h < this.props!.grassLevel) {
      return { color: { r: 0, g: 100, b: 0 }, kind: GroundKind.grass };
    } else {
      return { color: { r: 200, g: 200, b: 200 }, kind: GroundKind.mountain };
    }
  }

  private generateTiles(options: string | undefined) {
    // update just in case
    this.displayHeightMap();

    let layer = this.mapEditorState.currentTileLayer;
    if (layer === undefined) {
      return;
    }

    let writer = new TileLayerWriter(this.props!.houseDefs);
    let usePatterns = true;
    if (options === 'nopattern') {
      usePatterns = false;
    }
    writer.generateTiles(this.props!, layer, this.groundDef!, usePatterns);
    this.mapEditorState.update({});
  }

  private addPattern(category: string | undefined, patternStr: string | undefined): string | undefined {
    if (patternStr === undefined) {
      patternStr = this.repl.getVar('$');
      if (patternStr === undefined) {
        return 'Pattern not defined';
      }
    }

    if (category === undefined) {
      return 'Category not defined';
    }

    let pattern: TileReplacementPattern = JSON.parse(patternStr);
    pattern.category = category;
    this.props!.replacePatterns.push(pattern);

    this.saveProps();

    return patternStr;
  }

  private addHouse(): string | undefined {
    let region = this.mapEditorState.region;
    if (region === undefined) {
      return 'Region not defined';
    }

    let layer = this.mapEditorState.currentTileLayer;
    if (layer === undefined) {
      return 'Layer not seleted';
    }

    let tileBuffer = layer.getRegion(region);

    let id: number = 1;
    if (this.props!.houseDefs.length > 0) {
      id = this.props!.houseDefs[this.props!.houseDefs.length - 1].id;
    }

    this.props!.houseDefs.push({
      id: id + 1,
      w: region.w,
      h: region.h,
      tiles: tileBuffer.tiles
    });

    this.saveProps();

    return undefined;
  }

  private clearPattern(category: string | undefined): string | undefined {
    if (category === undefined) {
      return 'Category is not defined';
    }
    else {
      let patterns = this.props?.replacePatterns.filter(x => category !== x.category);
      this.props!.replacePatterns = (patterns !== undefined) ? patterns : [];
    }

    this.saveProps();
    return undefined;
  }

  private displayHeightMap() {
    if (this.height === undefined) {
      return;
    }

    let width = this.props!.mapWidth;
    let height = this.props!.mapHeight;
    let mapBitmap = createMapBitmap(width, height);

    this.groundDef = new Uint8Array(width * height);

    let data = mapBitmap.data;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        let h = this.height![i * width + j];

        let t = this.getColorByHeight(h);
        let color = t.color;
        let kind = t.kind;

        if (h > this.props!.waterLevel) {
          if (this.ground !== undefined) {
            let g = this.ground![i * width + j];
            if (g > this.props!.ground.level) {
              color = { r: 165, g: 42, b: 42 };
              kind = GroundKind.ground;
            }
          }
          if (this.tree !== undefined) {
            let t = this.tree![i * width + j];
            if (t > this.props!.tree.level) {
              color = { r: 0, g: 50, b: 0 };
              kind = GroundKind.tree;
            }
          }
          if (this.city !== undefined) {
            let t = this.city![i * width + j];
            if (t > this.props!.city.level) {
              color = { r: 250, g: 250, b: 250 };
              kind = GroundKind.city;
            }
          }
        }

        let pos = (i * mapBitmap.w + j) * 4;
        data[pos + 0] = color.r;
        data[pos + 1] = color.g;
        data[pos + 2] = color.b;
        data[pos + 3] = 255;

        this.groundDef[i * mapBitmap.w + j] = kind;
      }
    }

    this.mapEditorState.update({ mapBitmap: mapBitmap });
  }

  private clipHeight(x1: number, y1: number, x2: number, y2: number) {
    let width = this.props!.mapWidth;
    let height = this.props!.mapHeight;

    let perlin = new Uint8ClampedArray(width * height);
    let clipW = x2 - x1;
    let clipH = y2 - y1;
    let scale = (clipW > clipH) ? clipW / width : clipH / height;
    let deltaX = Math.floor((width - clipW / scale) / 2);
    let deltaY = Math.floor((height - clipH / scale) / 2);

    for (let i = deltaY; i < height - deltaY; i++) {
      let py = Math.floor((i - deltaY) * scale + y1);

      for (let j = deltaX; j < width - deltaX; j++) {
        let px = Math.floor((j - deltaX) * scale + x1);

        let h = this.height![py * width + px];
        perlin[i * width + j] = h;
      }
    }

    this.props!.clip = { x: x1, y: y1, w: clipW, h: clipH };
    this.saveProps();

    this.height = perlin;
    this.saveBuffer('height', this.height);
    this.displayHeightMap();
  }

  private sinkLand() {
    let x = this.mapEditorState.region!.x;
    let y = this.mapEditorState.region!.y;
    let width = this.props!.mapWidth;
    let height = this.props!.mapHeight;

    for (let i = y; i >= 0; i--) {
      let h = this.height![i * width + x];
      if (h < this.props!.waterLevel) {
        break;
      }

      this.sinkLine(x, i, width);
    }

    for (let i = y + 1; i < height; i++) {
      let h = this.height![i * width + x];
      if (h < this.props!.waterLevel) {
        break;
      }

      this.sinkLine(x, i, width);
    }

    this.saveBuffer('height', this.height!);
    this.displayHeightMap();
  }

  private sinkLine(x: number, y: number, width: number) {
    for (let j = x; j >= 0; j--) {
      let h = this.height![y * width + j];
      if (h < this.props!.waterLevel) {
        break;
      }

      this.height![y * width + j] = 0;
    }

    for (let j = x + 1; j < width; j++) {
      let h = this.height![y * width + j];
      if (h < this.props!.waterLevel) {
        break;
      }

      this.height![y * width + j] = 0;
    }
  }


  private print(params: GenerateMapParams) {
    let nohouses: boolean = false;
    let nopattern: boolean = false;
    let p: string[] = [params.p1, params.p2];

    for (let i = 0; i < p.length; i++) {
      if (p[i] === 'nohouses') {
        nohouses = true;
      } else if (p[i] === 'nopatterns') {
        nopattern = true;
      }
    }

    let props: any = {};
    Object.assign(props, this.props);

    if (nohouses) {
      props.houses = [];
    }
    if (nopattern) {
      props.replacePatterns = [];
    }
    return JSON.stringify(props);
  }

  /*
  layer.startEdit();
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let h = data[i * width + j];
      // water
      if (h < 40) {
        layer.setTile(j, i, 599);
        // sand
      } else if (h < 80) {
        layer.setTile(j, i, 50)
        // ground
      } else if (h < 120) {
        layer.setTile(j, i, 87);
        // forest
      } else if (h < 200) {
        layer.setTile(j, i, 23)
        // mountins
      } else {
        layer.setTile(j, i, 90);
      }
    }
  layer.endEdit();
    */

}
/*
  public booo() {
  let w = this.canvas.width;
  let h = this.canvas.height;
  let imagedata = ctx.createImageData(w, h);
  let data = imagedata.data;

  let pos, cr, cg, cb, gray;
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      pos = (x + y * w) * 4;

      let tileDef = layer.getTile(x, y);
      if (tileDef !== undefined) {
        let color = tileToColor(tileDef?.props.id);

        data[pos + 0] = color.r;
        data[pos + 1] = color.g;
        data[pos + 2] = color.b;
        data[pos + 3] = 255;
      }
    }
  }

}
}

}

*/

export function tileToColor(tileId: number): RGB {
  switch (tileId) {
    case 599: return { r: 0, g: 0, b: 200 };
    case 90: return { r: 200, g: 200, b: 200 };
    // sand
    case 50: return { r: 200, g: 200, b: 0 };
    case 23: return { r: 0, g: 100, b: 0 };
    // ground
    case 87: return { r: 165, g: 42, b: 42 };
    default: return { r: 0, g: 0, b: 0 };
  }
}
