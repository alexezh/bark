// @ts-nocheck

import { PRNG } from "./prng";
import { SimplexNoise } from "./Simplex";

export function perlinNoise(
    perilinW: number, perilinH: number,
    baseX: number, baseY: number,
    seed: number): Uint8ClampedArray {

    let rand = new PRNG();

    let data = new Uint8ClampedArray(perilinH * perilinW);

    let simplexH = new SimplexNoise(rand);
    simplexH.setSeed(seed + 2);

    let pos, h;
    let med = 0; let min = 0; let max = 0;
    for (var y = 0; y < perilinH; y++) {
        for (var x = 0; x < perilinW; x++) {
            pos = (x + y * perilinW);

            let h = (simplexH.noise(x / baseX, y / baseY) + 1) * 0.5;
            min = Math.min(h, min);
            max = Math.max(h, max);
            if (h < 0.10 || h > 1) {
                med++;
            }

            data[pos] = Math.floor(h * 255);
        }
    }

    console.log('level' + 0.10 && 'med ' + med + ' ' + min + ' ' + max);

    return data;
};