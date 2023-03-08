import { KeyBinder } from "../ui/keybinder";
import { IGamePhysicsInputController } from "./igamephysics";
import { Sprite3 } from "./sprite3";
import { vm } from "./ivm";

// abstracts actions between keyboard, controllers and mouse
export enum KeyAction {
    None,

    Jump,
    Action,
}

export type KeyAction = {
    move: number; // -1 back
    strafe: number; // -1 left
    jump: boolean;
    // true if keyboard has not changed
    repeat: number;
}

// handles ASDW and arrows
export class MoveController2D implements IGamePhysicsInputController {
    private pending: ((action: KeyAction | undefined) => void) | undefined = undefined;
    private actionGen: number = 0;
    private lastAction: KeyAction | undefined;
    private lastActionTimeSeconds: number = 0;
    private input: KeyBinder;
    private keyRepeatTimeoutSeconds = 0.1;

    public constructor() {
        this.input = new KeyBinder(vm.canvas, this.onKey.bind(this));
        this.lastActionTimeSeconds = vm.clock.elapsedTime;
    }

    // wait for next key press (emulating basic behavior)
    public waitAction(timeoutSeconds: number): Promise<KeyAction | undefined> {

        let promise = new Promise<KeyAction | undefined>((resolve) => { this.pending = resolve });
        if (this.lastAction !== undefined && this.lastAction.repeat === 0) {
            this.lastAction.repeat += 1;
            this.pending!.call(this, this.lastAction);
            return promise;
        }

        let lastAction = this.lastAction;
        if (lastAction !== undefined) {
            setTimeout(() => {
                if (lastAction !== undefined && lastAction === this.lastAction) {
                    lastAction.repeat += 1;
                    this.pending!.call(this, this.lastAction);
                }
            }, timeoutSeconds * 1000);
        }

        return promise;
    }

    private onKey(): void {
        this.lastActionTimeSeconds = vm.clock.elapsedTime;

        let action: KeyAction = {
            move: 0,
            strafe: 0,
            jump: false,
            repeat: 0
        };

        if (this.input.pressedKeys.ArrowLeft || this.input.pressedKeys.KeyA) {
            action.strafe -= 1;
        }

        if (this.input.pressedKeys.ArrowRight || this.input.pressedKeys.KeyD) {
            action.strafe += 1;
        }

        if (this.input.pressedKeys.ArrowDown || this.input.pressedKeys.KeyS) {
            action.move += 1;
        }

        if (this.input.pressedKeys.ArrowUp || this.input.pressedKeys.KeyW) {
            action.move -= 1;
        }

        this.lastAction = action;
        if (this.pending !== undefined) {
            this.lastAction.repeat += 1;
            this.pending!.call(this, this.lastAction);
            this.pending = undefined;
        }
    }

    public async onKeyDzz(input: KeyBinder): Promise<void> {
        let sx: number = 0;
        let sy: number = 0;
        let sz: number = 0;

        if (input.pressedKeys.w) {
            sy = 1;
        }

        // this.sprite.setSpeed(this, new Vector3(dx, dy, dz));
        // this.sprite.setDirection();
    }
}

