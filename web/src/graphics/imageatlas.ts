
export type SpriteSheetProps =
  {
    id: string;
    url: string;
    gridWidth: number;
    gridHeight: number;
    cellWidth: number;
    cellHeight: number;
    // initial atlas tiles allocated from fixed id
    // later we might create combined tiles from random IDs
    startTileId: number;
  };

// atlas is a set of images combined into a single resource
// provides a way to create individual sprite images
/*
export class ImageAtlas {
  public readonly props: ImageAtlasProps;
  public readonly image: any;

  public get id() { return this.props.id; }

  public constructor(props: ImageAtlasProps) {
    this.props = props;
    this.image = new Image();
    this.image.addEventListener('load', () => console.log('image loaded'));
    this.image.addEventListener('error', () => console.log('cannot load image'));
    this.image.src = props.url;
  }

  public get pxWidth() { return this.props.gridWidth * this.props.cellWidth; }
  public get pxHeight() { return this.props.gridHeight * this.props.cellHeight; }

}
*/