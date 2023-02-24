import { KeyBinder } from "../ui/keybinder";
import { IGamePhysicsInputController } from "./igamephysics";
import { Sprite3 } from "./sprite3";
import { vm } from "./vm";

// abstracts actions between keyboard, controllers and mouse
export enum KeyAction {
    None,
    Left,
    Right,
    Forward,
    Back,
    Jump,
    Action,
}

// handles ASDW and arrows
export class MoveController2D implements IGamePhysicsInputController {
    private pending: ((action: KeyAction | undefined) => void) | undefined = undefined;
    private lastAction: KeyAction | undefined;
    private input: KeyBinder;

    public constructor() {
        this.input = new KeyBinder(vm.canvas, this.onKey.bind(this));
    }

    // called by physics engine before next move
    // check if we have pending wait and complete it before we continue
    public onBeforeMove(tick: number): Promise<void> {
        let action: KeyAction;
        action = KeyAction.Left;
        // compute current action
        // this.onInput?.call(this, action);
        throw new Error("Method not implemented.");
    }

    public onAfterMove() {
        throw new Error("Method not implemented.");
    }

    // wait for next key press (emulating basic behavior)
    public waitAction(sprite: Sprite3, timeout: number): Promise<KeyAction | undefined> {
        // make sure that controller attached; mostly noop
        vm.physics.attachInputController(this);

        let promise = new Promise<KeyAction | undefined>((resolve) => { this.pending = resolve });
        if (this.lastAction !== undefined) {
            this.pending!.call(this, this.lastAction);
        }

        // setTimeout(timeout, )

        return promise;
    }

    private onKey(): void {

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

