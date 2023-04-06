import { vm } from "./engine/ivm";
import { Sprite3 } from "./engine/sprite3";
import { Vector3, Vector4 } from "three";
import { IRigitBody, VoxelAnimationCollection } from "./voxel/voxelmeshmodel";
import { MoveController2D } from "./engine/movecontroller2d";
import { IDigGame } from "./engine/idiggame";
import { randInt } from "three/src/math/MathUtils";
import { Mammal4 } from "./engine/avatars/mammal4";
import { MapBlockRigitBody } from "./voxel/mapblockrigitbody";


class Snake extends Sprite3 {
  private sprite!: Sprite3;

  //public static async create(): Promise<Snake> {
  // let snake = await vm.createSprite(
  //   Snake,
  //   './assets/vox/snakehead.',
  //   new Vector3(0, 0, 0), new RoapModel(), undefined);

  //vm.onInput(snake.onKey.bind(this));

  // vm.physics.attachInputController(new MoveController2D(this))
  //vm.physics.addRigitObject(snake.sprite, undefined);
  //return snake;
  //}
}

class Bomb extends Sprite3 {
  public static async create(pos: Vector3): Promise<Bomb> {
    return await vm.createSprite(Bomb, 'vox/bomb.vox', pos, undefined, undefined);
  }
}

class Monky extends Mammal4 {
  public static async create(): Promise<Monky> {
    let ac: VoxelAnimationCollection = {
      move: [{ idx: 1, dur: 0.1 }, { idx: 2, dur: 0.1 }],
      stand: [{ idx: 0, dur: 0 }]
    }
    let m = await vm.createSprite(Monky, 'vox/monky.vox',
      new Vector3(120, 20, 120),
      undefined,
      ac);

    //inputController!.onKeyAction(this.onKey.bind(this));
    return m;
  }
}

let inputController: MoveController2D | undefined;

export class BoxedGame implements IDigGame {
  private char!: Monky;

  public async init(): Promise<void> {
    // create controller and options such as repeat rate and so on
    inputController = vm.setController(new MoveController2D({
      keySpeedX: 10,
      keySpeedZ: 10,
      thumbSpeedX: 10,
      thumbSpeedZ: 10,
      timeoutSeconds: 0.1
    }));

    await vm.loadLevel('default');
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
      let ev = await vm!.readInput();

      if (ev.speedX !== 0 || ev.speedZ !== 0) {
        this.char.animate('move');
      } else {
        this.char.animate('stand');
      }
      this.char.setSpeed(new Vector3(ev.speedX, 0, ev.speedZ));
    });
  }

  // the problem with that loop is that collision detection happens outside
  // this makes it less visible
  private async dropObject(): Promise<void> {
    console.log("start dropObject");
    vm.forever(async () => {
      let bomb = await Bomb.create(new Vector3(randInt(50, 150), 50, randInt(50, 150)));
      let speed = 10;

      bomb.speed.add(new Vector3(0, -speed, 0));

      while (true) {
        let collision = await vm.waitCollide([bomb], 0.1);
        if (collision === undefined) {
          speed = Math.min(speed * 1.1, 100);
          bomb.speed.set(0, -speed, 0);
        } else {
          if (collision.collision instanceof Monky) {
            vm.send('KilledMonkey');
          } else if (collision.collision instanceof MapBlockRigitBody) {
            for (let b of (collision.collision as MapBlockRigitBody).blocks) {
              vm.level.deleteBlock(b);
              vm.createExplosion(collision.position);
            }
            vm.removeSprite(bomb);
          } else {
            vm.removeSprite(bomb);
          }
          break;
        }
      }
    });
  }
}