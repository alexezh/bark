import { ICodeLoader } from "../../engine/ivm";
import { createThirdPersonControllerModule } from "../../engine/thirdpersoncontroller";
import { createMath } from "./mathdef";
import { createPhysicsModule } from "./physicsdef";
import { createSpriteModule } from "./spritedef";
import { createSystemModule } from "./systemdef";

export function registerSystemModules(loader: ICodeLoader) {
  loader.addSystemModule(createSystemModule());
  loader.addSystemModule(createPhysicsModule());
  loader.addSystemModule(createSpriteModule());
  loader.addSystemModule(createMath());
  loader.addSystemModule(createThirdPersonControllerModule());
}