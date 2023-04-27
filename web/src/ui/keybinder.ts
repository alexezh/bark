import _ from "lodash";
import { PxPos } from "../lib/pos";

// subset of mouse event; we use it to update things on the fly
export class MEvent {
  public x: number;
  public y: number;
  public button: number;
  public readonly shiftKey: boolean;
  public readonly altKey: boolean;

  public constructor(evt: any, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.button = evt.button;
    this.altKey = evt.altKey;
    this.shiftKey = evt.shiftKey;
  }
}

export function makeMEvent(evt: MouseEvent, offset?: PxPos, scale?: number): MEvent {
  const target = evt.target;

  // Get the bounding rectangle of target
  // @ts-ignore
  const rect = target!.getBoundingClientRect();

  // Mouse position
  let x = evt.clientX - rect.left;
  let y = evt.clientY - rect.top;

  if (scale !== undefined) {
    x = x / scale;
    y = y / scale;
  }

  if (offset !== undefined) {
    x += offset.x;
    y += offset.y;
  }

  return new MEvent(evt, x, y);
}

export class WEvent extends MEvent {
  public wheelDeltaX: number;
  public wheelDeltaY: number;

  public constructor(evt: any, x: number, y: number) {
    super(evt, x, y);
    this.wheelDeltaX = evt.wheelDeltaX;
    this.wheelDeltaY = evt.wheelDeltaY;
  }
}

type KeyBinding = {
  handler: () => void;
  help: string | undefined;
}

// convers press events into map which is more useful for games
// game logic can update scene periodically
export class KeyBinder {
  private htmlElem: HTMLElement;
  private moveKeys: { [id: string]: boolean } = {};
  private keyUpHandlers: { [id: string]: KeyBinding } = {};
  public pressedKeys: any = {};
  private onInput: (() => void) | undefined;

  public constructor(htmlElem: HTMLElement, onInput: (() => void) | undefined = undefined, attach: boolean = true) {
    this.moveKeys.ArrowLeft = true;
    this.moveKeys.ArrowRight = true;
    this.moveKeys.ArrowUp = true;
    this.moveKeys.ArrowDown = true;

    this.htmlElem = htmlElem;
    this.onInput = onInput;

    _.bindAll(this, ['onKeyDown', 'onKeyUp']);

    if (attach) {
      this.attach();
    }
  }

  public attach() {
    this.htmlElem.addEventListener('keydown', this.onKeyDown, false);
    this.htmlElem.addEventListener('keyup', this.onKeyUp, false);
  }

  public detach() {
    this.htmlElem.removeEventListener('keydown', this.onKeyDown);
    this.htmlElem.removeEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown(evt: any) {
    let isMove = this.moveKeys[evt.code];

    // reset all move keys, we want to capture the last
    if (isMove !== undefined) {
      this.pressedKeys.ArrowDown = false;
      this.pressedKeys.ArrowUp = false;
      this.pressedKeys.ArrowLeft = false;
      this.pressedKeys.ArrowRight = false;
    }

    this.pressedKeys[evt.code] = true;

    if (this.onInput !== undefined) {
      this.onInput();
    }
  }

  private onKeyUp(evt: any) {
    this.pressedKeys[evt.code] = false;

    let binding = this.keyUpHandlers[evt.code];
    if (binding !== undefined) {
      binding.handler();
    }

    if (this.onInput !== undefined) {
      this.onInput();
    }
  }

  public registerKeyUp(key: string, func: () => void, help: string | undefined = undefined) {
    this.keyUpHandlers[key] = { handler: func, help: help };
  }

  public unregisterKeyUp(key: string) {
    delete this.keyUpHandlers[key];
  }
}