import { vm } from "./engine/ivm";
import { Sprite3 } from "./engine/sprite3";
import { Vector3, Vector4 } from "three";
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
    let m = await vm.createSprite(Monky, './assets/vox/monky.vox', new Vector3(50, 50, 20), undefined);

    //inputController!.onKeyAction(this.onKey.bind(this));
    return m;
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
    console.log("start moveMonkey");
    vm.forever(async () => {
      let action = await inputController!.waitAction(10);
      if (action !== undefined) {
        this.char.setSpeed(new Vector3(action.move * 10, action.strafe * 10, 0));
      }
    });
  }

  // the problem with that loop is that collision detection happens outside
  // this makes it less visible
  private async dropObject(): Promise<void> {
    console.log("start dropObject");
    vm.forever(async () => {
      let bomb = await Bomb.create(new Vector3(randInt(50, 150), randInt(50, 150), 50));
      let speed = 10;

      bomb.speed.add(new Vector3(0, 0, -speed));

      while (true) {
        let collision = await vm.waitCollide([bomb], 0.1);
        if (collision === undefined) {
          speed = Math.min(speed * 1.1, 100);
          bomb.speed.add(new Vector3(0, 0, -speed));
        } else {
          if (collision instanceof Monky) {
            vm.send('KilledMonkey');
          } else {
            vm.removeSprite(bomb);
          }
          break;
        }
      }
    });
  }
}