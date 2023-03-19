export interface IAction {
  get name(): string;
  render(parent: HTMLElement);
  destroy(parent: HTMLElement);
}
