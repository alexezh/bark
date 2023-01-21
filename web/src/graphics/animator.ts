import { Ticker as PixiTicker } from 'pixijs';

export interface IAnimatable {
  get id(): number;
  get startTime(): number;
  onStart(frameTime: number): void;
  onComplete(): void;
  animate(frameTime: number): boolean;
}

export class Animatable implements IAnimatable {
  private _id: number;
  private _startTime: number = 0;

  public constructor() {
    this._id = animator.nextId();
  }

  get id(): number { return this._id; }
  get startTime(): number { return this._startTime; }

  public onStart(frameTime: number): void {
    this._startTime = frameTime;
  }

  public onComplete(): void {

  }

  public animate(elapsed: number): boolean {
    throw new Error("Method not implemented.");
  }
}

// applies linear animation to a property
// changes property by step until the total change is delta
export class LinearAnimator extends Animatable {
  public obj: any;
  public prop: string;
  public delta: number;
  public step: number;

  constructor(obj: object, prop: string, delta: number, step: number) {
    super();
    this.obj = obj;
    this.prop = prop;
    this.delta = delta;
    this.step = step;
  }

  public animate(frameTime: number) {
    if (this.delta === 0) {
      return false;
    } else if (this.delta > 0) {
      if (this.delta > this.step) {
        this.delta -= this.step;
        this.obj[this.prop] += this.step;
        return true;
      } else {
        this.obj[this.prop] += this.delta;
        this.delta = 0;
        return false;
      }
    } else {
      if (this.delta < this.step) {
        this.delta -= this.step;
        this.obj[this.prop] += this.step;
        return true;
      } else {
        this.obj[this.prop] += this.delta;
        this.delta = 0;
        return false;
      }
    }
  }
}

/*
// applies linear animation to a property
// changes property by step until the total change is delta
export class LoopLinearAnimator {
  public prop: NumberProperty;
  public startDelta: number;
  public delta: number;
  public step: number;
  public direction: number;

  constructor(prop: NumberProperty, delta: number, step: number) {
    this.prop = prop;
    this.startDelta = Math.abs(delta);
    this.delta = this.startDelta;
    this.step = Math.abs(step);
    this.direction = (delta > 0) ? 1 : -1;
  }

  public animate(frameTime: number) {
    if (this.delta > this.step) {
      this.delta -= this.step;
      this.prop.add(this.step * this.direction);
    } else {
      this.prop.set(this.delta * this.direction);
      this.delta = this.startDelta;
      this.direction = -this.direction;
    }

    return true;
  }
}
*/

// goes through list of values in array
export class DiscreteAnimator extends Animatable {
  public obj: any;
  public prop: string;
  public values: number[];
  public index: number;
  public intervalMs: number;
  public lastFrameTimeMs: number;

  constructor(obj: any, prop: string, values: number[], intervalSeconds: number) {
    super();
    this.obj = obj;
    this.prop = prop;
    this.values = values;
    this.index = 0;
    this.intervalMs = intervalSeconds * 1000;
    this.lastFrameTimeMs = performance.now();
    this.obj[this.prop] = this.values[this.index];
  }

  public animate(frameTime: number) {
    if (this.lastFrameTimeMs + this.intervalMs > frameTime)
      return true;

    let newIndex = this.index + 1;
    if (newIndex >= this.values.length)
      newIndex = 0;

    this.index = newIndex;
    this.obj[this.prop] = this.values[newIndex];
    this.lastFrameTimeMs = frameTime;

    return true;
  }
}

// keeps track of animated properties
export class PropertyAnimationManager {
  private animations: Map<number, IAnimatable> = new Map<number, IAnimatable>();
  private nextKey: number;
  public onUpdateScene?: (isDirty: boolean) => void;
  private ticker?: PixiTicker;
  private lastTick: number = 0;

  // called on every frame to allow app to update state before rendering
  public onInput?: () => void;

  constructor() {
    this.nextKey = 0;
  }

  public start(ticker: PixiTicker) {
    this.ticker = ticker;
    ticker.add(() => this.processAnimation());
  }

  // animates property of an object. Object should have "id" property which used as a key
  public animate(anim: IAnimatable) {
    this.animations.set(anim.id, anim);
    anim.onStart(performance.now());
  }

  public cancel(anim: IAnimatable) {
    this.animations.delete(anim.id);
  }

  public nextId(): number {
    return this.nextKey++;
  }

  public get hasAnimations(): boolean {
    return this.animations.size > 0;
  }

  private processAnimation() {
    let frameTime = performance.now();

    // record if we might make any changes to view
    // otherwise, the last frame of animation might not render
    let isDirty = this.animations.size > 0;

    for (let entry of this.animations) {
      // @ts-ignore
      let key = entry[0] as number;
      // @ts-ignore
      let prop = entry[1] as IAnimatable;

      // sometime now can report in the past
      let dt = frameTime - prop.startTime;
      if (dt < 0) {
        dt = 0;
      }

      if (!prop.animate(dt)) {
        this.animations.delete(key);
        prop.onComplete();
      }
    }

    if (this.onInput !== undefined) {
      this.onInput();
    }

    if (this.onUpdateScene !== undefined) {
      this.onUpdateScene(isDirty);
    }

    //console.log('frame ' + (frameTime - this.lastTick).toString() + " count " + c);
    //this.lastTick = frameTime;
  }
}

export var animator = new PropertyAnimationManager();
