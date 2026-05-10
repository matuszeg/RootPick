import { describe, it, expect } from 'vitest';
import { generateCombination, getReachThreshold, computeReach } from '../randomizer.js';
import { FACTION_MAP, REACH_MINIMUMS } from '../../data/factions.js';

const ALL_EXPANSIONS = new Set([
  'base', 'riverfolk', 'underworld', 'marauder', 'homeland', 'clockwork', 'clockwork2',
]);
const ALL_DIFFICULTIES = new Set([1, 2, 3]);

function baseOpts(overrides = {}) {
  return {
    playerCount: 4,
    botCount: 0,
    ownedExpansions: ALL_EXPANSIONS,
    bannedFactions: new Set(),
    lockedFactionIds: [],
    balanceMode: 'balanced',
    requireBalance: false,
    difficulties: ALL_DIFFICULTIES,
    allowedExclusions: new Set(),
    ...overrides,
  };
}

describe('getReachThreshold', () => {
  it('returns 0 for chaos mode', () => {
    expect(getReachThreshold('chaos', 4)).toBe(0);
  });

  it('returns 17 for standard mode regardless of player count', () => {
    expect(getReachThreshold('standard', 2)).toBe(17);
    expect(getReachThreshold('standard', 6)).toBe(17);
  });

  it('uses official minimums in balanced mode', () => {
    for (const n of [2, 3, 4, 5, 6]) {
      expect(getReachThreshold('balanced', n)).toBe(REACH_MINIMUMS[n]);
    }
  });
});

describe('computeReach', () => {
  it('sums faction reach values', () => {
    // marquise(10) + eyrie(7) = 17
    expect(computeReach(['marquise', 'eyrie'])).toBe(
      FACTION_MAP.marquise.reach + FACTION_MAP.eyrie.reach,
    );
  });

  it('ignores unknown ids', () => {
    expect(computeReach(['marquise', 'nope'])).toBe(FACTION_MAP.marquise.reach);
  });
});

describe('generateCombination — invariants', () => {
  it('produces playerCount factions for human-only games', () => {
    for (let s = 0; s < 30; s++) {
      const r = generateCombination(baseOpts());
      expect(r.error).toBeUndefined();
      expect(r.factions.length).toBe(4);
    }
  });

  it('produces playerCount + botCount factions for mixed games', () => {
    for (let s = 0; s < 30; s++) {
      const r = generateCombination(baseOpts({ playerCount: 3, botCount: 2 }));
      expect(r.error).toBeUndefined();
      expect(r.factions.length).toBe(5);
    }
  });

  it('never returns banned factions', () => {
    const banned = new Set(['marquise', 'eyrie', 'alliance']);
    for (let s = 0; s < 30; s++) {
      const r = generateCombination(baseOpts({ bannedFactions: banned }));
      if (r.error) continue;
      for (const id of r.factions) expect(banned.has(id)).toBe(false);
    }
  });

  it('respects locked factions', () => {
    const locked = ['marquise'];
    for (let s = 0; s < 30; s++) {
      const r = generateCombination(baseOpts({ lockedFactionIds: locked }));
      expect(r.error).toBeUndefined();
      expect(r.factions).toContain('marquise');
    }
  });

  it('does not produce mutually-excluding pairs (vagabond + knaves)', () => {
    for (let s = 0; s < 50; s++) {
      const r = generateCombination(baseOpts());
      if (r.error) continue;
      const has = id => r.factions.includes(id);
      const vagabondPlusKnaves =
        (has('vagabond1') || has('vagabond2')) && has('knaves');
      expect(vagabondPlusKnaves).toBe(false);
    }
  });

  it('does not place a bot alongside its human equivalent', () => {
    for (let s = 0; s < 50; s++) {
      const r = generateCombination(baseOpts({ playerCount: 2, botCount: 2 }));
      if (r.error) continue;
      for (const id of r.factions) {
        const f = FACTION_MAP[id];
        if (f?.automatesId) {
          expect(r.factions).not.toContain(f.automatesId);
        }
      }
    }
  });

  it('meets reach threshold in balanced mode', () => {
    for (let s = 0; s < 50; s++) {
      const r = generateCombination(baseOpts());
      if (r.error) continue;
      const reach = computeReach(r.factions);
      expect(reach).toBeGreaterThanOrEqual(REACH_MINIMUMS[4]);
    }
  });

  it('meets a flat 17 reach in standard mode', () => {
    for (let s = 0; s < 50; s++) {
      const r = generateCombination(baseOpts({ balanceMode: 'standard' }));
      if (r.error) continue;
      expect(computeReach(r.factions)).toBeGreaterThanOrEqual(17);
    }
  });

  it('honors customMinReach / customMaxReach', () => {
    for (let s = 0; s < 30; s++) {
      const r = generateCombination(baseOpts({
        balanceMode: 'chaos',
        customMinReach: 25,
        customMaxReach: 32,
      }));
      if (r.error) continue;
      const reach = computeReach(r.factions);
      expect(reach).toBeGreaterThanOrEqual(25);
      expect(reach).toBeLessThanOrEqual(32);
    }
  });

  it('requireBalance produces at least one militant and one insurgent', () => {
    for (let s = 0; s < 50; s++) {
      const r = generateCombination(baseOpts({ requireBalance: true }));
      if (r.error) continue;
      const types = new Set(r.factions.map(id => FACTION_MAP[id].type));
      expect(types.has('militant')).toBe(true);
      expect(types.has('insurgent')).toBe(true);
    }
  });

  it('errors when locked count exceeds slots', () => {
    const r = generateCombination(baseOpts({
      playerCount: 2,
      lockedFactionIds: ['marquise', 'eyrie', 'alliance'],
    }));
    expect(r.error).toBeDefined();
  });

  it('respects difficulty filter (only difficulty 1 factions)', () => {
    const r = generateCombination(baseOpts({
      playerCount: 2,
      difficulties: new Set([1]),
      balanceMode: 'chaos', // relax reach so a 2p easy pool can succeed
    }));
    if (!r.error) {
      for (const id of r.factions) {
        if (!FACTION_MAP[id].isBot) expect(FACTION_MAP[id].difficulty).toBe(1);
      }
    }
  });

  it('only draws from owned expansions', () => {
    for (let s = 0; s < 30; s++) {
      const r = generateCombination(baseOpts({
        ownedExpansions: new Set(['base']),
        balanceMode: 'chaos',
      }));
      if (r.error) continue;
      for (const id of r.factions) {
        expect(FACTION_MAP[id].expansion).toBe('base');
      }
    }
  });

  it('allowedExclusions overrides specific exclusion pairs', () => {
    // Allow Knaves + Vagabond. With chaos mode and only 2 players we can
    // sometimes get the pair when both are pinned.
    const r = generateCombination(baseOpts({
      playerCount: 2,
      lockedFactionIds: ['knaves', 'vagabond1'],
      balanceMode: 'chaos',
      ownedExpansions: ALL_EXPANSIONS,
      allowedExclusions: new Set(['knaves+vagabond1']),
    }));
    expect(r.error).toBeUndefined();
    expect(r.factions).toEqual(expect.arrayContaining(['knaves', 'vagabond1']));
  });
});
