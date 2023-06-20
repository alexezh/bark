import { CommandBarProps } from "./commandlayer";
import { IAction, ICommandLayer, IMenuAction } from "./iaction";

/**
 * scrollable list of commands
 */
export class CommandList {
  private navStack: Array<IAction[]> = new Array<IAction[]>();
  private renderedActions: IAction[] | undefined;
  private props: CommandBarProps;
  private wrapperDiv: HTMLDivElement | undefined;
  private listDiv: HTMLDivElement | undefined;
  private opened: boolean = false;
  private readonly layer: ICommandLayer;

  public get isOpened(): boolean { return this.opened; };
  public get navStackDepth(): number { return this.navStack.length; }

  public constructor(props: CommandBarProps, layer: ICommandLayer) {
    this.props = props;
    this.layer = layer;

    // make list of possible actions
    //this.navStack.push(getTopLevelActions());
  }

  public open(parent: HTMLElement) {
    this.opened = true;

    this.wrapperDiv = document.createElement('div');
    this.wrapperDiv.style.gridColumn = '1';
    this.wrapperDiv.style.gridRow = '2';

    this.listDiv = document.createElement('div');
    this.listDiv.className = 'commandList';
    this.wrapperDiv.appendChild(this.listDiv);
    parent.appendChild(this.wrapperDiv);
    this.updateListSize();
    this.renderList();
  }

  public close(parent: HTMLElement) {
    if (!this.opened) {
      return false;
    }

    parent.removeChild(this.listDiv!);
    this.opened = false;
  }

  public pushActions(actions: IAction[]) {
    this.navStack.push(actions);
    this.renderList();
  }

  public loadActions(actions: IAction[]) {
    this.navStack.length = 0;
    this.navStack.push(actions);
    this.renderList();
  }

  public popActions() {
    this.navStack.pop();
    this.renderList();
  }

  public openMenu(group: IMenuAction) {
    let idx = this.renderedActions?.findIndex((x) => x === group);
    if (idx === -1 || idx === undefined) {
      console.warn('openMenu: cannot find group');
      return;
    }


    for (let item of group.getChildActions()) {
      let elem = item.renderButton(this.layer);
      if (idx + 1 === this.renderedActions?.length) {
        this.listDiv!.appendChild(elem);
        this.renderedActions!.push(item);
      } else {
        this.listDiv!.insertBefore(elem, this.renderedActions![idx + 1].element!);
        this.renderedActions!.splice(idx + 1, 0, item);
      }
      idx = idx + 1;
    }
  }

  public closeMenu(group: IMenuAction) {
  }

  private renderList() {
    if (this.renderedActions) {
      this.listDiv!.replaceChildren();
      for (let a of this.renderedActions) {
        a.destroyButton();
      }
    }

    if (this.navStack.length === 0) {
      return;
    }

    let actions = this.navStack[this.navStack.length - 1];
    for (let a of actions) {
      let elem = a.renderButton(this.layer);
      this.listDiv!.appendChild(elem);
    }
    this.renderedActions = actions;
  }

  private updateListSize() {
    if (this.listDiv === undefined) {
      return;
    }
    this.listDiv.style.left = '0';
    if (this.props.w !== 0) {
      this.listDiv.style.width = this.props.w.toString();
    }
  }
}
