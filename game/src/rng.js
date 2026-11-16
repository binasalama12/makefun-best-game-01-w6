// rng.js — deterministic seeded randomness for Prism Breakout.
// Every random choice in the game flows through one of these generators so a
// given seed always produces the same levels, the same power-up drops and the
// same staged screenshot scenes, byte for byte.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  constructor(seed) {
    this.next = mulberry32(seed);
  }
  float() {
    return this.next();
  }
  range(lo, hi) {
    return lo + this.next() * (hi - lo);
  }
  int(lo, hi) {
    return lo + Math.floor(this.next() * (hi - lo + 1));
  }
  pick(list) {
    return list[Math.floor(this.next() * list.length)];
  }
  chance(p) {
    return this.next() < p;
  }
}

export function seedFromQuery(fallback = 7) {
  const raw = new URLSearchParams(location.search).get('seed');
  const n = raw === null ? NaN : Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}
