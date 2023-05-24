import { ICodeLoader } from "../../engine/ivm";
import { createMath } from "./mathdef";
import { createSpriteModule } from "./spritedef";
import { createSystemModule } from "./systemdef";

export function registerSystemModules(loader: ICodeLoader) {
  loader.addSystemModule('System', createSystemModule());
  loader.addSystemModule('Sprite', createSpriteModule());
  loader.addSystemModule('Math', createMath());
}