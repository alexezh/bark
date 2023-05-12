import { createMath } from "./mathdef";
import { ModuleCache } from "../modulecache";
import { createSpriteModule, createVmModule } from "./vmdef";

export function createSystemModules(): ModuleCache {
  let cache = new ModuleCache();

  cache.registerSystemModule('Vm', createVmModule());
  cache.registerSystemModule('Sprite', createSpriteModule());
  cache.registerSystemModule('Math', createMath());

  return cache;
}