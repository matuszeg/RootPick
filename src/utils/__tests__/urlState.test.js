import { describe, it, expect, beforeEach } from 'vitest';
import { encodeToUrl, decodeFromUrl } from '../urlState.js';

function setSearch(qs) {
  // jsdom-style: vitest's default node env has no window. Stub minimally.
  globalThis.window = { location: { search: qs } };
}

describe('encodeToUrl', () => {
  it('encodes core state fields', () => {
    const state = {
      ownedExpansions: new Set(['base', 'riverfolk']),
      playerCount: 4,
      strictMode: false,
      requireBalance: true,
      difficulties: new Set([1, 2, 3]),
      selectedFactions: ['marquise', 'eyrie'],
      lockedFactions: new Set(['marquise']),
      bannedFactions: new Set(),
    };
    const qs = encodeToUrl(state);
    const params = new URLSearchParams(qs);
    expect(params.get('expansions').split(',').sort()).toEqual(['base', 'riverfolk']);
    expect(params.get('players')).toBe('4');
    expect(params.get('balance')).toBe('true');
    expect(params.get('difficulty')).toBe('1,2,3');
    expect(params.get('factions')).toBe('marquise,eyrie');
    expect(params.get('locked')).toBe('marquise');
    expect(params.has('banned')).toBe(false);
  });

  it('omits empty selected/locked/banned sets from the URL', () => {
    const qs = encodeToUrl({
      ownedExpansions: new Set(['base']),
      playerCount: 2,
      strictMode: false,
      requireBalance: false,
      difficulties: new Set([1]),
      selectedFactions: [],
      lockedFactions: new Set(),
      bannedFactions: new Set(),
    });
    const params = new URLSearchParams(qs);
    expect(params.has('factions')).toBe(false);
    expect(params.has('locked')).toBe(false);
    expect(params.has('banned')).toBe(false);
  });
});

describe('decodeFromUrl', () => {
  beforeEach(() => {
    setSearch('');
  });

  it('returns an empty object when no params present', () => {
    expect(decodeFromUrl()).toEqual({});
  });

  it('parses expansions, players, balance, difficulty', () => {
    setSearch('?expansions=base,riverfolk&players=5&balance=true&difficulty=2,3');
    const out = decodeFromUrl();
    expect(out.ownedExpansions).toEqual(new Set(['base', 'riverfolk']));
    expect(out.playerCount).toBe(5);
    expect(out.requireBalance).toBe(true);
    expect(out.difficulties).toEqual(new Set([2, 3]));
  });

  it('rejects out-of-range player counts', () => {
    setSearch('?players=99');
    expect(decodeFromUrl().playerCount).toBeUndefined();
    setSearch('?players=1');
    expect(decodeFromUrl().playerCount).toBeUndefined();
  });

  it('filters difficulty values to 1-3', () => {
    setSearch('?difficulty=1,2,7,99');
    expect(decodeFromUrl().difficulties).toEqual(new Set([1, 2]));
  });

  it('parses locked and banned as Sets', () => {
    setSearch('?locked=marquise,eyrie&banned=alliance');
    const out = decodeFromUrl();
    expect(out.lockedFactions).toEqual(new Set(['marquise', 'eyrie']));
    expect(out.bannedFactions).toEqual(new Set(['alliance']));
  });
});

describe('encodeToUrl → decodeFromUrl round-trip', () => {
  it('preserves all fields it knows about', () => {
    const original = {
      ownedExpansions: new Set(['base', 'underworld']),
      playerCount: 3,
      strictMode: true,
      requireBalance: true,
      difficulties: new Set([1, 3]),
      selectedFactions: ['marquise', 'duchy', 'corvid'],
      lockedFactions: new Set(['marquise']),
      bannedFactions: new Set(['eyrie']),
    };
    const qs = encodeToUrl(original);
    setSearch('?' + qs);
    const out = decodeFromUrl();
    expect(out.ownedExpansions).toEqual(original.ownedExpansions);
    expect(out.playerCount).toBe(original.playerCount);
    expect(out.requireBalance).toBe(original.requireBalance);
    expect(out.difficulties).toEqual(original.difficulties);
    expect(out.selectedFactions).toEqual(original.selectedFactions);
    expect(out.lockedFactions).toEqual(original.lockedFactions);
    expect(out.bannedFactions).toEqual(original.bannedFactions);
  });
});
