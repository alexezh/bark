import { KeyBinder } from "../ui/keybinder";
import { IGamePhysicsInputController } from "./igamephysics";
import { Sprite3 } from "./sprite3";
import { vm } from "./ivm";

// abstracts actions between keyboard, controllers and mouse
export interface IKeyEvent {
    get left(): boolean;
    get right(): boolean;
    get forward(): boolean;
    get backward(): boolean;
    get jump(): boolean;
    get action(): boolean;
}

class KeyEvent implements IKeyEvent {
    public none: boolean = false;
    public left: boolean = false;
    public right: boolean = false;
    public forward: boolean = false;
    public backward: boolean = false;
    public jump: boolean = false;
    public action: boolean = false;
    public repeat: number = 0;
    public lastKeyTimeSeconds: number = 0;
}

// handles ASDW and arrows
export class MoveController2D implements IGamePhysicsInputController {
    private pending: ((action: IKeyEvent) => void) | undefined = undefined;
    private lastEvent: KeyEvent = new KeyEvent();
    private input: KeyBinder;
    private keyRepeatTimeoutSeconds = 0.1;

    public constructor() {
        this.input = new KeyBinder(vm.camera.canvas, this.onKey.bind(this));
    }

    // wait for next key press (emulating basic behavior)
    public waitKey(timeoutSeconds: number): Promise<IKeyEvent> {

        let promise = new Promise<IKeyEvent>((resolve) => { this.pending = resolve });
        if (this.lastEvent !== undefined && this.lastEvent.repeat === 0) {
            this.lastEvent.repeat += 1;
            this.pending!.call(this, this.lastEvent);
            return promise;
        }

        // keep event object for comparison in case if we get event while waiting
        let lastEvent = this.lastEvent;
        if (lastEvent !== undefined) {
            setTimeout(() => {
                if (lastEvent !== undefined && lastEvent === this.lastEvent) {
                    lastEvent.repeat += 1;
                    this.pending!.call(this, this.lastEvent);
                }
            }, timeoutSeconds * 1000);
        }

        return promise;
    }

    private onKey(): void {

        let ev = new KeyEvent();
        ev.lastKeyTimeSeconds = vm.clock.lastTick;

        if (this.input.pressedKeys.ArrowLeft || this.input.pressedKeys.KeyA) {
            ev.left = true;
        }

        if (this.input.pressedKeys.ArrowRight || this.input.pressedKeys.KeyD) {
            ev.right = true;
        }

        if (this.input.pressedKeys.ArrowDown || this.input.pressedKeys.KeyS) {
            ev.forward = true;
        }

        if (this.input.pressedKeys.ArrowUp || this.input.pressedKeys.KeyW) {
            ev.backward = true;
        }

        this.lastEvent = ev;
        if (this.pending !== undefined) {
            this.lastEvent.repeat += 1;
            this.pending!.call(this, this.lastEvent);
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

