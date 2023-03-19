export interface IAction {
  get name(): string;
  get tags(): string[];
  render(parent: HTMLElement);
  destroy(parent: HTMLElement);
}
