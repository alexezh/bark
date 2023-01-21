import { GroundKind, HouseDef } from "./generatemapcommands";
import { GridPos } from "../posh/pos";

export class HouseWriter {
  rnd: any;
  houses: HouseDef[];
  ground: Uint8Array;
  width: number;
  height: number;

  public constructor(
    rnd: any,
    buildings: HouseDef[],
    groundDef: Uint8Array,
    width: number,
    height: number) {
    this.rnd = rnd;
    this.houses = buildings;
    this.height = height;
    this.width = width;
    this.ground = groundDef;
  }

  public generate(
    pos: GridPos,
    houseCount: number) {

    // for now generate street with two houses on either sides
    let topRow: GridPos = pos;
    let bottomRow: GridPos = { x: pos.x - 3, y: pos.y + 4 };

    for (let i = 0; i < houseCount; i++) {
      topRow = this.buildHouse(topRow);
      bottomRow = this.buildHouse(bottomRow);
      //let house = this.
    }

  }

  private buildHouse(pos: GridPos): GridPos {
    let houseIdx = this.rnd.nextRange(0, this.houses.length);
    let houseDef = this.houses[houseIdx];
    let y = pos.y - houseDef.h;

    let kind = GroundKind.houseStart + houseIdx;

    for (let i = 0; i < houseDef.h; i++) {
      for (let j = 0; j < houseDef.w; j++) {
        let idx = (pos.y + i) * this.width + j;
        if (i == 0 && j == 0) {
          this.ground[idx] = kind;
        } else {
          this.ground[idx] = GroundKind.houseContinue;
        }
      }
    }

    return { x: pos.x + houseDef.w, y: pos.y };
  }
}
