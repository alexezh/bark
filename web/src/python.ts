import { vm } from "./engine/ivm";
import { Sprite3 } from "./engine/sprite3";
import { Vector3, Vector4 } from "three";
import { MoveController2D } from "./engine/movecontroller2d";
import { IDigGame } from "./engine/idiggame";
import { randInt } from "three/src/math/MathUtils";
import { Mammal4Model } from "./engine/avatars/mammal4";
import { MapBlockRigitBody } from "./voxel/mapblockrigitbody";
import { StaticCubeModel } from "./engine/avatars/staticcubemodel";


async function createBomb(pos: Vector3): Promise<Sprite3> {
  let sprite = await vm.createSprite('bomb', 'vox/bomb.vox', new StaticCubeModel());
  sprite.setPosition(pos);
  return sprite;
}

async function createMonky(): Promise<Sprite3> {
  let m = await vm.createSprite('monky', 'vox/monky.vox', new Mammal4Model());
  m.setPosition(new Vector3(120, 20, 120));

  m.rigit.addAnimation('move');
  m.rigit.addFrame('move', 1, 0.1);
  m.rigit.addFrame('move', 2, 0.1);

  m.rigit.addAnimation('stand');
  m.rigit.addFrame('stand', 0, 0);

  //inputController!.onKeyAction(this.onKey.bind(this));
  return m;
}

let inputController: MoveController2D | undefined;

export class BoxedGame implements IDigGame {
  private char!: Sprite3;

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
    this.char = await createMonky();

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
        this.char.rigit.animate('move');
      } else {
        this.char.rigit.animate('stand');
      }
      this.char.setSpeed(new Vector3(ev.speedX, 0, ev.speedZ));
    });
  }

  // the problem with that loop is that collision detection happens outside
  // this makes it less visible
  private async dropObject(): Promise<void> {
    console.log("start dropObject");
    vm.forever(async () => {
      let bomb = await createBomb(new Vector3(randInt(50, 150), 50, randInt(50, 150)));
      let speed = 10;

      bomb.speed.add(new Vector3(0, -speed, 0));

      while (true) {
        let collision = await vm.waitCollide(bomb, 0.1);
        if (collision === undefined) {
          speed = Math.min(speed * 1.1, 100);
          bomb.speed.set(0, -speed, 0);
        } else {
          if (collision instanceof Sprite3) {
            vm.send('KilledMonkey');
          } else if (collision instanceof MapBlockRigitBody) {
            for (let b of (collision as MapBlockRigitBody).blocks) {
              vm.level.deleteBlock(b);
              vm.createExplosion(collision.position);
            }
            vm.removeSprite(bomb);
          } else { // boundary
            vm.removeSprite(bomb);
          }
          break;
        }
      }
    });
  }
}