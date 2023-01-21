import { resourceLib } from "../graphics/resourceLib";
import { TileLayer } from "../world/tilelayer";
import { TileCategory, TileDef } from "../world/tiledef";
import { GenerateMapProps, GroundKind, HouseDef, TileReplacementPattern } from "./generatemapcommands";
import { createMapBitmap } from "../posh/mapeditorstate";

export class TileLayerWriter {
  ground: TileDef;
  grass: TileDef;
  tree: TileDef;
  mountain: TileDef;
  water: TileDef;
  sand: TileDef;
  grassVar: TileDef[];
  buildings: HouseDef[];


  public constructor(buildings: HouseDef[]) {
    this.buildings = buildings;

    this.ground = resourceLib.findTile((tile: TileDef) => tile.props.categories !== undefined && tile.props.categories[TileCategory.ground] && tile.props.categories[TileCategory.gen0])!;

    this.grass = resourceLib.findTile((tile: TileDef) => tile.props.categories !== undefined && tile.props.categories[TileCategory.grass] && tile.props.categories[TileCategory.gen0])!;
    this.grassVar = Array.from(resourceLib.findTiles((tile: TileDef) => tile.props.categories !== undefined && tile.props.categories[TileCategory.grass]));

    this.tree = resourceLib.findTile((tile: TileDef) => tile.props.categories !== undefined && tile.props.categories[TileCategory.tree] && tile.props.categories[TileCategory.gen0])!;
    this.mountain = resourceLib.findTile((tile: TileDef) => tile.props.categories !== undefined && tile.props.categories[TileCategory.mountain] && tile.props.categories[TileCategory.gen0])!;
    this.water = resourceLib.findTile((tile: TileDef) => tile.props.categories !== undefined && tile.props.categories[TileCategory.water] && tile.props.categories[TileCategory.gen0])!;
    this.sand = resourceLib.findTile((tile: TileDef) => tile.props.categories !== undefined && tile.props.categories[TileCategory.sand] && tile.props.categories[TileCategory.gen0])!;
  }

  public generateTiles(props: GenerateMapProps, layer: TileLayer, groundDef: Uint8Array, usePatterns: boolean) {
    // update just in case


    let width = props.mapWidth;
    let height = props.mapHeight;
    let tiles = new Uint16Array(groundDef.length);

    this.fillGroundTiles(width, height, groundDef, tiles);
    if (usePatterns) {
      tiles = this.replacePatterns(width, height, props.replacePatterns, tiles);
    }

    // tiles = this.buildCity(621, 544);

    // finally, generate tiles
    layer.startEdit();
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        let t = tiles![i * width + j];
        layer.setTile(j, i, t);
      }
    }
    layer.endEdit();
  }

  // take ground definition and applies tiles
  // we later replace tiles with patterns
  private fillGroundTiles(width: number, height: number, groundDef: Uint8Array, tiles: Uint16Array) {

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        let pos = i * width + j;
        let g = groundDef![pos];
        let t: number;
        switch (g) {
          case GroundKind.ground: g = this.ground?.props.id; break;
          case GroundKind.mountain: g = this.mountain?.props.id; break;
          case GroundKind.water: g = this.water?.props.id; break;
          case GroundKind.tree: g = this.tree?.props.id; break;
          case GroundKind.sand: g = this.sand?.props.id; break;
          case GroundKind.grass: g = this.grass?.props.id; break;
          case GroundKind.houseContinue: g = -1; break;
          default:
            if (g > GroundKind.houseStart) {
              this.fillHouseTiles(width, tiles, j, i, g - GroundKind.houseStart);
            } else {
              g = 0;
            }
            break;
        }

        if (g !== -1) {
          tiles[pos] = g;
        }
      }
    }
  }

  private fillHouseTiles(width: number, tiles: Uint16Array, x: number, y: number, houseIdx: number) {
    let houseDef = this.buildings[houseIdx];
    for(let i = 0; i < houseDef.h; i++) {
      for(let j = 0; j < houseDef.w; j++) {
        let tileId = houseDef.tiles[i * houseDef.w + j];
        let idx = (i + y) * width + (j + x);
        tiles[idx] = tileId;
      }
    }
  }

  private replacePatterns(width: number, height: number, patterns: TileReplacementPattern[], tiles: Uint16Array): Uint16Array {
    let updated = new Uint16Array(tiles);

    // 2*2 pattern can replace other positions than 0,0 which causes
    // issues with next patterns. apply 2*1 first

    /*
    let patterns2 = patterns.filter(x => x.h * x.w == 2 && x.category != 'tree');
    this.replacePatternsWorker(width, height, patterns2, tiles, updated);

    let patterns4 = patterns.filter(x => x.h * x.w == 4 && x.category != 'tree');
    this.replacePatternsWorker(width, height, patterns4, tiles, updated);

*/
    let patternsTree = patterns.filter(x => x.category == 'tree' && x.h * x.w == 2);
    this.replacePatternsWorker(width, height, patternsTree, tiles, updated);

    return updated;
  }

  private replacePatternsWorker(width: number, height: number, patterns: TileReplacementPattern[], src: Uint16Array, dest: Uint16Array) {
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        let pos = i * width + j;
        let t = src[pos];

        // yer, it is N^3
        for (let h = 0; h < patterns.length; h++) {
          let p = patterns[h];
          if (t !== p.current[0]) {
            continue;
          }

          // optimized matching
          // do not replace things which are the same in original as they might be already changed
          if (p.h === 2 && p.w === 1) {
            if (i === height - 1) {
              continue;
            }
            if (dest[pos] == p.replace[1]) {
              continue;
            }

            let t2 = src[pos + width];
            if (t2 === p.current[1]) {
              if (t !== p.replace[0])
                dest[pos] = p.replace[0];
              if (t2 !== p.replace[1])
                dest[pos + width] = p.replace[1];
            }
          } else if (p.h === 1 && p.w === 2) {
            if (j === width - 1) {
              continue;
            }
            let t2 = src[pos + 1];
            if (t2 === p.current[1]) {
              if (t !== p.replace[0])
                dest[pos] = p.replace[0];
              if (t2 !== p.replace[1])
                dest[pos + 1] = p.replace[1];
            }
          } else if (p.h === 2 && p.w === 2) {
            if (i === height - 1 || j === width - 1) {
              continue;
            }
            let t2 = src[pos + 1];
            let t3 = src[pos + width];
            let t4 = src[pos + width + 1];

            if (t2 === p.current[1] && t3 === p.current[2] && t4 === p.current[3]) {
              if (t !== p.replace[0])
                dest[pos] = p.replace[0];
              if (t2 !== p.replace[1])
                dest[pos + 1] = p.replace[1];
              if (t3 !== p.replace[2])
                dest[pos + width] = p.replace[2];
              if (t4 !== p.replace[3])
                dest[pos + width + 1] = p.replace[3];
            }
          } else {
            throw 'not supported';
          }
        }
      }
    }
  }

  private generateTrees(width: number, height: number, patterns: TileReplacementPattern[], src: Uint16Array, dest: Uint16Array) {
  }
}
