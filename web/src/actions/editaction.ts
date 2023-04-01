import { IAction } from "../ui/iaction";

// display list of blocks, selects block as current
export class SelectBlockAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['select', 'vox', 'block'] }

  renderButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroyButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }

}

export class EditLevelAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['level', 'edit', 'level'] }
  renderButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroyButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
}

export class EditBlockAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['edit', 'block', 'vox'] }
  renderButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroyButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
}

export class EditCodeAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['edit', 'code'] }
  renderButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroyButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
}