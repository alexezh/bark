import { IAnimatable } from "../graphics/animator";
import { KeyBinder } from "../ui/keybinder";
import { Avatar, IGameKeyboardHandler } from "./avatar";
import { IAvatar } from "./iavatar";
import { InteractivePlayerAnimation, SpriteMoveAnimationProps } from "./spritemoveanimation";
import { IGamePhysics } from "../graphics/igamephysics";
import { MoveDirection } from "../mechanics/iavatarapi";

export class HumanKeyboardHandler implements IGameKeyboardHandler {
  public readonly cellWidth: number;
  public readonly cellHeight: number;
  private readonly stepDuration: number;
  private readonly physics: IGamePhysics;
  private readonly avatar: IAvatar;

  public constructor(avatar: IAvatar, physics: IGamePhysics, cellW: number, cellH: number, stepDuration: number) {
    this.physics = physics;
    this.avatar = avatar;
    this.cellWidth = cellW;
    this.cellHeight = cellH;
    this.stepDuration = stepDuration;
  }

  public handleKeyboard(input: KeyBinder) {
    let dx = 0;
    let dy = 0;

    let dir: MoveDirection = MoveDirection.none;
    if (input.pressedKeys.ArrowLeft) {
      dir = MoveDirection.left;
      input.pressedKeys.ArrowLeft = false;
    }

    if (input.pressedKeys.ArrowRight) {
      dir = MoveDirection.right;
      input.pressedKeys.ArrowRight = false;
    }

    if (input.pressedKeys.ArrowUp) {
      dir = MoveDirection.up;
      input.pressedKeys.ArrowUp = false;
    }

    if (input.pressedKeys.ArrowDown) {
      dir = MoveDirection.down;
      input.pressedKeys.ArrowDown = false;
    }

    if (dir !== MoveDirection.none) {
      this.physics.moveAvatarInteractive({
        avatar: this.avatar,
        dir: dir,
        animator: InteractivePlayerAnimation.create
      }, false);
    }
  }
}