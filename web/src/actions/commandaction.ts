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

  public constructor(name: string, params: BasicActionParams) {
    this._name = name;
    this._tags = params.tags ?? [];
    this.closePane = params.closePane ?? true;
  }

  public renderButton(parent: HTMLElement, bar: ICommandLayer) {
    this.button = createCommandButton(parent, this.name, () => {
      if (this.closePane) {
        bar.closeDetailsPane();
      }
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

export class ActionGroup extends BasicAction {
  private isExtended: boolean = false;
  private children: IAction[];

  public constructor(name: string, tags: string[], children: IAction[]) {
    super(name, { tags: tags });
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

export class MenuAction extends BasicAction {
  public constructor(name: string, actions: IAction[]) {
    super(name, {});
    //this._func = func;
  }
}