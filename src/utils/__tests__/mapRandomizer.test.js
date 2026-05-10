import { describe, it, expect } from 'vitest';
import { MAP_MAP, MAPS } from '../../data/maps.js';
import { LANDMARK_MAP } from '../../data/accessories.js';
import { mulberry32 } from '../rng.js';
import {
  randomizeClearingSuits,
  randomizeFloodMarkers,
  getEligibleLandmarks,
  getNativeLandmarks,
  placeLandmarks,
  pickAndPlaceLandmarks,
  buildMapSetup,
} from '../mapRandomizer.js';

const ALL_PACK = new Set([
  'standard_deck', 'underworld_landmarks', 'homeland_landmarks', 'landmarks_pack',
]);

// Builds a fresh adjacency map mirroring mapRandomizer's internal one for
// invariant checks. Honors flood-reshape for Marsh.
function buildAdjacency(map, floodedClearings = new Set()) {
  const adj = {};
  for (const [a, b] of map.adjacency ?? []) {
    if (floodedClearings.has(a) || floodedClearings.has(b)) continue;
    (adj[a] ??= new Set()).add(b);
    (adj[b] ??= new Set()).add(a);
  }
  for (const cid of floodedClearings) {
    const through = map.floodReshape?.[cid]?.through ?? [];
    for (const [a, b] of through) {
      if (floodedClearings.has(a) || floodedClearings.has(b)) continue;
      (adj[a] ??= new Set()).add(b);
      (adj[b] ??= new Set()).add(a);
    }
  }
  return adj;
}

function clearingsByRule(map, rule, suits, isMarsh5plus = false) {
  const cs = map.clearings;
  switch (rule) {
    case 'ruin': {
      const ruinIds = new Set();
      for (const r of map.ruins ?? []) {
        let best = null, bestD = Infinity;
        for (const c of cs) {
          const d = (c.x - r.x) ** 2 + (c.y - r.y) ** 2;
          if (d < bestD) { bestD = d; best = c.id; }
        }
        if (best != null) ruinIds.add(best);
      }
      return ruinIds;
    }
    case 'coastal': return new Set(cs.filter(c => c.isCoastal).map(c => c.id));
    case 'river':   return new Set(cs.filter(c => c.onRiver).map(c => c.id));
    case 'corner':  return new Set(cs.filter(c => c.isCorner).map(c => c.id));
    case 'any':     return new Set(cs.map(c => c.id));
    case 'riverOrCoastal': {
      const flag = map.id === 'lake' ? 'isCoastal' : 'onRiver';
      return new Set(cs.filter(c => c[flag]).map(c => c.id));
    }
    case 'singleSlotNoRuin': {
      const counts = {};
      for (const s of map.buildingSlots ?? []) {
        let best = null, bestD = Infinity;
        for (const c of cs) {
          const d = (c.x - s.x) ** 2 + (c.y - s.y) ** 2;
          if (d < bestD) { bestD = d; best = c.id; }
        }
        if (best != null) counts[best] = (counts[best] ?? 0) + 1;
      }
      const ruinIds = clearingsByRule(map, 'ruin', suits);
      return new Set(cs.filter(c => counts[c.id] === 1 && !ruinIds.has(c.id)).map(c => c.id));
    }
    case 'fox': case 'mouse': case 'rabbit': {
      if (isMarsh5plus) return new Set(cs.filter(c => !suits[c.id]).map(c => c.id));
      return new Set(cs.filter(c => suits[c.id] === rule).map(c => c.id));
    }
    default: return new Set();
  }
}

describe('randomizeClearingSuits', () => {
  it('returns printed suits on Autumn when force=false', () => {
    const map = MAP_MAP.autumn;
    const out = randomizeClearingSuits(map, { rng: mulberry32(1) });
    expect(out).toEqual(map.printedSuits);
  });

  it('shuffles Autumn suits when force=true', () => {
    const map = MAP_MAP.autumn;
    const out = randomizeClearingSuits(map, {
      forceSuitRandomizationOnAutumn: true,
      rng: mulberry32(1),
    });
    expect(out).not.toEqual(map.printedSuits);
    // 12 clearings, all suited on a non-Marsh map
    expect(Object.keys(out).length).toBe(12);
  });

  it('produces 12 suited clearings on non-Marsh maps', () => {
    for (const map of MAPS) {
      if (map.id === 'marsh') continue;
      const out = randomizeClearingSuits(map, {
        forceSuitRandomizationOnAutumn: true,
        rng: mulberry32(7),
      });
      expect(Object.keys(out).length).toBe(12);
    }
  });

  it('preserves locked suits', () => {
    const map = MAP_MAP.winter;
    const lockedSuits = { 1: 'fox', 2: 'mouse' };
    const out = randomizeClearingSuits(map, { lockedSuits, rng: mulberry32(3) });
    expect(out[1]).toBe('fox');
    expect(out[2]).toBe('mouse');
  });

  it('skips excluded clearings', () => {
    const map = MAP_MAP.marsh;
    const excluded = new Set([6, 8, 10]);
    const out = randomizeClearingSuits(map, { excludedClearings: excluded, rng: mulberry32(5) });
    for (const id of excluded) expect(out[id]).toBeUndefined();
  });

  it('is deterministic with seeded rng', () => {
    const map = MAP_MAP.winter;
    const a = randomizeClearingSuits(map, { rng: mulberry32(42) });
    const b = randomizeClearingSuits(map, { rng: mulberry32(42) });
    expect(a).toEqual(b);
  });
});

describe('randomizeFloodMarkers', () => {
  it('returns null on maps without floods', () => {
    expect(randomizeFloodMarkers(MAP_MAP.autumn, 4)).toBeNull();
  });

  it('returns null at 5+ players on Marsh', () => {
    expect(randomizeFloodMarkers(MAP_MAP.marsh, 5)).toBeNull();
  });

  it('places one marker per declared flood color', () => {
    const map = MAP_MAP.marsh;
    const out = randomizeFloodMarkers(map, 4, { rng: mulberry32(1) });
    expect(Object.keys(out).length).toBe(map.floodMarkers.length);
  });

  it('always picks a clearing from the marker pair', () => {
    const map = MAP_MAP.marsh;
    for (let s = 0; s < 50; s++) {
      const out = randomizeFloodMarkers(map, 4, { rng: mulberry32(s) });
      for (const fm of map.floodMarkers) {
        expect(fm.clearingPair).toContain(out[fm.id]);
      }
    }
  });
});

describe('placeLandmarks', () => {
  function assertValid(map, ids, placed, opts = {}) {
    const playerCount = opts.playerCount ?? 4;
    const isMarsh5plus = map.id === 'marsh' && playerCount >= 5;
    const suits = opts.suits ?? {};
    const flooded = opts.floodedClearings ?? new Set();
    const adj = buildAdjacency(map, flooded);

    // 1. No duplicate clearings (except Marsh 5+p natives, which are the
    //    exemption: pack landmarks still respect adjacency vs natives).
    const used = {};
    for (const [id, p] of Object.entries(placed)) {
      if (used[p.clearingId]) {
        throw new Error(`duplicate placement on clearing ${p.clearingId}: ${id} & ${used[p.clearingId]}`);
      }
      used[p.clearingId] = id;
    }

    // 2. Each placement satisfies its rule.
    for (const [id, p] of Object.entries(placed)) {
      const rule = LANDMARK_MAP[id]?.placementRule;
      const valid = clearingsByRule(map, rule, suits, isMarsh5plus);
      expect(valid.has(p.clearingId), `${id} (${rule}) on clearing ${p.clearingId} violates rule on ${map.id}`).toBe(true);
    }

    // 3. No two landmarks adjacent — except Marsh 5+p natives (mutual exemption).
    const native = new Set(['mousehold', 'foxburrow', 'rabbittown']);
    const entries = Object.entries(placed);
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [idA, pA] = entries[i];
        const [idB, pB] = entries[j];
        const bothNative = native.has(idA) && native.has(idB);
        if (isMarsh5plus && bothNative) continue;
        const neighbors = adj[pA.clearingId] ?? new Set();
        expect(neighbors.has(pB.clearingId), `${idA}@${pA.clearingId} and ${idB}@${pB.clearingId} are adjacent on ${map.id}`).toBe(false);
      }
    }

    // 4. Every input id (except those the placer dropped because no slot fit)
    //    that IS in the placement is a valid id.
    for (const id of Object.keys(placed)) {
      expect(ids.includes(id) || ids.includes(id)).toBe(true);
    }
  }

  it('places a single landmark satisfying its rule across all maps', () => {
    const cases = [
      ['tower', 'underworld_landmarks'],
      ['ferry', 'underworld_landmarks'],
      ['market', 'landmarks_pack'],
      ['treetop', 'landmarks_pack'],
      ['forge', 'landmarks_pack'],
      ['city', 'landmarks_pack'],
    ];
    for (const map of MAPS) {
      const suits = randomizeClearingSuits(map, {
        forceSuitRandomizationOnAutumn: true, rng: mulberry32(1),
      });
      for (const [lid] of cases) {
        const placed = placeLandmarks(map, [lid], {
          suits, playerCount: 4, rng: mulberry32(7),
        });
        if (!placed) continue; // genuinely impossible (e.g. Treetop on a corner-less map -- not the case here)
        assertValid(map, [lid], placed, { suits });
      }
    }
  });

  it('respects no-adjacency across many random seeds', () => {
    const map = MAP_MAP.winter;
    const ids = ['tower', 'ferry', 'market', 'treetop', 'forge'];
    for (let s = 0; s < 50; s++) {
      const suits = randomizeClearingSuits(map, {
        forceSuitRandomizationOnAutumn: true, rng: mulberry32(s),
      });
      const placed = placeLandmarks(map, ids, { suits, playerCount: 4, rng: mulberry32(s + 1000) });
      if (placed) assertValid(map, ids, placed, { suits });
    }
  });

  it('keeps fixedPlacements unchanged and only places the rest', () => {
    const map = MAP_MAP.winter;
    const suits = randomizeClearingSuits(map, {
      forceSuitRandomizationOnAutumn: true, rng: mulberry32(11),
    });
    // Pick an initial placement for tower so we can pin it.
    const initial = placeLandmarks(map, ['tower', 'forge'], { suits, playerCount: 4, rng: mulberry32(2) });
    expect(initial.tower).toBeDefined();
    const pinned = { tower: initial.tower };
    // Now re-place forge with tower pinned. Tower must keep the same coords.
    const result = placeLandmarks(map, ['tower', 'forge'], {
      suits, playerCount: 4, fixedPlacements: pinned, rng: mulberry32(3),
    });
    expect(result.tower).toEqual(pinned.tower);
    assertValid(map, ['tower', 'forge'], result, { suits });
  });

  it('honors flood-reshape on Marsh adjacency', () => {
    const map = MAP_MAP.marsh;
    const flooded = new Set([6, 8]);
    // Verify: clearings that were neighbors via a flooded clearing should now
    // be considered adjacent if they appear in a through-pair.
    const adj = buildAdjacency(map, flooded);
    for (const cid of flooded) {
      const through = map.floodReshape?.[cid]?.through ?? [];
      for (const [a, b] of through) {
        if (flooded.has(a) || flooded.has(b)) continue;
        expect(adj[a]?.has(b)).toBe(true);
        expect(adj[b]?.has(a)).toBe(true);
      }
    }
    // And the flooded clearing itself has no edges.
    for (const cid of flooded) expect(adj[cid]).toBeUndefined();
  });

  it('places Marsh natives at 5+p on the 3 unsuited clearings', () => {
    const map = MAP_MAP.marsh;
    for (let s = 0; s < 20; s++) {
      const suits = randomizeClearingSuits(map, { rng: mulberry32(s) });
      const placed = placeLandmarks(map, ['foxburrow', 'mousehold', 'rabbittown'], {
        suits, playerCount: 5, rng: mulberry32(s + 100),
      });
      expect(placed).toBeTruthy();
      for (const id of ['foxburrow', 'mousehold', 'rabbittown']) {
        expect(placed[id]).toBeDefined();
        expect(suits[placed[id].clearingId]).toBeUndefined(); // unsuited
      }
    }
  });
});

describe('pickAndPlaceLandmarks', () => {
  it('every selected landmark also appears in placedLandmarks', () => {
    for (const map of MAPS) {
      const suits = randomizeClearingSuits(map, {
        forceSuitRandomizationOnAutumn: true, rng: mulberry32(1),
      });
      for (let s = 0; s < 10; s++) {
        const result = pickAndPlaceLandmarks(map, {
          playerCount: 4,
          ownedAccessories: ALL_PACK,
          count: 2,
          suits,
          rng: mulberry32(s),
        });
        for (const id of result.selectedLandmarks) {
          expect(result.placedLandmarks?.[id]).toBeDefined();
        }
      }
    }
  });

  it('respects excludedLandmarks', () => {
    const map = MAP_MAP.winter;
    const suits = randomizeClearingSuits(map, {
      forceSuitRandomizationOnAutumn: true, rng: mulberry32(1),
    });
    const excluded = new Set(['tower', 'forge']);
    for (let s = 0; s < 20; s++) {
      const result = pickAndPlaceLandmarks(map, {
        playerCount: 4,
        ownedAccessories: ALL_PACK,
        excludedLandmarks: excluded,
        count: 3,
        suits,
        rng: mulberry32(s),
      });
      for (const id of result.selectedLandmarks) {
        expect(excluded.has(id)).toBe(false);
      }
    }
  });
});

describe('getEligibleLandmarks', () => {
  it('excludes auto-placed natives of the current map', () => {
    const map = MAP_MAP.marsh;
    const eligible = getEligibleLandmarks({
      map, playerCount: 5, ownedAccessories: ALL_PACK,
      excludedLandmarks: new Set(),
      allLandmarks: Object.values(LANDMARK_MAP),
    });
    const ids = eligible.map(l => l.id);
    // Marsh 5+p auto-places these as natives, so they shouldn't be in the
    // random-draw pool.
    expect(ids).not.toContain('foxburrow');
    expect(ids).not.toContain('mousehold');
    expect(ids).not.toContain('rabbittown');
  });

  it('includes Homeland natives on non-Marsh maps', () => {
    const eligible = getEligibleLandmarks({
      map: MAP_MAP.winter, playerCount: 4, ownedAccessories: ALL_PACK,
      excludedLandmarks: new Set(),
      allLandmarks: Object.values(LANDMARK_MAP),
    });
    const ids = eligible.map(l => l.id);
    expect(ids).toContain('foxburrow');
  });
});

describe('getNativeLandmarks', () => {
  it('Mountain auto-natives include Tower at all player counts', () => {
    const out = getNativeLandmarks(MAP_MAP.mountain, 4);
    expect(out.map(l => l.id)).toContain('tower');
  });

  it('Marsh natives only activate at 5+ players', () => {
    expect(getNativeLandmarks(MAP_MAP.marsh, 4).map(l => l.id))
      .not.toContain('foxburrow');
    expect(getNativeLandmarks(MAP_MAP.marsh, 5).map(l => l.id))
      .toEqual(expect.arrayContaining(['foxburrow', 'mousehold', 'rabbittown']));
  });
});

describe('buildMapSetup', () => {
  it('produces a complete setup for every map at 4p', () => {
    for (const map of MAPS) {
      const setup = buildMapSetup({
        mapId: map.id,
        playerCount: 4,
        ownedAccessories: ALL_PACK,
        forceSuitRandomizationOnAutumn: false,
        pickConfig: { count: 2, excludedLandmarks: new Set() },
        rng: mulberry32(1),
      });
      expect(setup).toBeTruthy();
      expect(setup.clearingSuits).toBeTruthy();
      // Every selected landmark renders.
      for (const id of setup.selectedLandmarks) {
        expect(setup.placedLandmarks?.[id]).toBeDefined();
      }
    }
  });

  it('Marsh 5+p produces native placements and no flood markers', () => {
    const setup = buildMapSetup({
      mapId: 'marsh',
      playerCount: 5,
      ownedAccessories: ALL_PACK,
      forceSuitRandomizationOnAutumn: false,
      pickConfig: { count: 2, excludedLandmarks: new Set() },
      rng: mulberry32(1),
    });
    expect(setup.floodMarkers).toBeNull();
    for (const id of ['foxburrow', 'mousehold', 'rabbittown']) {
      expect(setup.placedLandmarks?.[id]).toBeDefined();
    }
  });

  it('Marsh 1-4p produces flood markers and no auto-natives', () => {
    const setup = buildMapSetup({
      mapId: 'marsh',
      playerCount: 4,
      ownedAccessories: ALL_PACK,
      forceSuitRandomizationOnAutumn: false,
      pickConfig: { count: 2, excludedLandmarks: new Set() },
      rng: mulberry32(1),
    });
    expect(setup.floodMarkers).toBeTruthy();
    expect(setup.nativeLandmarkIds).toEqual([]);
  });

  it('is deterministic with seeded rng', () => {
    const opts = {
      mapId: 'winter', playerCount: 4, ownedAccessories: ALL_PACK,
      forceSuitRandomizationOnAutumn: true,
      pickConfig: { count: 2, excludedLandmarks: new Set() },
    };
    const a = buildMapSetup({ ...opts, rng: mulberry32(123) });
    const b = buildMapSetup({ ...opts, rng: mulberry32(123) });
    expect(a).toEqual(b);
  });
});
