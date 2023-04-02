import { Shell } from "./ui/shell";
import { setShell, shell } from "./ui/igameshell";
import { createVM } from "./engine/vm";
import { vm } from "./engine/ivm";
import { BoxedGame } from "./python";
import { setSessionId } from "./lib/fetchadapter";

const demoWorldId = "7fa84179-dc58-4939-8678-03370fd137f3";

/**
 * perforrms basic initialization; not used by other things
 */
export class GameApp {
  private gameContainer: HTMLDivElement | undefined;

  public initializeApp(session: string | undefined, gameContainer: HTMLDivElement) {

    // first set session id
    if (session === undefined) {
      let account = window.localStorage.getItem('account');
      if (account !== null && account !== undefined) {
        session = JSON.parse(account).session;
      }
    }
    if (session === undefined) {
      throw new Error('Not logged in');
    }
    setSessionId(session);

    // now start initialization
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

