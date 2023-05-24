export interface IAction {
  get name(): string;
  get tags(): string[];
  renderButton(parent: HTMLElement, bar: ICommandLayer);
  destroyButton(parent: HTMLElement);
}

export interface ICommandLayer {
  displayError(text: string);
  /**
   * called by an action to display html element in details pane
   * closes current details pane if needed
   */
  openDetailsPane(elem: HTMLElement): void;

  /**
   * close the current details pane
   */
  closeDetailsPane(): void;
}

