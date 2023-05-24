import { createButton, createCommandButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";
import { IAction, ICommandLayer } from "./iaction";

export abstract class CommandAction implements IAction {
  abstract get name(): string;
  abstract get tags(): string[];
  private button: HTMLButtonElement | undefined;

  renderButton(parent: HTMLElement, bar: ICommandLayer) {
    this.button = createCommandButton(parent, this.name, () => this.onClick(bar));
  }

  destroyButton(parent: HTMLElement) {
    if (this.button === undefined) {
      return;
    }

    parent.removeChild(this.button);
    this.button = undefined;
  }

  protected onClick(bar: ICommandLayer) {
  }
}

