import { createButton, createCommandButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";
import { DetailsPaneKind, IAction, ICommandLayer } from "./iaction";

export class FormPane {
  public readonly element: HTMLDivElement;
  private _values: { [id: string]: any } = {};

  public get values() { return this._values; }

  public constructor() {
    this.element = document.createElement('div');
    this.element.className = 'commandPane';
  }

  public addTextField(name: string, value: string, setter: ((val: string) => void) | undefined = undefined) {
    this._values[name] = value;
    createTextEntry(this.element, name + ':', value, (value: string) => {
      this._values[name] = value;
      if (setter !== undefined) {
        setter(value);
      }
    });
  }

  public addIntField(name: string, value: number, setter: ((val: number) => void) | undefined = undefined) {
    this._values[name] = value;
    createNumberEntry(this.element, name + ':', value, (value: number) => {
      this._values[name] = value;
      if (setter !== undefined) {
        setter(value);
      }
    });
  }

  public addButtom(name: string, action: () => void) {
    createButton(this.element, 'nes-btn is-primary', name, action);
  }
}

export abstract class FormAction implements IAction {
  private button: HTMLButtonElement | undefined;
  private propPage: HTMLDivElement | undefined;
  private _name: string;
  private _tags: string[];

  get name(): string { return this._name }
  get tags(): string[] { return this._tags }

  public constructor(name: string, tags: string[]) {
    this._name = name;
    this._tags = tags;
  }

  renderButton(parent: HTMLElement, bar: ICommandLayer) {
    this.button = createCommandButton(parent, this.name, () => {
      this.onClick(bar)
    });
  }

  destroyButton(parent: HTMLElement) {
    if (this.button === undefined) {
      return;
    }

    parent.removeChild(this.button);
    this.button = undefined;
  }

  public getChildActions(): Iterable<IAction> {
    return [];
  }

  private onClick(cl: ICommandLayer) {
    cl.closeDetailsPane();
    let form = this.createForm(cl);

    cl.openDetailsPane(form.element, DetailsPaneKind.Partial);
  }

  protected abstract createForm(cl: ICommandLayer): FormPane;
}