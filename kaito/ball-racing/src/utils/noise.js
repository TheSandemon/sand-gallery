import { createNoise2D } from 'simplex-noise';

let noise2D = null;

export function initNoise(seed = Math.random()) {
  noise2D = createNoise2D(() => seed);
  return noise2D;
}

export function getNoise() {
  if (!noise2D) {
    noise2D = initNoise();
  }
  return noise2D;
}

export function noise(x, y = 0) {
  return getNoise()(x, y);
}

// Seeded random for track generation
export function createSeededRandom(seed) {
  let s = seed;
  return () => {
    s = Math.sin(s * 9999) * 10000;
    return s - Math.floor(s);
  };
}
