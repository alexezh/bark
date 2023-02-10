import { Terminal } from "./ui/terminal";
import { createGameState, GameState } from "./world/gamestate";
import { resourceLib } from "./graphics/resourceLib";
import { fetchFiles, WorldProps } from "./fetchadapter";
import { setTerminal, terminal } from "./ui/igameterminal";
import { IGameState } from "./world/igamestate";

const demoWorldId = "7fa84179-dc58-4939-8678-03370fd137f3";

// root objects of the application
export class GameApp {
  private worldId: string;
  private gameContainer: any;
  private worldProps?: WorldProps;
  public state?: IGameState;

  // @ts-ignore
  public get terminal(): Terminal { return this._terminal; }

  public constructor() {
    this.worldId = demoWorldId;
  }

  public async run() {
    this.worldProps = await fetchFiles(this.worldId);

    this.state = createGameState();

    await resourceLib.load(this.worldId);
    await this.state.load();

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
    if (terminal === undefined || this.state === undefined || this.state.onLoaded == false) {
      return;
    }

    terminal.setGameMap(this.state.map!);
  }

  private resizeCanvas() {
    this.gameContainer.style.width = window.innerWidth.toString();
    this.gameContainer.style.height = window.innerHeight.toString();
    if (this.terminal !== undefined) {
      this.terminal.refresh();
    }
  }
}

