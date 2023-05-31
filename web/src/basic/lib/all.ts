import { ICodeLoader } from "../../engine/ivm";
import { createMath } from "./mathdef";
import { createSpriteModule } from "./spritedef";
import { createPhysicsModule, createSystemModule } from "./systemdef";

export function registerSystemModules(loader: ICodeLoader) {
  loader.addSystemModule('System', createSystemModule());
  loader.addSystemModule('Physics', createPhysicsModule());
  loader.addSystemModule('Sprite', createSpriteModule());
  loader.addSystemModule('Math', createMath());
}