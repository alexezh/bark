import { createMath } from "./mathdef";
import { ModuleCache } from "../modulecache";
import { createSpriteModule, createAppModule } from "./appdef";

export function createSystemModules(): ModuleCache {
  let cache = new ModuleCache();

  cache.registerSystemModule('Vm', createAppModule());
  cache.registerSystemModule('Sprite', createSpriteModule());
  cache.registerSystemModule('Math', createMath());

  return cache;
}