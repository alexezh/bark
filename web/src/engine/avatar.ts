import { Sprite } from "./Sprite";
import { KeyBinder } from "../ui/keybinder";
//import { TileLayer } from "./tilelayer";
import { GridPos, gridPosToPxPos } from "../posh/pos";
//import { IGameLayer } from "./gamelayer";
import { storeFile, storeFileBackground, updateAvatarRuntimeProps } from "../fetchadapter";
import { AvatarGameState, AvatarProps, IAvatar } from "./iavatar";
import { MoveDirection } from "../mechanics/iavatarapi";
import { codeLoader } from "../mechanics/codeloader";


// invoked by animator to handle keyboard for active player
// need better name
// and should pass to animator so we have things in one place
export interface IGameKeyboardHandler {
  handleKeyboard(input: KeyBinder): void;
}

export type AvatarPosChanged = (avatar: IAvatar, oldPos: GridPos | undefined, newPos: GridPos | undefined) => void;

export class Avatar implements IAvatar {
  public readonly props: AvatarProps;
  get rt(): any { return undefined }
  set rt(val: any) { }

  public skin?: Sprite;
  public nextPos?: GridPos;
  public dir: MoveDirection = MoveDirection.right;
  private _currentPosVersion: number = 1;
  public get gameState(): AvatarGameState { return this.rt.gameState; }
  public set gameState(mode: AvatarGameState) { this.rt.gameState = mode; }

  private readonly posChanged: AvatarPosChanged;
  private cameraUpdate: AvatarPosChanged | undefined = undefined;

  public get id() { return this.props.id; }
  public get stepDuration() { return 300; }

  public get currentPos(): GridPos | undefined { return this.props.pos; }
  public set currentPos(pos: GridPos | undefined) {
    let oldPos = this.props.pos;
    this.props.pos = pos;
    this._currentPosVersion++;
    if (this.skin !== undefined) {
      this.skin.pos = gridPosToPxPos(pos!);
    }
    this.posChanged(this, oldPos, pos);
    if (this.cameraUpdate !== undefined) {
      this.cameraUpdate(this, oldPos, pos);
    }
    if (this.layer !== undefined) {
      this.layer.onAvatarPosChanged(this, oldPos, pos);
    }
  }
  public get currentPosVersion(): number { return this._currentPosVersion; }

  // game layer this avatar is attached to
  // avatar can move from layer to layer during the game
  public layer?: any;
  public get tileLayer() { return this.layer as any; }

  public constructor(props: AvatarProps, posChanged: AvatarPosChanged) {
    this.props = props;
    this.posChanged = posChanged;
  }

  // same as changing currentPos but without calling
  // this.posChanged
  public onRemoteUpdateCurrentPos(pos: GridPos | undefined): void {
    let oldPos = this.props.pos;
    this.props.pos = pos;
    this._currentPosVersion++;
    if (this.skin !== undefined) {
      this.skin.pos = gridPosToPxPos(pos!);
    }
    if (this.cameraUpdate !== undefined) {
      this.cameraUpdate(this, oldPos, pos);
    }
    if (this.layer !== undefined) {
      this.layer.onAvatarPosChanged(this, oldPos, pos);
    }
  }


  public updateRuntimeProps(props: any) {
    this.rt = props;
    updateAvatarRuntimeProps(this.id, this.rt);
  }

  public getCode(): string {
    let file = codeLoader.getCodeModule(this.rt.code);
    return (file !== undefined) ? file.code : '';
  }

  public updateCode(code: string): void {
    if (this.rt.code !== this.getAvatarCodeFile()) {
      this.rt.code = this.getAvatarCodeFile();
      storeFileBackground(this.rt.code, code);
      updateAvatarRuntimeProps(this.id, this.rt);
    } else {
      storeFileBackground(this.rt.code, code);
    }

    codeLoader.updateCode(this.rt.code, code);
  }

  public attachCamera(func: AvatarPosChanged | undefined): void {
    this.cameraUpdate = func;
  }

  protected getAvatarCodeFile(): string {
    return 'avatar/' + this.props.id;
  }

  public clearLayer() {
    if (this.layer !== undefined) {
      this.layer.removeAvatar(this);
      this.layer = undefined;
      this.props.layerId = undefined;
    }
  }
}
