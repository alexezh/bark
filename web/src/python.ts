import { GameColors } from "./ui/gamecolors";
import { Character } from "./engine/character";
import { GameMap } from "./engine/gamemap";
import { vm } from "./engine/vm";
import { IRigitBody, Sprite3 } from "./engine/sprite3";
import { MapBlock } from "./engine/maplayer";
import { GamePhysics } from "./engine/gamephysics";
import { Vector3 } from "three";


class Snake {
  private body: SequenceBody;
  public constructor() {
    vm.onKey(this.onKey.bind(this));
  }

  public async onKey(): Promise<void> {

  }
}

class Bomb {
  public sprite: Sprite3;
  public constructor() {
    this.sprite = await Sprite3.create('./assets/vox/bomb.vox');
    this.sprite.position.set(0, 0, 1000);
    this.sprite.owner = this;

  }

  public onCollide(target: MapBlock | Sprite3) {

  }
}

class Monky {
  public sprite: Sprite3;
  public constructor() {
    this.sprite = await Sprite3.create('./assets/vox/monky.vox');
    this.sprite.position.set(0, 0, 1000);
    this.sprite.owner = this;

    vm.onKey(this.onKey.bind(this));
  }

  public async onKey(): Promise<void> {
    vm.physics.moveSprite()
  }
}

export class BoxedGame {
  private map!: GameMap;
  private char!: Character;
  private boxed!: Object[];
  private bombClass!: {};

  public async init(): Promise<boolean> {
    this.map = new GameMap();
    this.map.load();
    this.char = new Character('./assets/vox/monky.vox', GameColors.material);
    await this.char.load();

    vm.onStart(this.dropObject.bind(this));
    vm.start(this.map);

    return true;
  }


  private async dropObject(): Promise<void> {
    vm.forever(async () => {

      while (bomb.)
        await vm.sleep(100);
    });
  }
}