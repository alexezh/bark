import { IAction } from "../ui/iaction"

export class MoveCameraAction implements IAction {
  get name(): string { return 'MoveCamera' }
  get tags(): string[] { return ['camera', 'edit', 'move'] }
  render(parent: HTMLElement) {
  }
  destroy(parent: HTMLElement) {
  }
}
