import { createButton, createCommandButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";
import { IAction, ICommandLayer } from "./iaction";

export abstract class CommandAction implements IAction {
  abstract get name(): string;
  abstract get tags(): string[];
  private button: HTMLButtonElement | undefined;

  public renderButton(parent: HTMLElement, bar: ICommandLayer) {
    this.button = createCommandButton(parent, this.name, () => this.onClick(bar));
  }

  public destroyButton(parent: HTMLElement) {
    if (this.button === undefined) {
      return;
    }

    parent.removeChild(this.button);
    this.button = undefined;
  }

  public getChildActions(): Iterable<IAction> {
    return [];
  }

  protected onClick(bar: ICommandLayer) {
  }
}

