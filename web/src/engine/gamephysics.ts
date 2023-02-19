import { animator, IAnimatable } from "./animator";
import { GridPos } from "../posh/pos";
import { IAvatar } from "../world/iavatar";
import { IGameCollisionHandler, IGamePhysics, MoveAvatarParams } from "./igamephysics";
import { SpriteMoveAnimationProps } from "./spritemoveanimation";
import { IGameMap } from "../voxel/igamemap";

export type MoveAnimationToken = {
  animation: IAnimatable;
  nextMove: MoveAvatarParams | undefined;
}

// manages movement and collisions between world objects
export class GamePhysics implements IGamePhysics {
  private map: IGameMap;
  private collisionHandler?: IGameCollisionHandler;
  private moveAnimations: WeakMap<IAvatar, MoveAnimationToken> = new WeakMap<IAvatar, MoveAnimationToken>();

  public constructor(map: IGameMap) {
    this.map = map;
  }

  public attachCollisionHandler(handler?: IGameCollisionHandler) {
    this.collisionHandler = handler;
  }

  public moveAvatarInteractive(params: MoveAvatarParams, canCancel: boolean = false) {

    // if we running animation, continue after
    let oldAnimToken = this.moveAnimations.get(params.avatar);
    if (oldAnimToken !== undefined) {
      if (canCancel) {
        animator.cancel(oldAnimToken.animation);
      } else {
        // cannot cancel animation; save move and wait for completion
        if (oldAnimToken.nextMove === undefined) {
          oldAnimToken.nextMove = params;
        }
        return;
      }
    }

    this.moveAvatarWorker(params);
  }

  public moveAvatar(params: MoveAvatarParams): boolean {

    // if we running animation, retry after animation is done
    let oldAnimToken = this.moveAnimations.get(params.avatar);
    if (oldAnimToken !== undefined) {
      return false;
    }

    return this.moveAvatarWorker(params);
  }

  private moveAvatarWorker(params: MoveAvatarParams): boolean {
    return false;
    /*
        let skin = params.avatar.skin;
        if (skin === undefined) {
          return false;
        }
    
        // actually make the move
        let delta = deltaByAbsDirection(params.dir);
        let nextPos = {
          x: params.avatar.currentPos!.x + delta.x,
          y: params.avatar.currentPos!.y + delta.y,
        }
    
        if (nextPos.x >= this.map.props.gridWidth) { nextPos.x = this.map.props.gridWidth - 1; }
        else if (nextPos.x < 0) { nextPos.x = 0; }
    
        if (nextPos.y > this.map.props.gridHeight) { nextPos.y = this.map.props.gridHeight; }
        else if (nextPos.y < 0) { nextPos.y = 0; }
    
        // first check if block is opened
        if (!this.canMoveToMapPos(params.avatar, nextPos)) {
          return false;
        }
    
        // we detect collision before move happens and block the move
        // the other object might move out ... not sure what to do about it
        if (!this.handleAvatarCollision(params.avatar, nextPos)) {
          return false;
        }
    
        if (params.avatar.layer !== undefined) {
          let locs = params.avatar.layer?.getLocationsByRect(nextPos);
          if (locs !== undefined) {
            for (let loc of locs) {
              if (!this.collisionHandler?.onLocation(params.avatar, loc)) {
                return false;
              }
            }
          }
        }
    
        params.avatar.nextPos = nextPos;
        params.avatar.dir = params.dir;
    
        // for now check bounds
        // this is not 100% correct but will work
        let x = nextPos.x * this.map.props.cellWidth;
        let y = nextPos.y * this.map.props.cellHeight;
    
        let dx = x - skin.pos.x;
        let dy = y - skin.pos.y;
        let posVersion = params.avatar.currentPosVersion;
    
        let anim = params.animator({
          sprite: skin,
          dx: dx, dy: dy, duration: params.avatar.stepDuration,
          onComplete: (anim: IAnimatable) => {
            this.onCompleteMove(params.avatar, posVersion);
          }
        });
        animator.animate(anim);
        this.moveAnimations.set(params.avatar, { animation: anim, nextMove: undefined });
        return true;
        */
  }

  public moveAvatarRemote(avatar: IAvatar, pos: GridPos, func: (props: SpriteMoveAnimationProps) => IAnimatable): boolean {

    /*
    if (avatar.skin === undefined) {
      return false;
    }

    let oldAnimToken = this.moveAnimations.get(avatar);
    if (oldAnimToken !== undefined) {
      if (oldAnimToken.nextMove === undefined) {
        oldAnimToken.nextMove = undefined;
      }
    }

    // for now check bounds
    // this is not 100% correct but will work
    let x = pos.x * this.map.props.cellWidth;
    let y = pos.y * this.map.props.cellHeight;

    let dx = x - avatar.skin.pos.x;
    let dy = y - avatar.skin.pos.y;
    let posVersion = avatar.currentPosVersion;

    let anim = func({
      sprite: avatar.skin,
      dx: dx, dy: dy, duration: avatar.stepDuration,
      onComplete: (anim: IAnimatable) => {
        //this.onCompleteMove(avatar, posVersion);
      }
    });
    animator.animate(anim);
    this.moveAnimations.set(avatar, { animation: anim, nextMove: undefined });
    */
    return true;
  }

  /*
  private handleAvatarCollision(avatar: IAvatar, nextPos: GridPos): boolean {
    if (avatar.layer === undefined || nextPos === undefined) {
      return true;
    }

    let nextAvatar = avatar.tileLayer.getAvatarByPos(nextPos.x, nextPos.y);
    if (nextAvatar === undefined) {
      return true;
    }

    this.collisionHandler?.onCollision(avatar, nextAvatar);

    return true;
  }

  private canMoveToMapPos(avatar: IAvatar, pos: GridPos): boolean {
    if (avatar.layer === undefined) {
      return false;
    }

    let tile = avatar.tileLayer.getTile(pos.x, pos.y);
    if (tile === undefined) {
      return false;
    }

    if (tile.props.categories === undefined) {
      return true;
    }

    // @ts-ignore
    if (tile.props.categories[TileCategory.barrier] === true) {
      return false;
    }

    // @ts-ignore
    if (tile.props.categories[TileCategory.water] === true) {
      return false;
    }

    return true;
  }

  private onCompleteMove(avatar: IAvatar, originalPosVersion: number) {
    if (originalPosVersion !== avatar.currentPosVersion) {
      return;
    }

    // this will trigger actual notification of avatar change
    avatar.currentPos = avatar.nextPos;

    let oldAnimToken = this.moveAnimations.get(avatar);
    this.moveAnimations.delete(avatar);
    if (oldAnimToken === undefined || oldAnimToken.nextMove === undefined) {
      return;
    }

    // schedule next move
    this.moveAvatarInteractive(oldAnimToken!.nextMove);
  }
  */
}

