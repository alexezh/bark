import { Shell } from "./ui/shell";
import { setShell, shell } from "./ui/igameshell";
import { createVM } from "./engine/vm";
import { vm } from "./engine/ivm";
import { BoxedGame } from "./python";

const demoWorldId = "7fa84179-dc58-4939-8678-03370fd137f3";

/**
 * perforrms basic initialization; not used by other things
 */
export class GameApp {
  private gameContainer: HTMLDivElement | undefined;

  public initializeApp(gameContainer: HTMLDivElement) {
    window.onresize = () => this.resizeCanvas();

    this.gameContainer = gameContainer;
    this.resizeCanvas();

    createVM(gameContainer);

    setShell(new Shell(gameContainer));

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
    if (shell !== undefined) {
      shell.refresh();
    }
  }
}

