import { createButton, createCommandButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";
import { IAction, ICommandLayer } from "./iaction";

export abstract class CommandAction implements IAction {
  abstract get name(): string;
  abstract get tags(): string[];
  private button: HTMLButtonElement | undefined;

  public renderButton(parent: HTMLElement, bar: ICommandLayer) {
    this.button = createCommandButton(parent, this.name, () => {
      bar.closeDetailsPane();
      this.onClick(bar)
    });
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

export class FuncAction extends CommandAction {
  private _name: string;
  private _tags: string[];
  private _func: (ICommandLayer) => void;

  get name(): string { return this._name; }
  get tags(): string[] { return this._tags; }

  public constructor(name: string, tags: string[], func: (ICommandLayer) => void) {
    super();
    this._name = name;
    this._tags = tags;
    this._func = func;
  }

  protected onClick(bar: ICommandLayer) {
    this._func(bar);
  }
}
