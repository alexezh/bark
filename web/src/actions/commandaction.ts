import { createButton, createCommandButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";
import { DetailsPaneKind, IAction, ICommandLayer } from "./iaction";

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

export class FolderAction implements IAction {
  private isExtended: boolean = false;
  //private children: IAction[];

  private readonly _name: string;
  private readonly _tags: string[];
  public get name(): string { return this._name; }
  public get tags(): string[] { return this._tags; };
  private container: HTMLDivElement | undefined;
  private add: HTMLButtonElement | undefined;
  private button: HTMLButtonElement | undefined;
  get element(): HTMLElement | undefined { return this.button }

  public constructor(name: string) {
    this._name = name;
    this._tags = [];
  }

  public renderButton(bar: ICommandLayer): HTMLElement {
    this.container = document.createElement('div');
    this.container.className = 'folderButton';

    this.button = createCommandButton(this.name, () => {
      this.onClick(bar)
    });
    this.button.style.gridColumn = '1';

    this.add = createCommandButton('+', () => {
      this.onAdd(bar)
    });
    this.add.style.gridColumn = '2';

    this.container.appendChild(this.button);
    this.container.appendChild(this.add);

    return this.container;
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

  protected onAdd(bar: ICommandLayer) {
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

/**
 * looks the same as FormAction
 */
export class PaneAction extends BasicAction {
  private _func: (ICommandLayer) => HTMLElement;
  private _opened: boolean = false;
  private _lastElem: HTMLElement | undefined;

  public constructor(name: string, func: (ICommandLayer) => HTMLElement) {
    super(name, { closePane: false });
    this._func = func;
  }

  protected onClick(bar: ICommandLayer) {
    if (this._opened) {
      let lastPane = bar.closeDetailsPane();
      if (lastPane === this._lastElem) {
        this._lastElem = undefined;
        return;
      }
    }

    let elem = this._func(bar);
    bar.openDetailsPane(elem, DetailsPaneKind.Partial);
    this._lastElem = elem;
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