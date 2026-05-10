// Seedable random utilities. The placement engine and reroll handlers
// accept an optional `rng()` (returns a float in [0, 1) like Math.random)
// so tests can drive deterministic outcomes; production code passes nothing
// and falls through to Math.random.

// mulberry32: small, fast, good-enough PRNG for game-setup randomization.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Default rng — wraps Math.random so call sites can take an injected rng
// without special-casing the production path.
export const defaultRng = () => Math.random();

// Helpers parameterized over an rng function. All shuffle/pick utilities in
// the codebase route through these so a single injection point flips
// determinism on/off.
export function pickOne(arr, rng = defaultRng) {
  if (!arr?.length) return undefined;
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle(arr, rng = defaultRng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function shuffleInPlace(arr, rng = defaultRng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
