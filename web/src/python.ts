import { vm } from "./engine/ivm";
import { Sprite3 } from "./engine/sprite3";
import { Vector3, Vector4 } from "three";
import { MoveController2D } from "./engine/movecontroller2d";
import { IDigGame } from "./engine/idiggame";
import { randInt } from "three/src/math/MathUtils";
import { MapBlockRigitBody } from "./voxel/mapblockrigitbody";
import { CubeModel } from "./engine/avatars/cubemodel";


async function createBomb(pos: Vector3): Promise<Sprite3> {
  let sprite = await vm.createSprite('bomb', 'vox/bomb.vox', new CubeModel(1.0));
  sprite.setPosition(pos);
  return sprite;
}

async function createMonky(): Promise<Sprite3> {
  let m = await vm.createSprite('monky', 'vox/monky.vox', new CubeModel(1.0));
  m.setPosition(new Vector3(120, 20, 120));

  m.rigit!.addAnimation('move');
  m.rigit!.addFrame('move', 1, 0.1);
  m.rigit!.addFrame('move', 2, 0.1);

  m.rigit!.addAnimation('stand');
  m.rigit!.addFrame('stand', 0, 0);

  //inputController!.onKeyAction(this.onKey.bind(this));
  return m;
}

export function boxedGame() {
  let char!: Sprite3;

  vm.runner.onLoad(onLoad);
  vm.runner.onStart(moveMonkey);
  vm.runner.onStart(dropObject);

  async function onLoad(): Promise<void> {
    // create controller and options such as repeat rate and so on
    vm.setController(new MoveController2D({
      keySpeedX: 10,
      keySpeedZ: 10,
      keySpeedXZ: 5,
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
    /*
    vm.forever(async () => {
      let ev = await vm!.readInput();

      if (ev.speedX !== 0 || ev.speedZ !== 0) {
        char.rigit.animate('move');
      } else {
        char.rigit.animate('stand');
      }
      char.setRelativeSpeed(new Vector3(ev.speedX, 0, ev.speedZ));
    });
    */
  }

  // the problem with that loop is that collision detection happens outside
  // this makes it less visible
  async function dropObject(): Promise<void> {
    console.log("start dropObject");
    vm.forever(async () => {
      let bomb = await createBomb(new Vector3(randInt(50, 150), 50, randInt(50, 150)));
      let speed = 10;

      bomb.setRelativeSpeed(bomb.relativeSpeed.clone().add(new Vector3(0, -speed, 0)));

      while (true) {
        let collision = await vm.waitCollide(bomb, 0.1);
        if (collision === undefined) {
          speed = Math.min(speed * 1.1, 100);
          bomb.setRelativeSpeed(new Vector3(0, -speed, 0));
        } else {
          if (collision instanceof Sprite3) {
            vm.sendMesssage('KilledMonkey', null);
          } else if (collision instanceof MapBlockRigitBody) {
            vm.level.deleteBlock(collision);
            vm.createExplosion(collision.position);
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
      System.loadLevel 'default'

      ThirdPersonController.activate maxSpeed:=40 keySpeedX:=10 keySpeedZ:=10 thumbSpeedX:=10 thumbSpeedZ:=10 timeoutSeconds:=0.1
    end

    on start() begin
      var monky:= System.createMammal4Sprite 'monky' 'vox/monky.vox' scale:=0.6
      Sprite.setPosition monky 120 20 120

      var ma:= Sprite.addAnimation monky 'move'
      Sprite.addFrame ma idx:= 1 dur:=0.1 
      Sprite.addFrame ma idx:= 2 dur:=0.1
  
      ma:= Sprite.addAnimation monky 'stand'
      Sprite.addFrame ma idx:= 0 dur:=0

      System.setThirdPersonCamera monky x:=0 y:=40 z:=60

      forever do
        var ev := ThirdPersonController.readInput();
  
        if ev.speedX != 0 or ev.speedZ != 0 then
          Sprite.animate monky 'move'
        else
          Sprite.animate monky 'stand'
        end
        Sprite.setSpeed monky ev.speedX 0 ev.speedZ
        Sprite.setAngleXZ monky ev.angleXZ
      end
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
            Sprite.changeSpeedBy bomb x:=0 y:=-speed z:=0
          else
            if collision is System.Sprite then
              System.sendMessage "KilledMonkey"
            elif collision is System.Block then
              System.deleteBlock collision
              System.createExplosion collision.position;
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

export function boxedBasic2(): string {
  return `
    on load function() begin
      System.loadLevel 'default'

      ThirdPersonController.activate maxSpeed:=40 keySpeed:=10 thumbSpeed:=10 timeoutSeconds:=0.1
    end

    var monky;

    on start function() begin
      monky:= Sprite.createCubeSprite 'monky' 'vox/monky.vox' scale:=0.5
      Sprite.setPosition monky 120 20 120

      var ma:= Sprite.addAnimation monky 'move'
      Sprite.addFrame ma idx:= 1 dur:=0.1 
      Sprite.addFrame ma idx:= 2 dur:=0.1
  
      ma:= Sprite.addAnimation monky 'stand'
      Sprite.addFrame ma idx:= 0 dur:=0

      System.setThirdPersonCamera monky x:=100 y:=50 z:=0

      System.log 'send start message'
      System.sendMessage 'startMonky' monky

      forever do
        var ev := ThirdPersonController.readInput();
  
        if ev.speedX != 0 or ev.speedZ != 0 then
          Sprite.animate monky 'move'
        else
          Sprite.animate monky 'stand'
        end
        Sprite.setSpeed monky x:=ev.speedX y:=0 z:=ev.speedZ
        Sprite.setAngleXZ monky ev.angleXZ

        if ev.fire then
          System.sendMessage 'shootBread' monky
        end
      end
    end

    on message='startMonky' function(monky: Sprite) begin
      System.log 'start monky'
      forever do
        var collision := System.waitCollide monky
        if collision is Sprite.Boundary then
          System.log 'monky hit boundary'
          System.sendMessage 'killedMonkey'
          break;
        end
      end
    end

    on message='shootBread' function(monky: Sprite) begin
      System.log 'shoot bread'
      var bullet := Sprite.createProjectile monky 'vox/bread.vox'
      Sprite.setSpeed bullet 50 20 0
      forever do
        var collision := System.waitCollide bullet
        if collision is Sprite.Sprite then
          System.log 'collided with sprite'
          Sprite.removeProjectile(bullet);
          break;
        elif collision is Sprite.Block then
          System.log 'collided with block'
          System.deleteBlock collision
          System.createExplosion collision.position;
          Sprite.removeProjectile(bullet);
          break;
        elif collision != null then
          System.log 'collided with something'
          Sprite.removeProjectile(bullet);
        break;
      end
      end
    end

    on message='killedMonkey' function(monky: Sprite) begin
      System.restart
    end
    `;
}
