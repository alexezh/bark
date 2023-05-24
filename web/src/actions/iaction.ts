export interface IAction {
  get name(): string;
  get tags(): string[];

  /**
   * create button for an action and attach it to parent
   * this implies that action can be rendered once which is fine for now
   */
  renderButton(parent: HTMLElement, bar: ICommandLayer);

  /**
   * destroy button from an action
   */
  destroyButton(parent: HTMLElement);

  /**
   * return child actions for this action
   */
  getChildActions(): Iterable<IAction>;
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

