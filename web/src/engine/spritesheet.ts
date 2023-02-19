import { GridRect, PxPos } from '../posh/pos';
import { SpriteSheetProps } from './imageatlas';

// block of tiles of size x * y used for clipboard and such
export type TileBuffer = {
  w: number;
  h: number;
  tiles: number[];
}

export class SpriteSheet {
  public readonly props: SpriteSheetProps;
  //private texture?: PixiTexture;
  //private spriteSheet?: PixiSpritesheet;
  // frames are numbered from startFrameId left to right
  private startFrameId: number = 0;
  private static nextId: number = 1;

  public get id() { return this.props.id; }

  private constructor(props: SpriteSheetProps) {
    this.props = props;
  }

  public static async load(props: SpriteSheetProps): Promise<SpriteSheet> {
    let sheet = new SpriteSheet(props);

    await sheet.load();

    return sheet;
  }

  private async load() {
    /*
    this.texture = await PixiAssets.load(this.props.url) as PixiTexture;

    let sheetData: ISpritesheetData = {
      frames: {},
      meta: {
        scale: "1",
      }
    }

    this.startFrameId = SpriteSheet.nextId;

    for (let i = 0; i < this.props.gridHeight; i++) {
      for (let j = 0; j < this.props.gridWidth; j++) {
        sheetData.frames[SpriteSheet.nextId] = {
          frame: {
            x: j * this.props.cellWidth,
            y: i * this.props.cellHeight,
            w: this.props.cellWidth,
            h: this.props.cellHeight,
          },
          spriteSourceSize: {
            // @ts-ignore
            x: 0, y: 0, w: this.props.cellWidth, h: this.props.cellHeight
          },
          sourceSize: {
            w: this.props.cellWidth, h: this.props.cellHeight
          },
        }

        SpriteSheet.nextId++;
      }
    }

    this.spriteSheet = new PixiSpritesheet(this.texture, sheetData);
    await this.spriteSheet.parse();
    */
  }

  public createSprite(idx: number, pos: PxPos): any {
    /*
    let texture = this.spriteSheet!.textures[this.startFrameId + idx];
    if (texture === undefined) {
      texture = this.spriteSheet!.textures[1];
    }

    let sprite = new PixiSprite(texture);
    sprite.position = pos;
    return sprite;
    */
    return undefined;
  }

  public getTexture(idx: number): any {
    // return this.spriteSheet!.textures[this.startFrameId + idx];
    return undefined;
  }

  public getRegion(rect: GridRect): TileBuffer {
    let buffer: TileBuffer = {
      w: rect.w,
      h: rect.h,
      tiles: []
    }

    for (let i = 0; i < rect.h; i++) {
      for (let j = 0; j < rect.w; j++) {
        buffer.tiles.push(this.props.startTileId + (rect.y + i) * this.props.gridWidth + rect.x + j);
      }
    }

    return buffer;
  }
}