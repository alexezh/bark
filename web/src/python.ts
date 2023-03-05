import { vm } from "./engine/ivm";
import { Sprite3 } from "./engine/sprite3";
import { Vector3 } from "three";
import { RoapModel } from "./engine/avatars/sequencebody";
import { IRigitBody, RigitBodyArray } from "./engine/voxelmeshmodel";
import { KeyAction, MoveController2D } from "./engine/movecontroller2d";
import { IDigGame } from "./engine/idiggame";
import { randInt } from "three/src/math/MathUtils";


class Snake extends Sprite3 {
  private sprite!: Sprite3;

  public static async create(): Promise<Snake> {
    let snake = await vm.createSprite(Snake, './assets/vox/snakehead.', new Vector3(0, 0, 0), new RoapModel());

    //vm.onInput(snake.onKey.bind(this));

    // vm.physics.attachInputController(new MoveController2D(this))
    //vm.physics.addRigitObject(snake.sprite, undefined);
    return snake;
  }
}

class Bomb extends Sprite3 {
  public static async create(pos: Vector3): Promise<Bomb> {
    return await vm.createSprite(Bomb, './assets/vox/bomb.vox', pos, undefined);
  }
}

class Monky extends Sprite3 {
  public static async create(): Promise<Monky> {
    let m = await vm.createSprite(Monky, './assets/vox/monky.vox', new Vector3(0, 0, 1000), undefined);

    //inputController!.onKeyAction(this.onKey.bind(this));
    return m;
  }

  public async onKey(action: KeyAction): Promise<void> {
    if (action === KeyAction.None) {
      this.speed.set(0, 0, 0);
    } else {
      this.speed.set(1, 0, 0);
    }
  }
}

let inputController: MoveController2D | undefined;

export class BoxedGame implements IDigGame {
  private char!: Monky;

  public async init(): Promise<void> {
    // create controller and options such as repeat rate and so on
    inputController = new MoveController2D();

    await vm.loadMap('test');
    this.char = await Monky.create();

    vm.onStart(this.moveMonkey.bind(this));
    vm.onStart(this.dropObject.bind(this));
  }

  start(): void {
  }
  stop(): void {
  }

  // in digg
  // forever { key = waitKey()}
  private async moveMonkey(): Promise<void> {
    vm.forever(async () => {
      let action = await inputController!.waitAction(this.char, 0.1);
      if (action !== undefined && action === KeyAction.None) {
        this.char.speed.set(0, 0, 0);
      }
    });
  }

  // the problem with that loop is that collision detection happens outside
  // this makes it less visible
  private async dropObject(): Promise<void> {
    vm.forever(async () => {
      let bomb = await Bomb.create(new Vector3(randInt(0, 1000), randInt(0, 1000), 1000));
      let speed = 10;
      let collisions: IRigitBody[] = [];

      bomb.speed.add(new Vector3(0, 0, -speed));

      while (!await vm.waitCollide(bomb, 0.1, collisions)) {
        speed = Math.min(speed * 1.1, 100);
        bomb.speed.add(new Vector3(0, 0, -speed));
      }

      if (RigitBodyArray.contains<Monky>(collisions)) {
        vm.send('KilledMonkey');
      } else {
        vm.removeSprite(bomb);
      }
    });
  }
}