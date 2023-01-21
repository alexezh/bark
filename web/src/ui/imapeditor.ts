import { KeyBinder, MEvent } from "./keybinder";
import { Container as PixiContainer } from 'pixijs';

export interface IMapEditor {
  attach(container: PixiContainer, input: KeyBinder): void;
  detach(): void;
  onMouseDown(evt: MEvent): boolean;
  onMouseUp(evt: MEvent): boolean;
  onMouseMove(evt: MEvent): boolean;
}

