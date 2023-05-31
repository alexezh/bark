import { KeyBinder } from "../ui/keybinder";
import { IGamePhysicsInputController } from "./igamephysics";
import { IInputController, vm } from "./ivm";
import { MoveControllerConfig } from "./movecontroller2d";

// handles ASDW and arrows
export class ThirdPersonController implements IGamePhysicsInputController, IInputController {
  private input: KeyBinder;
  private xrSession: XRSession | undefined;
  private gamePads: Gamepad[] = [];
  private config: MoveControllerConfig;
  private lastTick: number = 0;
  private timeoutMilliseconds: number = 0;
  private started: boolean = false;
  private angleXZ: number = 0;

  public constructor(config: MoveControllerConfig) {
    this.config = config;
    this.timeoutMilliseconds = config.timeoutSeconds * 1000;
    // create detached key binder
    this.input = new KeyBinder(vm.camera.canvas, undefined, false);
    this.lastTick = performance.now();
  }

  public onXrSessionChanged(session: XRSession | undefined) {
    console.log('onXrSessionChanged');
    if (session !== undefined) {
      this.xrSession = session;
      this.xrSession.addEventListener('inputsourceschange', this.onXrInputChanged.bind(this));
      this.attachGamepad();
    }
  }

  start() {
    if (this.started) {
      throw new Error('already started');
    }

    this.started = true;
    this.input.attach();
  }

  stop() {
    if (!this.started) {
      return;
    }

    this.started = false;
    this.input.detach();
  }

  private onXrInputChanged() {
    this.attachGamepad();
  }

  public async readInput(): Promise<any> {
    if (!this.started) {
      return undefined;
    }

    let now = performance.now();
    if (this.lastTick + this.timeoutMilliseconds > now) {
      await new Promise(resolve => setTimeout(resolve, now - this.lastTick - this.timeoutMilliseconds));
    }

    this.lastTick = now;

    let x: number = 0;
    let z: number = 0;

    for (let pad of this.gamePads) {
      let axes = pad.axes;

      // not sure why we have 4 axis
      if (axes[0] !== 0) {
        x += axes[0] * this.config.thumbSpeedX;
      }

      if (axes[1] !== 0) {
        z += axes[1] * this.config.thumbSpeedZ;
      }

      if (axes[2] !== 0) {
        x += axes[2] * this.config.thumbSpeedX;
      }

      if (axes[3] !== 0) {
        z += axes[3] * this.config.thumbSpeedZ;
      }
    }

    if (x !== 0 || z !== 0) {
      return {
        speedX: x,
        speedZ: z,
        angleXZ: this.angleXZ
      }
    }

    if (this.input.pressedKeys.KeyA) {
      x -= this.config.keySpeedX;
    }

    if (this.input.pressedKeys.KeyD) {
      x += this.config.keySpeedX;
    }

    if (this.input.pressedKeys.KeyS) {
      z += this.config.keySpeedX;
    }

    if (this.input.pressedKeys.KeyW) {
      z -= this.config.keySpeedX;
    }

    // coordinates are toward us, but third person view is from behind
    // we have to inverse keys
    if (this.input.pressedKeys.ArrowRight) {
      this.angleXZ -= this.config.keySpeedXZ;
      if (this.angleXZ < -180) {
        this.angleXZ += 360;
      }
    }

    if (this.input.pressedKeys.ArrowLeft) {
      this.angleXZ += this.config.keySpeedXZ;
      if (this.angleXZ > 180) {
        this.angleXZ -= 360;
      }
    }

    if (this.input.pressedKeys.ArrowDown) {
      // z += this.config.keySpeedX;
    }

    if (this.input.pressedKeys.ArrowUp) {
      // z -= this.config.keySpeedX;
    }

    return {
      speedX: x,
      speedZ: z,
      angleXZ: this.angleXZ
    }
  }

  public update(tick: number) {
  }

  private attachGamepad() {
    this.gamePads.splice(0, this.gamePads.length);

    for (let source of this.xrSession!.inputSources) {
      if (source.gamepad !== null) {
        this.gamePads.push(source.gamepad!);
      }
    }
  }
}