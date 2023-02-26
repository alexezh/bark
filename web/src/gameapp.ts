import { Terminal } from "./ui/terminal";
import { fetchFiles, WorldProps } from "./fetchadapter";
import { setTerminal, terminal } from "./ui/igameterminal";
import { createVM } from "./engine/vm";

const demoWorldId = "7fa84179-dc58-4939-8678-03370fd137f3";

// root objects of the application
export class GameApp {
  private gameContainer: any;

  // @ts-ignore
  public get terminal(): Terminal { return this._terminal; }

  public async run() {
    this.tryOnReady();
  }

  public setContainer(gameContainer: HTMLDivElement) {
    window.onresize = () => this.resizeCanvas();

    this.gameContainer = gameContainer;
    this.resizeCanvas();

    setTerminal(new Terminal(gameContainer));
    this.tryOnReady();
  }

  // wait for everything to initialize
  private tryOnReady() {
    if (terminal === undefined) {
      return;
    }

    createVM(this.gameContainer);
  }

  private resizeCanvas() {
    this.gameContainer.style.width = window.innerWidth.toString();
    this.gameContainer.style.height = window.innerHeight.toString();
    if (this.terminal !== undefined) {
      this.terminal.refresh();
    }
  }
}

