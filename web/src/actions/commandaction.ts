import { createCommandButton } from "../lib/htmlutils";
import { IAction } from "../ui/iaction";

export abstract class CommandAction implements IAction {
  abstract get name(): string;
  abstract get tags(): string[];
  private button: HTMLButtonElement | undefined;

  renderButton(parent: HTMLElement) {
    this.button = createCommandButton(parent, this.name, this.onClick.bind(this));
  }

  destroyButton(parent: HTMLElement) {
    if (this.button === undefined) {
      return;
    }

    parent.removeChild(this.button);
    this.button = undefined;
  }

  protected onClick() {
  }
}
