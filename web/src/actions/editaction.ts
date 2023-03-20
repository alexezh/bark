import { IAction } from "../ui/iaction";

// display list of blocks, selects block as current
export class SelectBlockAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] {
    throw new Error("Method not implemented.");
  }
  renderButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroyButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }

}

export class EditMapAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['level', 'edit', 'map'] }
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
  get tags(): string[] { return ['edit', 'block', 'vox'] }
  renderButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroyButton(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
}