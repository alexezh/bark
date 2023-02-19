import { animator } from './animator';
import { PxPos, PxSize } from '../posh/pos';
import { SpriteSheet } from './spritesheet';

export type SpriteProps = {
  pos: PxPos;
  // offset between px position of grid top/left and sprite 0.0
  gridOffset: PxPos;
  flipH: boolean;
  costumeIndex: number;
};

export type SprivePosChanged = (sprite: Sprite) => void;

export class Sprite {
  public readonly id: number;
  private readonly props: SpriteProps;
  private readonly spriteSheet: SpriteSheet;
  private posChanged: SprivePosChanged | undefined;

  public get pos(): PxPos { return this.props.pos; }
  public set pos(newValue) {
    this.props.pos = newValue;
    if (this.posChanged !== undefined) {
      this.posChanged(this);
    }
  }

  // create sprite object
  // x - x coordinate of sprite
  // y - y coordinate of sprite
  // w - sprite width
  // h - sprite height
  // skins - array of either string resource names or SpriteImage type objects
  // animations - array of functions which initialize animations for this sprite
  //              functions should take sprite as parameter
  public constructor(props: SpriteProps, sheet: SpriteSheet) {
    this.id = animator.nextId();
    this.props = props;
    this.spriteSheet = sheet;
  }

  public setCostume(idx: number) {
    this.props.costumeIndex = idx;
  }

  public attachCamera(handler: SprivePosChanged | undefined) {
    this.posChanged = handler;
  }
}

