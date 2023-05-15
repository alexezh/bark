import { ICodeLoader } from "../../engine/ivm";
import { createMath } from "./mathdef";
import { createSpriteModule, createSystemModule } from "./systemdef";

export function registerSystem(loader: ICodeLoader) {
  loader.addSystemModule('Vm', createSystemModule());
  loader.addSystemModule('Sprite', createSpriteModule());
  loader.addSystemModule('Math', createMath());
}