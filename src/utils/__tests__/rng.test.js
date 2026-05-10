import { describe, it, expect } from 'vitest';
import { mulberry32, shuffle, pickOne } from '../rng.js';

describe('mulberry32', () => {
  it('produces a deterministic sequence for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toEqual(b());
  });

  it('returns floats in [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('shuffle', () => {
  it('preserves elements', () => {
    const rng = mulberry32(1);
    const out = shuffle([1, 2, 3, 4, 5], rng);
    expect(out.slice().sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate input', () => {
    const input = [1, 2, 3];
    shuffle(input, mulberry32(1));
    expect(input).toEqual([1, 2, 3]);
  });

  it('is deterministic with a seeded rng', () => {
    const a = shuffle([1, 2, 3, 4, 5], mulberry32(99));
    const b = shuffle([1, 2, 3, 4, 5], mulberry32(99));
    expect(a).toEqual(b);
  });
});

describe('pickOne', () => {
  it('returns an element from the array', () => {
    const out = pickOne([1, 2, 3], mulberry32(1));
    expect([1, 2, 3]).toContain(out);
  });

  it('returns undefined for empty input', () => {
    expect(pickOne([], mulberry32(1))).toBeUndefined();
  });
});
