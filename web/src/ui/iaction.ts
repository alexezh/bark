export interface IAction {
  get name(): string;
  get tags(): string[];
  renderButton(parent: HTMLElement);
  destroyButton(parent: HTMLElement);
}
