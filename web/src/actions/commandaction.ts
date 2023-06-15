import { createButton, createCommandButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";
import { IAction, ICommandLayer } from "./iaction";

export type BasicActionParams = {
  tags?: string[],
  closePane?: boolean,
}

/**
 * need better names
 * command auto-closes any existing pane
 */
export abstract class BasicAction implements IAction {
  private readonly _name: string;
  private readonly _tags: string[];
  private readonly closePane: boolean;
  public get name(): string { return this._name; }
  public get tags(): string[] { return this._tags; };
  private button: HTMLButtonElement | undefined;
  get element(): HTMLElement | undefined { return this.button }

  public constructor(name: string, params: BasicActionParams) {
    this._name = name;
    this._tags = params.tags ?? [];
    this.closePane = params.closePane ?? true;
  }

  public renderButton(bar: ICommandLayer): HTMLElement {
    this.button = createCommandButton(this.name, () => {
      if (this.closePane) {
        bar.closeDetailsPane();
      }
      this.onClick(bar)
    });

    return this.button;
  }

  public destroyButton() {
    if (this.button === undefined) {
      return;
    }

    this.button = undefined;
  }

  public getChildActions(): Iterable<IAction> {
    return [];
  }

  protected onClick(bar: ICommandLayer) {
  }
}

export class MenuAction extends BasicAction {
  private isExtended: boolean = false;
  private children: IAction[];

  public constructor(name: string, tags: string[], children: IAction[]) {
    super('<' + name, { tags: tags, closePane: false });
    this.children = children;
  }

  public getChildActions(): Iterable<IAction> {
    return this.children;
  }

  protected onClick(bar: ICommandLayer) {
    if (!this.isExtended) {
      this.isExtended = true;
      bar.openMenu(this);
    } else {
      this.isExtended = false;
      bar.closeMenu(this);
    }
  }
}

export class FuncAction extends BasicAction {
  private _func: (ICommandLayer) => void;

  public constructor(name: string, params: BasicActionParams, func: (ICommandLayer) => void) {
    super(name, params);
    this._func = func;
  }

  protected onClick(bar: ICommandLayer) {
    this._func(bar);
  }
}
/*
export class MenuAction extends BasicAction {
  private _actions: IAction[];

  public constructor(name: string, actions: IAction[]) {
    super(name, {});
    this._actions = actions;
  }

  protected onClick(bar: ICommandLayer) {
    this._func(bar);
  }
}
*/