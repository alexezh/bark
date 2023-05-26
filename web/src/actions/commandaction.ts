import { createButton, createCommandButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";
import { IAction, ICommandLayer } from "./iaction";

export abstract class CommandAction implements IAction {
  private readonly _name: string;
  private readonly _tags: string[];
  public get name(): string { return this._name; }
  public get tags(): string[] { return this._tags; };
  private button: HTMLButtonElement | undefined;

  public constructor(name: string, tags: string[]) {
    this._name = name;
    this._tags = tags;
  }

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

export class ActionGroup extends CommandAction {
  private isExtended: boolean = false;
  private children: IAction[];

  public constructor(name: string, tags: string[], children: IAction[]) {
    super(name, tags);
    this.children = children;
  }

  public getChildActions(): Iterable<IAction> {
    return this.children;
  }

  protected onClick(bar: ICommandLayer) {
    if (this.isExtended) {
      this.isExtended = true;
      bar.openActionGroup(this);
    } else {
      this.isExtended = false;
      bar.closeActionGroup(this);
    }
  }
}

export class FuncAction extends CommandAction {
  private _func: (ICommandLayer) => void;

  public constructor(name: string, tags: string[], func: (ICommandLayer) => void) {
    super(name, tags);
    this._func = func;
  }

  protected onClick(bar: ICommandLayer) {
    this._func(bar);
  }
}
