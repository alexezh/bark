import { createButton, createNumberEntry, createTextEntry } from "../lib/htmlutils";

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
    createButton(this.element, name, action);
  }
}