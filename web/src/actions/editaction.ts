import { IAction } from "../ui/iaction";

// display list of blocks, selects block as current
export class SelectBlockAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] {
    throw new Error("Method not implemented.");
  }
  render(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroy(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }

}

export class EditMapAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['level', 'edit', 'map'] }
  render(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroy(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
}

export class EditBlockAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['edit', 'block', 'vox'] }
  render(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroy(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
}

export class EditCodeAction implements IAction {
  get name(): string {
    throw new Error("Method not implemented.");
  }
  get tags(): string[] { return ['edit', 'block', 'vox'] }
  render(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
  destroy(parent: HTMLElement) {
    throw new Error("Method not implemented.");
  }
}