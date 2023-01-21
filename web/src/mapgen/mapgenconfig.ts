export function getIslandGenerationConfig() {
  let config = {
    landName: 'Lori',
    cityNames: 'Japanese',
    genType: 'Islands',
    // 0 - 3
    rivers: 1,
    // 0 - 3
    mountains: 1,
    cities: 0.4,
    // 1 - 4
    forests: 1,
    // 0 - 3
    beaches: 1,
    // 1-11
    generationSpeed: 8,
    sprawlingRivers: true,
    wDecorations: false,
    lDecorations: false,
    ribbon: false,
    worldSteps: 70,
    detailSteps: 35,
  }
  return config;
}

// @ts-ignore
export function getChance(max, isLower) {
  let value = Math.floor(Math.random() * max);
  return value >= isLower ? false : true;
}
