import { createMath } from "./mathdef";
import { ModuleCache } from "../modulecache";
import { createSpriteModule, createSystemModule } from "./systemdef";

export function createAllModules(): ModuleCache {
  let cache = new ModuleCache();

  cache.registerSystemModule('Vm', createSystemModule());
  cache.registerSystemModule('Sprite', createSpriteModule());
  cache.registerSystemModule('Math', createMath());

  return cache;
}