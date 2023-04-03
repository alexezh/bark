export interface IAction {
  get name(): string;
  get tags(): string[];
  renderButton(parent: HTMLElement, bar: ICommandBar);
  destroyButton(parent: HTMLElement);
}

export interface ICommandBar {
  displayError(text: string);
  openDetailsPane(elem: HTMLElement): void;
  closeDetailsPane(): void;
}

