import { KeyBinder } from "../ui/keybinder";
import { IGamePhysicsInputController } from "./igamephysics";
import { Sprite3 } from "./sprite3";
import { IInputController, vm } from "./ivm";

// abstracts actions between keyboard, controllers and mouse
export interface IMoveEvent2D {
  get speedX(): number;
  get speedZ(): number;
}

class MoveEvent2D implements IMoveEvent2D {
  public speedX: number = 0;
  public speedZ: number = 0;
}

export type MoveControllerConfig = {
  keySpeedX: number;
  keySpeedZ: number;
  thumbSpeedX: number;
  thumbSpeedZ: number;
  timeoutSeconds: number;
}

// handles ASDW and arrows
export class MoveController2D implements IGamePhysicsInputController, IInputController {
  private pending: ((action: IMoveEvent2D) => void) | undefined = undefined;
  private lastEvent: MoveEvent2D = new MoveEvent2D();
  private input: KeyBinder;
  private xrSession: XRSession | undefined;
  private gamePad: Gamepad | undefined;
  private config: MoveControllerConfig;
  private lastTick: number = 0;
  private timeoutMilliseconds: number = 0;

  public constructor(config: MoveControllerConfig) {
    this.config = config;
    this.timeoutMilliseconds = config.timeoutSeconds * 1000;
    this.input = new KeyBinder(vm.camera.canvas, () => { });
    this.lastTick = performance.now();
  }

  public onXrSessionChanged(session: XRSession | undefined) {
    console.log('onXrSessionChanged');
    if (session !== undefined) {
      this.xrSession = session;
      this.attachGamepad();
    }
  }

  public async readInput(): Promise<any> {
    let now = performance.now();
    if (this.lastTick + this.timeoutMilliseconds > now) {
      await new Promise(resolve => setTimeout(resolve, now - this.lastTick - this.timeoutMilliseconds));
    }

    let x: number = 0;
    let z: number = 0;

    if (this.gamePad !== undefined) {
      let axes = this.gamePad.axes;

      if (axes[0] !== 0) {
        x -= axes[0] * this.config.thumbSpeedX;
      } else if (axes[1] !== 0) {
        z += axes[1] * this.config.thumbSpeedZ;
      } else if (axes[2] !== 0) {
        x += axes[2] * this.config.thumbSpeedX;
      } else if (axes[3] !== 0) {
        z -= axes[3] * this.config.thumbSpeedZ;
      }
    }

    if (x !== 0 || z !== 0) {
      return {
        speedX: x,
        speedZ: z
      }
    }

    if (this.input.pressedKeys.ArrowLeft || this.input.pressedKeys.KeyA) {
      x -= this.config.keySpeedX;
    }

    if (this.input.pressedKeys.ArrowRight || this.input.pressedKeys.KeyD) {
      x += this.config.keySpeedX;
    }

    if (this.input.pressedKeys.ArrowDown || this.input.pressedKeys.KeyS) {
      z += this.config.keySpeedX;
    }

    if (this.input.pressedKeys.ArrowUp || this.input.pressedKeys.KeyW) {
      z -= this.config.keySpeedX;
    }

    return {
      speedX: x,
      speedZ: z
    }
  }

  public update(tick: number) {
  }

  private attachGamepad() {
    this.gamePad = undefined;

    for (let source of this.xrSession!.inputSources) {
      if (source.gamepad !== null) {
        this.gamePad = source.gamepad;
      }
    }
  }
}

