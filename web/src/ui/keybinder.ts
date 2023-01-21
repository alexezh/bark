import { PxPos } from "../posh/pos";

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
}

// convers press events into map which is more useful for games
// game logic can update scene periodically
export class KeyBinder {
  private htmlElem: HTMLElement;
  private moveKeys: { [id: string]: boolean } = {};
  private keyUpHandlers: { [id: string]: KeyBinding } = {};
  public pressedKeys: any = {};
  private onInput: () => void;

  public constructor(htmlElem: HTMLElement, onInput: () => void) {
    this.moveKeys.ArrowLeft = true;
    this.moveKeys.ArrowRight = true;
    this.moveKeys.ArrowUp = true;
    this.moveKeys.ArrowDown = true;

    this.htmlElem = htmlElem;
    this.onInput = onInput;

    let self = this;
    htmlElem.addEventListener('keydown', (evt) => self.onKeyDown(evt), false);
    htmlElem.addEventListener('keyup', (evt) => self.onKeyUp(evt), false);
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

    this.onInput();
  }

  private onKeyUp(evt: any) {
    this.pressedKeys[evt.code] = false;

    let binding = this.keyUpHandlers[evt.code];
    if (binding !== undefined) {
      binding.handler();
    }

    this.onInput();
  }

  public registerKeyUp(key: string, func?: () => void) {
    if (func !== undefined) {
      this.keyUpHandlers[key] = { handler: func };
    } else {
      delete this.keyUpHandlers[key];
    }
  }
}