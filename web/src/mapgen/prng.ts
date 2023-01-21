// @ts-nocheck

// Park-Miller-Carta Pseudo-Random Number Generator
export function PRNG(): any {
  this.seed = 1;
  this.next = function () { return (this.gen() / 2147483647); };
  this.nextRange = function (min, max) { return min + ((max - min) * this.next()) };
  this.gen = function () { return this.seed = (this.seed * 16807) % 2147483647; };
};

