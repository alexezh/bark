import { ModuleNode } from "../basic/ast";
import { addSystemFunc, addSystemType, createModuleNode } from "../basic/lib/systemfunc";
import { KeyBinder } from "../ui/keybinder";
import { IGamePhysicsInputController } from "./igamephysics";
import { IInputController, vm } from "./ivm";
import { IMoveEvent2D, MoveControllerConfig, MoveEvent2D } from "./movecontroller2d";

export class ThirdPersonControllerMoveEvent {
  public readonly speedX: number;
  public readonly speedZ: number;
  public readonly angleXZ: number;

  public constructor(speedX: number, speedZ: number, angleXZ: number) {
    this.speedX = speedX;
    this.speedZ = speedZ;
    this.angleXZ = angleXZ;
  }
}

export type ThirdPersonControllerConfig = {
  maxSpeed: number;
  keySpeed: number;
  keySpeedXZ: number;
  thumbSpeed: number;
  timeoutSeconds: number;
}

// handles ASDW and arrows
export class ThirdPersonController implements IGamePhysicsInputController, IInputController {
  private input: KeyBinder;
  private xrSession: XRSession | undefined;
  private gamePads: Gamepad[] = [];
  private config: ThirdPersonControllerConfig;
  private lastTick: number = 0;
  private timeoutMilliseconds: number = 0;
  private started: boolean = false;
  private angleXZ: number = 0;
  private speedX: number = 0;
  private speedZ: number = 0;


  public constructor(config: ThirdPersonControllerConfig) {
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

  public async readInput(): Promise<ThirdPersonControllerMoveEvent | undefined> {
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

    // first check VR controller
    for (let pad of this.gamePads) {
      let axes = pad.axes;

      // not sure why we have 4 axis
      if (axes[0] !== 0) {
        x += axes[0] * this.config.thumbSpeed;
      }

      if (axes[1] !== 0) {
        z += axes[1] * this.config.thumbSpeed;
      }

      if (axes[2] !== 0) {
        x += axes[2] * this.config.thumbSpeed;
      }

      if (axes[3] !== 0) {
        z += axes[3] * this.config.thumbSpeed;
      }
    }

    if (x !== 0 || z !== 0) {
      return {
        speedX: x,
        speedZ: z,
        angleXZ: this.angleXZ
      }
    }

    // now keyboard
    x = this.speedX;
    z = this.speedZ;

    if (this.input.pressedKeys.KeyA) {
      x -= this.config.keySpeed;
    }
    if (this.input.pressedKeys.KeyD) {
      x += this.config.keySpeed;
    }

    if (x !== 0 && x === this.speedX) {
      x -= Math.sign(x) * this.config.keySpeed;
    }

    if (this.input.pressedKeys.KeyS) {
      z += this.config.keySpeed;
    }

    if (this.input.pressedKeys.KeyW) {
      z -= this.config.keySpeed;
    }

    if (z !== 0 && z === this.speedZ) {
      z -= Math.sign(z) * this.config.keySpeed;
    }

    x = Math.max(-this.config.maxSpeed, Math.min(x, this.config.maxSpeed));
    z = Math.max(-this.config.maxSpeed, Math.min(z, this.config.maxSpeed));
    this.speedX = x;
    this.speedZ = z;

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

let controller: ThirdPersonController | undefined;

function activate(
  maxSpeed: number,
  keySpeed: number,
  thumbSpeed: number,
  timeoutSeconds: number) {

  // create controller and options such as repeat rate and so on
  let config: ThirdPersonControllerConfig = {
    maxSpeed: maxSpeed,
    keySpeed: keySpeed,
    keySpeedXZ: 5,
    thumbSpeed: thumbSpeed,
    timeoutSeconds: timeoutSeconds
  };

  controller = new ThirdPersonController(config);
  vm.setController(controller);
}


function readInput(): Promise<ThirdPersonControllerMoveEvent | undefined> {
  if (controller === undefined) {
    return Promise.resolve(undefined);
  }

  return controller.readInput();
}

export function createThirdPersonControllerModule(): ModuleNode {

  let module = createModuleNode('ThirdPersonController');

  module.funcs.push(addSystemFunc(module, 'readInput', [], 'void', true, readInput));
  module.funcs.push(addSystemFunc(module, 'activate', [
    'maxSpeed:number',
    'keySpeed:number',
    'thumbSpeed:number',
    'timeoutSeconds:number'], 'void', false, activate));

  module.types.push(addSystemType('MoveEvent2D', ThirdPersonControllerMoveEvent, ['speedX: number', 'speedZ: number']));

  return module;
}
