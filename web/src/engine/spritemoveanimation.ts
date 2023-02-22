import { Vector3 } from "three";
import { Animatable, IAnimatable } from "./animator";
import { Sprite3 } from "./sprite3";

export type SpriteMoveAnimationProps = {
  sprite: Sprite3;
  delta: Vector3;
  duration: number;
  onComplete: ((anim: IAnimatable) => void) | undefined;
}

// animates changing sprite position while playing move animation
export class SpriteMoveAnimation extends Animatable {
  private props: SpriteMoveAnimationProps;
  private x: number;
  private y: number;
  private sprite: Sprite3;

  public static create(props: SpriteMoveAnimationProps): SpriteMoveAnimation {
    return new SpriteMoveAnimation(props);
  }

  private constructor(props: SpriteMoveAnimationProps) {
    super();
    this.sprite = props.sprite;
    this.x = this.sprite.pos.x;
    this.y = this.sprite.pos.y;
    this.props = props;
  }

  public onComplete(): void {
    if (this.props.onComplete !== undefined) {
      this.props.onComplete(this);
    }
  }

  public animate(elapsed: number): boolean {
    if (elapsed >= this.props.duration) {
      this.sprite.position.set(this.x + this.props.delta.x, this.y + this.props.delta.y, this.props.delta.z);
      return false;
    }

    let r = elapsed / this.props.duration;
    this.sprite.pos = { x: this.x + this.props.dx * r, y: this.y + this.props.dy * r };

    return true;
  }
}

// instead of sprite, animates scroll position of world
/*
export class InteractivePlayerAnimation extends Animatable {
  private x: number;
  private y: number;
  private props: SpriteMoveAnimationProps;
  private firstCostume: number;

  public static create(props: SpriteMoveAnimationProps): InteractivePlayerAnimation {
    return new InteractivePlayerAnimation(props);
  }

  private constructor(props: SpriteMoveAnimationProps) {
    super();
    this.x = props.sprite.pos.x;
    this.y = props.sprite.pos.y;
    this.props = props;
    if (this.props.dx > 0) {
      this.firstCostume = 2 * 4;
    }
    else if (this.props.dx < 0) {
      this.firstCostume = 1 * 4;
    }
    else if (this.props.dy < 0) {
      this.firstCostume = 3 * 4;
    }
    else {
      this.firstCostume = 0;
    }

    this.props.sprite.setCostume(this.firstCostume);
  }

  public onComplete(): void {
    if (this.props.onComplete !== undefined) {
      this.props.onComplete(this);
    }
  }

  public animate(elapsed: number): boolean {
    if (elapsed >= this.props.duration) {
      //console.log("Sprite done " + elapsed);
      this.props.sprite.pos = { x: this.x + this.props.dx, y: this.y + this.props.dy };
      this.props.sprite.setCostume(this.firstCostume);
      return false;
    }

    let r = elapsed / this.props.duration;
    this.props.sprite.pos = { x: this.x + this.props.dx * r, y: this.y + this.props.dy * r };
    // console.log("Sprite step " + elapsed);

    let costumePhase = Math.floor(elapsed / (this.props.duration / 4));
    this.props.sprite.setCostume(this.firstCostume + costumePhase);

    return true;
  }
}
*/