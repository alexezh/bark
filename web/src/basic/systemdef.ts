import { createMath } from "./mathdef";
import { ModuleCache } from "./modulecache";
import { createVm } from "./vmdef";

export function createSystemModules(): ModuleCache {
  let cache = new ModuleCache();

  cache.registerSystemModule('Vm', createVm());
  cache.registerSystemModule('Math', createMath());

  return cache;
}