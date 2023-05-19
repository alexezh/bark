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

export function boxedGame() {
  let char!: Sprite3;

  vm.onLoad(onLoad);
  vm.onStart(moveMonkey);
  vm.onStart(dropObject);

  async function onLoad(): Promise<void> {
    // create controller and options such as repeat rate and so on
    vm.setController(new MoveController2D({
      keySpeedX: 10,
      keySpeedZ: 10,
      thumbSpeedX: 10,
      thumbSpeedZ: 10,
      timeoutSeconds: 0.1
    }));

    await vm.loadLevel('default');
    char = await createMonky();
  }

  // in digg
  // forever { key = waitKey()}
  async function moveMonkey(): Promise<void> {
    console.log("start moveMonkey");
    vm.forever(async () => {
      let ev = await vm!.readInput();

      if (ev.speedX !== 0 || ev.speedZ !== 0) {
        char.rigit.animate('move');
      } else {
        char.rigit.animate('stand');
      }
      char.setSpeed(new Vector3(ev.speedX, 0, ev.speedZ));
    });
  }

  // the problem with that loop is that collision detection happens outside
  // this makes it less visible
  async function dropObject(): Promise<void> {
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
            vm.sendMesssage('KilledMonkey', null);
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

export function boxedBasic(): string {
  return `
    on load() begin
      var level:= System.loadLevel 'default'
    end

    on start() begin
      var monky:= System.createCubeSprite 'monky' 'vox/monky.vox'

      var ma:= Sprite.addAnimation monky 'move'
      Sprite.addFrame ma idx:= 1 dur:=0.1 
      Sprite.addFrame ma idx:= 2 dur:=0.1
  
      ma:= Sprite.addAnimation monky 'stand'
      Sprite.addFrame ma idx:= 0 dur:=0
    end

    on start() begin
      forever do
        var bomb:= System.createCubeSprite 'bomb' 'vox/bomb.vox'
        Sprite.setPosition bomb Math.randInt(50, 150) 50 Math.randInt(50, 150)
    
        var speed:= 10;
        Sprite.setSpeed bomb x:=0 y:=-speed z:=0
    
        while true do
          var collision := System.waitCollide bomb 0.1
          if collision = null then
            speed := Math.min speed * 1.1 100;
            Sprite.changeSpeedBy bomb 0 -speed 0
          else
            if collision is Sprite then
              System.sendMessage "KilledMonkey"
            elif collision is Block then
              foreach b in collision.blocks do
                System.deleteBlock level b
                System.createExplosion collision.position;
              end
              System.removeSprite bomb
            else
              System.removeSprite bomb
            end
            break;
          end
        end
      end
    end 
      `;
}