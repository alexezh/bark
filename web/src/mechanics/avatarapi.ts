import { GridPos } from "../posh/pos";
import { IAvatar } from "../world/iavatar";
import { MoveDirection, CodeAction, CodeActionKind, IAvatarAPI, maxLookDistance, RelMoveDirection, WObject, MoveAction, dirByRelDirection, SayAction } from "./iavatarapi";
import { IGameMap } from "../world/igamemap";
import { AvatarCollection } from "../world/avatarcollection";

export class AvatarAPI implements IAvatarAPI {
  public self?: IAvatar;
  private map: IGameMap;
  private avatarCollection: AvatarCollection;

  public constructor(avatarCollection: AvatarCollection, map: IGameMap) {
    this.map = map;
    this.avatarCollection = avatarCollection;
  }

  look(func: (x: WObject) => boolean): boolean {
    if (this.self?.layer === undefined) {
      return false;
    }

    // in the future, we can select based on "important" metrics
    // for now we go with closest first

    return true;
  }

  canMove(dir: MoveDirection): boolean {
    return true;
  }

  lookFor(id: string): GridPos | null {
    let avatar = this.avatarCollection.getAvatar(id);
    if (avatar === undefined) {
      return null;
    }

    // cannot see if on different layers
    if (avatar.layer?.id !== this.self?.layer?.id) {
      return null;
    }

    if (avatar.currentPos === undefined || this.self?.currentPos === undefined) {
      return null;
    }

    let dx = avatar.currentPos.x - this.self.currentPos.x;
    let dy = avatar.currentPos.y - this.self.currentPos.y;
    if (Math.abs(dx) + Math.abs(dy) > maxLookDistance) {
      return null;
    }

    return { x: dx, y: dy };
  }

  makeMove(dir: MoveDirection): MoveAction {
    return {
      kind: CodeActionKind.move,
      dir: dir
    };
  }
  makeRelMove(dir: RelMoveDirection): MoveAction {
    return {
      kind: CodeActionKind.move,
      dir: dirByRelDirection(this.self!.dir, dir)
    };
  }
  makeIdle(): CodeAction {
    return {
      kind: CodeActionKind.idle
    }
  }
  say(s: string): SayAction {
    return {
      kind: CodeActionKind.say,
      text: s
    }
  }
}

