export interface IAction {
  get name(): string;
  get tags(): string[];
  get element(): HTMLElement | undefined;

  /**
   * create button for an action and attach it to parent
   * this implies that action can be rendered once which is fine for now
   */
  renderButton(bar: ICommandLayer): HTMLElement;

  /**
   * destroy button from an action
   */
  destroyButton();

  /**
   * return child actions for this action
   */
  getChildActions(): Iterable<IAction>;
}

export enum DetailsPaneKind {
  Partial,
  Full,
}

export interface IMenuAction extends IAction {
  getChildActions(): Iterable<IAction>;
}

export interface ICommandLayer {
  displayError(text: string);
  /**
   * called by an action to display html element in details pane
   * closes current details pane if needed
   */
  openDetailsPane(elem: HTMLElement, kind: DetailsPaneKind): void;

  /**
   * close the current details pane
   */
  closeDetailsPane(): HTMLElement | undefined;

  pushActions(actions: IAction[]);
  openMenu(group: IAction);
  closeMenu(group: IAction);
}

