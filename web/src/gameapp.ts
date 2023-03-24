import { Shell } from "./ui/shell";
import { setShell, shell } from "./ui/igameshell";
import { createVM } from "./engine/vm";
import { vm } from "./engine/ivm";
import { BoxedGame } from "./python";

const demoWorldId = "7fa84179-dc58-4939-8678-03370fd137f3";

// root objects of the application
export class GameApp {
  private gameContainer: HTMLDivElement | undefined;
  private ready: boolean = false;

  // @ts-ignore
  public get shell(): Shell { return this._terminal; }

  public async run() {
    this.tryOnReady();
  }

  public setContainer(gameContainer: HTMLDivElement) {
    window.onresize = () => this.resizeCanvas();

    this.gameContainer = gameContainer;
    this.resizeCanvas();

    createVM(gameContainer);

    setShell(new Shell(gameContainer));
    this.tryOnReady();
  }

  // wait for everything to initialize
  private tryOnReady() {
    if (shell === undefined || this.ready) {
      return;
    }

    this.ready = true;
    setTimeout(async () => {
      await vm.loadGame(BoxedGame);
      vm.start();
    });
  }

  private resizeCanvas() {
    if (this.gameContainer === undefined) {
      return;
    }

    this.gameContainer.style.width = window.innerWidth.toString();
    this.gameContainer.style.height = window.innerHeight.toString();
    if (this.shell !== undefined) {
      this.shell.refresh();
    }
  }
}

