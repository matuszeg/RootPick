import { CLEARING_SUIT_POOL, MAP_MAP } from '../data/maps.js';
import { LANDMARK_MAP, LANDMARKS } from '../data/accessories.js';
import { defaultRng, pickOne, shuffle, shuffleInPlace } from './rng.js';

// Returns the ID of the clearing whose center is closest to the given % point.
// Used to map authored ruin / building-slot positions back to their owning
// clearing without redundantly storing the relationship.
export function nearestClearingId(map, x, y) {
  if (!map?.clearings?.length) return null;
  let bestId = null;
  let bestDist = Infinity;
  for (const c of map.clearings) {
    const dx = c.x - x;
    const dy = c.y - y;
    const d = dx * dx + dy * dy;
    if (d < bestDist) { bestDist = d; bestId = c.id; }
  }
  return bestId;
}

// Returns Set<clearingId> of clearings that own at least one ruin.
export function getRuinClearingIds(map) {
  const out = new Set();
  for (const r of map?.ruins ?? []) {
    const id = nearestClearingId(map, r.x, r.y);
    if (id != null) out.add(id);
  }
  return out;
}

// Returns { clearingId: count } — number of building slots owned by each clearing.
export function getBuildingSlotCounts(map) {
  const out = {};
  for (const s of map?.buildingSlots ?? []) {
    const id = nearestClearingId(map, s.x, s.y);
    if (id != null) out[id] = (out[id] ?? 0) + 1;
  }
  return out;
}

// Returns { clearingId: suit } for the (up to 12) clearings that receive a
// suit token. For maps with more clearings than tokens (e.g., Marsh's 15),
// the 12 tokens are placed on a random subset; the remainder become unsuited.
// Autumn returns its printed suits when the override is off.
//
// `lockedSuits` (optional) is a `{ clearingId: suit }` map of clearings whose
// suits should be preserved across re-rolls. Locked entries are kept as-is.
// `excludedClearings` (optional) is a Set of clearing IDs that must NOT
// receive suits (e.g., Marsh clearings already covered by flood markers or
// native landmarks).
export function randomizeClearingSuits(map, {
  forceSuitRandomizationOnAutumn = false,
  lockedSuits = {},
  excludedClearings = new Set(),
  rng = defaultRng,
} = {}) {
  if (!map) return null;
  if (map.hasPrintedSuits && !forceSuitRandomizationOnAutumn) {
    return map.printedSuits ? { ...map.printedSuits } : null;
  }
  const allIds = map.clearings.map(c => c.id);
  const lockedIds = new Set(Object.keys(lockedSuits).map(Number));

  const remainingPool = [...CLEARING_SUIT_POOL];
  for (const suit of Object.values(lockedSuits)) {
    const idx = remainingPool.indexOf(suit);
    if (idx !== -1) remainingPool.splice(idx, 1);
  }

  const eligibleIds = allIds.filter(id => !lockedIds.has(id) && !excludedClearings.has(id));
  const shuffledTokens = shuffle(remainingPool, rng);
  const shuffledEligible = shuffle(eligibleIds, rng);
  const suitedEligible = shuffledEligible.slice(0, shuffledTokens.length);

  const result = { ...lockedSuits };
  suitedEligible.forEach((id, i) => { result[id] = shuffledTokens[i]; });
  return result;
}

// Returns the array of clearing IDs that did NOT receive a suit token.
export function getUnsuitedClearings(map, clearingSuits) {
  if (!map || !clearingSuits) return [];
  const suited = new Set(Object.keys(clearingSuits).map(Number));
  return map.clearings.map(c => c.id).filter(id => !suited.has(id));
}

// Returns the array of native Landmark objects active for the given map+playerCount.
export function getNativeLandmarks(map, playerCount) {
  if (!map || !map.nativeLandmarks) return [];
  return map.nativeLandmarks
    .filter(entry => entry.minPlayers === undefined || playerCount >= entry.minPlayers)
    .map(entry => LANDMARK_MAP[entry.id])
    .filter(Boolean);
}

// Returns the eligible Landmark[] pool for random landmark drawing on a given map.
//
// Auto-placed natives of THIS map (Tower on Mountain, Ferry on Lake,
// Foxburrow/Mousehold/Rabbittown on Marsh 5+p) are excluded so the random
// draw doesn't duplicate the auto-placement. On other maps every landmark
// the user owns is fair game.
export function getEligibleLandmarks({
  map,
  playerCount,
  ownedAccessories,
  excludedLandmarks,
  allLandmarks,
}) {
  if (!map) return [];
  const nativeIds = new Set(
    getNativeLandmarks(map, playerCount).map(l => l.id)
  );
  return allLandmarks.filter(l => {
    if (!ownedAccessories.has(l.source)) return false;
    if (excludedLandmarks.has(l.id)) return false;
    if (nativeIds.has(l.id)) return false;
    return true;
  });
}

// Picks one flood marker per color, randomly choosing between the two
// candidate clearings declared on each marker's `clearingPair`.
// `excludedClearings` (e.g., locked-suit clearings) constrains the choice —
// if one of a pair is excluded, the other is forced.
// Returns null when not applicable (no flood markers, 5+ players, etc.).
export function randomizeFloodMarkers(map, playerCount, { excludedClearings = new Set(), rng = defaultRng } = {}) {
  if (!map || !map.hasFloodMarkers) return null;
  if (playerCount > 4) return null;
  if (!map.floodMarkers?.length) return null;
  const result = {};
  for (const fm of map.floodMarkers) {
    const pair = fm.clearingPair ?? [];
    const eligible = pair.filter(id => !excludedClearings.has(id));
    const pick = pickOne(eligible.length ? eligible : pair, rng);
    if (pick != null) result[fm.id] = pick;
  }
  return Object.keys(result).length ? result : null;
}

// ─── Landmark placement engine ────────────────────────────────────────────
// All landmarks (native + pack) are placed by a single rule-based engine.
// Each landmark carries a `placementRule` (in accessories.js) that determines
// which clearings are valid candidates. A no-adjacency constraint applies to
// every placement — no two landmarks can sit on the same clearing or on
// directly-connected clearings.

// Returns { clearingId: Set<neighborId> } from the map's adjacency edge list.
//
// `floodedClearings` (Marsh-only) reshapes the graph: for each flooded
// clearing, all its original edges are removed (the clearing is gone from
// the playable map), then the corresponding `floodReshape[clearingId].through`
// pairs are added as new direct adjacencies. Any neighbor not in a through-
// pair becomes a flooded path — drawn on the printed board for forest
// separation but not contributing to adjacency.
function adjacencyMap(map, floodedClearings = null) {
  const flooded = floodedClearings instanceof Set
    ? floodedClearings
    : new Set(floodedClearings ?? []);
  const adj = {};
  for (const [a, b] of map?.adjacency ?? []) {
    if (flooded.has(a) || flooded.has(b)) continue;
    (adj[a] ??= new Set()).add(b);
    (adj[b] ??= new Set()).add(a);
  }
  for (const cid of flooded) {
    const through = map?.floodReshape?.[cid]?.through ?? [];
    for (const [a, b] of through) {
      if (flooded.has(a) || flooded.has(b)) continue;
      (adj[a] ??= new Set()).add(b);
      (adj[b] ??= new Set()).add(a);
    }
  }
  return adj;
}

// Returns { clearingId: [{x, y}, ...] } — authored landmark slot positions
// grouped by their nearest clearing.
function landmarkSlotsByClearing(map) {
  const out = {};
  for (const s of map?.landmarkSlots ?? []) {
    const cid = nearestClearingId(map, s.x, s.y);
    if (cid != null) (out[cid] ??= []).push({ x: s.x, y: s.y });
  }
  return out;
}

// Returns the array of render slots for a clearing — authored landmarkSlots
// near it if any, else the clearing's own center as a single fallback slot.
function defaultSlotsForClearing(map, clearing, slotsByClearing) {
  const slots = slotsByClearing[clearing.id];
  if (slots?.length) return slots;
  return [{ x: clearing.x, y: clearing.y }];
}

// Returns the candidate { clearingId, slots } list for a given placement rule.
// `ctx` carries the runtime state (suits, playerCount-derived flags).
function clearingsForRule(rule, map, ctx) {
  const clearings = map.clearings ?? [];
  const slotsByClearing = landmarkSlotsByClearing(map);

  switch (rule) {
    case 'ruin': {
      // Group all ruin entries (labeled or not) by owning clearing.
      // Tower picks the actual ruin coordinate (not the clearing center).
      const byClearing = {};
      for (const r of map.ruins ?? []) {
        const cid = nearestClearingId(map, r.x, r.y);
        if (cid != null) (byClearing[cid] ??= []).push({ x: r.x, y: r.y });
      }
      return Object.entries(byClearing).map(([cid, slots]) => ({
        clearingId: Number(cid), slots,
      }));
    }
    case 'coastal': {
      return clearings
        .filter(c => c.isCoastal)
        .map(c => ({ clearingId: c.id, slots: defaultSlotsForClearing(map, c, slotsByClearing) }));
    }
    case 'river': {
      return clearings
        .filter(c => c.onRiver)
        .map(c => ({ clearingId: c.id, slots: defaultSlotsForClearing(map, c, slotsByClearing) }));
    }
    case 'fox':
    case 'mouse':
    case 'rabbit': {
      // Marsh 5+p override: place on no-suit clearings instead.
      if (ctx.isMarsh5plus) {
        return clearings
          .filter(c => !ctx.suits[c.id])
          .map(c => ({ clearingId: c.id, slots: defaultSlotsForClearing(map, c, slotsByClearing) }));
      }
      // Adventurous override: any suited clearing (regardless of suit match).
      // Otherwise: only the named suit.
      const predicate = ctx.offSuit
        ? c => !!ctx.suits[c.id]
        : c => ctx.suits[c.id] === rule;
      return clearings
        .filter(predicate)
        .map(c => ({ clearingId: c.id, slots: defaultSlotsForClearing(map, c, slotsByClearing) }));
    }
    case 'corner': {
      return clearings
        .filter(c => c.isCorner)
        .map(c => ({ clearingId: c.id, slots: defaultSlotsForClearing(map, c, slotsByClearing) }));
    }
    case 'singleSlotNoRuin': {
      const slotCounts = getBuildingSlotCounts(map);
      const ruinClearings = getRuinClearingIds(map);
      return clearings
        .filter(c => slotCounts[c.id] === 1 && !ruinClearings.has(c.id))
        .map(c => ({ clearingId: c.id, slots: defaultSlotsForClearing(map, c, slotsByClearing) }));
    }
    case 'any': {
      return clearings.map(c => ({
        clearingId: c.id,
        slots: defaultSlotsForClearing(map, c, slotsByClearing),
      }));
    }
    case 'riverOrCoastal': {
      // Lake: coastal. All other maps: river.
      const flag = map.id === 'lake' ? 'isCoastal' : 'onRiver';
      return clearings
        .filter(c => c[flag])
        .map(c => ({ clearingId: c.id, slots: defaultSlotsForClearing(map, c, slotsByClearing) }));
    }
    default:
      return [];
  }
}

// Order landmarks by placement-rule constraint tightness — most-constrained
// first, so we don't paint ourselves into corners with no-adjacent.
const PLACEMENT_RANK = {
  corner: 1,
  singleSlotNoRuin: 2,
  fox: 3, mouse: 3, rabbit: 3,
  ruin: 4,
  coastal: 4,
  river: 4,
  riverOrCoastal: 5,
  any: 6,
};

// Picks a placement (clearing + render slot) for every landmark in
// `landmarkIds`, enforcing per-card rules and the universal no-adjacency
// constraint. Returns `{landmarkId: {clearingId, x, y}}`.
//
// `excludedClearings` (e.g. locked or flooded clearings) start the algorithm
// with those clearings considered occupied — landmarks won't go there nor
// adjacent to them.
//
// Landmarks that can't satisfy their rule given the current occupied set are
// silently skipped (omitted from the result). The user can re-roll.
export function placeLandmarks(map, landmarkIds, {
  suits = {},
  playerCount = 1,
  offSuit = false,
  excludedClearings = new Set(),
  floodedClearings = new Set(),
  fixedPlacements = null,
  rng = defaultRng,
} = {}) {
  if (!map || !landmarkIds?.length) return null;
  const ctx = {
    suits,
    isMarsh5plus: map.id === 'marsh' && playerCount >= 5,
    offSuit,
  };
  const adj = adjacencyMap(map, floodedClearings);

  // De-duplicate landmark IDs. Fixed placements (kept in their existing
  // positions for single-landmark re-rolls) skip the search; the rest are
  // ordered most-constrained first.
  const fixed = fixedPlacements ?? {};
  const ordered = [...new Set(landmarkIds)]
    .filter(id => !(id in fixed))
    .map(id => ({ id, rule: LANDMARK_MAP[id]?.placementRule }))
    .filter(x => x.rule)
    .sort((a, b) => (PLACEMENT_RANK[a.rule] ?? 99) - (PLACEMENT_RANK[b.rule] ?? 99));
  const fixedCount = Object.keys(fixed).length;
  const target = ordered.length + fixedCount;

  // Backtracking placer. For each landmark in priority order, try every
  // eligible candidate (in random order); if the recursive placement of
  // remaining landmarks fails, undo and try the next candidate. With
  // 5 landmarks × ~15 clearings × ~few slots each, the full search is
  // tiny and finds a solution whenever one exists.
  //
  // Marsh 5+p exception: the 3 native landmarks (Foxburrow/Mousehold/
  // Rabbittown) MUST go on the 3 unsuited clearings per the map's setup
  // rule. Those 3 clearings are random and often form an adjacent triple,
  // making mutual no-adjacency unsatisfiable. The card's adjacency clause
  // is overridden by the Marsh setup rule for this case — natives skip
  // the no-adjacency check, but pack landmarks still respect it relative
  // to all placed landmarks (natives included).
  let best = {};
  function recurse(idx, occupied, result) {
    if (idx === ordered.length) return result;
    const { id, rule } = ordered[idx];
    const lm = LANDMARK_MAP[id];
    const isForcedMarshNative = ctx.isMarsh5plus
      && lm?.source === 'homeland_landmarks'
      && (rule === 'fox' || rule === 'mouse' || rule === 'rabbit');

    const candidates = clearingsForRule(rule, map, ctx);
    const eligible = candidates.filter(c => {
      if (occupied.has(c.clearingId)) return false;
      if (isForcedMarshNative) return true;
      const neighbors = adj[c.clearingId] ?? new Set();
      for (const n of neighbors) if (occupied.has(n)) return false;
      return true;
    });

    // Track best partial in case we exhaust all candidates without finding
    // a full solution.
    if (Object.keys(result).length > Object.keys(best).length) {
      best = { ...result };
    }

    // Shuffle eligible options so re-rolls produce different valid
    // placements when multiple solutions exist.
    shuffleInPlace(eligible, rng);

    for (const pick of eligible) {
      const slot = pick.slots[Math.floor(rng() * pick.slots.length)];
      result[id] = { clearingId: pick.clearingId, x: slot.x, y: slot.y };
      occupied.add(pick.clearingId);
      const sub = recurse(idx + 1, occupied, result);
      if (sub && Object.keys(sub).length === target) return sub;
      delete result[id];
      occupied.delete(pick.clearingId);
    }

    // No candidate works; allow caller to skip this landmark and continue.
    return recurse(idx + 1, occupied, result);
  }

  const occupied = new Set(excludedClearings);
  const initial = {};
  for (const [id, p] of Object.entries(fixed)) {
    if (!p) continue;
    initial[id] = p;
    occupied.add(p.clearingId);
  }
  const found = recurse(0, occupied, initial);
  if (found && Object.keys(found).length === target) return found;
  return Object.keys(best).length ? best : (Object.keys(initial).length ? initial : null);
}

// Picks `count` random pack landmarks AND places them, swapping out any
// landmark that can't satisfy its placement rule given the others. Always
// returns a result where every landmark in `selectedLandmarks` is also
// present in `placedLandmarks` — i.e. the user never sees a "drawn" landmark
// that doesn't render on the map.
//
// `fixedSelections` are pre-committed picks (e.g. for a single-landmark
// re-roll that keeps the other selected landmarks in place); they're tried
// first, and if any of them can't place alongside the natives they're
// dropped from the result too.
//
// If the eligible pool is exhausted before we hit `count`, the result
// contains only what we could place — which is the rare-but-real case of a
// genuinely-impossible map state. User can re-roll suits to retry.
export function pickAndPlaceLandmarks(map, {
  playerCount,
  ownedAccessories,
  excludedLandmarks = new Set(),
  count,
  fixedSelections = [],
  fixedPlacements = null,
  suits = {},
  lockedClearings = new Set(),
  floodedClearings = new Set(),
  offSuit = false,
  rng = defaultRng,
} = {}) {
  if (!map) return { selectedLandmarks: [], placedLandmarks: null };

  const nativeIds = getNativeLandmarks(map, playerCount).map(l => l.id);
  const floodedSet = floodedClearings instanceof Set
    ? floodedClearings : new Set(floodedClearings ?? []);
  const placeOpts = {
    suits, playerCount, offSuit,
    excludedClearings: new Set([...lockedClearings, ...floodedSet]),
    floodedClearings: floodedSet,
    fixedPlacements,
    rng,
  };

  // Try each fixed selection in order; keep only those that can place
  // alongside the natives + previously-accepted fixed selections.
  let accepted = [];
  let bestPlaced = placeLandmarks(map, [...nativeIds], placeOpts);
  for (const id of fixedSelections) {
    const trialIds = [...nativeIds, ...accepted, id];
    const trialPlaced = placeLandmarks(map, trialIds, placeOpts);
    if (trialPlaced && trialIds.every(t => t in trialPlaced)) {
      accepted.push(id);
      bestPlaced = trialPlaced;
    }
  }
  if (accepted.length >= count) {
    return { selectedLandmarks: accepted, placedLandmarks: bestPlaced };
  }

  // Walk the shuffled eligible pool and accept each candidate iff it can
  // be placed alongside everything already accepted.
  const acceptedSet = new Set(accepted);
  const eligible = getEligibleLandmarks({
    map, playerCount, ownedAccessories, excludedLandmarks,
    allLandmarks: LANDMARKS,
  }).filter(l => !acceptedSet.has(l.id));

  for (const cand of shuffle(eligible, rng)) {
    if (accepted.length >= count) break;
    const trialIds = [...nativeIds, ...accepted, cand.id];
    const trialPlaced = placeLandmarks(map, trialIds, placeOpts);
    if (trialPlaced && trialIds.every(t => t in trialPlaced)) {
      accepted.push(cand.id);
      bestPlaced = trialPlaced;
    }
  }

  return { selectedLandmarks: accepted, placedLandmarks: bestPlaced };
}

// Build a full mapSetup. Order depends on player count:
//
// - 1-4p with floods (Marsh): pick floods first (constrained color/clearing
//   pairs), then suits on the remaining 12.
// - 5+p with natives (Marsh): pick suits first on any 12 of 15; the 3 leftover
//   unsuited clearings host the 3 natives randomly. Per Law M.5.1.
// - All other maps: suits only.
export function buildMapSetup({
  mapId,
  playerCount,
  ownedAccessories,
  forceSuitRandomizationOnAutumn,
  lockedSuits = {},
  // Either: a fixed list of landmark IDs to place (preserves identity).
  selectedLandmarkIds = null,
  // Or: a request to pick + place via try-and-replace.
  pickConfig = null, // { count, excludedLandmarks }
  allowOffSuitNatives = false,
  rng = defaultRng,
}) {
  const map = MAP_MAP[mapId];
  if (!map) return null;

  const lockedIds = new Set(Object.keys(lockedSuits).map(Number));

  // Floods (1-4p Marsh only). Their clearings are excluded from suits.
  const floodMarkers = randomizeFloodMarkers(map, playerCount, { excludedClearings: lockedIds, rng });
  const floodedIds = new Set(Object.values(floodMarkers ?? {}));

  // Suits on whatever clearings aren't locked or flooded.
  const clearingSuits = randomizeClearingSuits(map, {
    forceSuitRandomizationOnAutumn,
    lockedSuits,
    excludedClearings: floodedIds,
    rng,
  });
  const unsuitedSlots = getUnsuitedClearings(map, clearingSuits);

  // Landmarks: either place a fixed list, or pick + place via try-and-replace.
  const nativeIds = getNativeLandmarks(map, playerCount).map(l => l.id);
  let finalSelected;
  let placedLandmarks;
  if (pickConfig) {
    const result = pickAndPlaceLandmarks(map, {
      playerCount,
      ownedAccessories,
      excludedLandmarks: pickConfig.excludedLandmarks,
      count: pickConfig.count,
      fixedSelections: pickConfig.fixedSelections ?? [],
      suits: clearingSuits ?? {},
      lockedClearings: lockedIds,
      floodedClearings: floodedIds,
      offSuit: allowOffSuitNatives,
      rng,
    });
    finalSelected = result.selectedLandmarks;
    placedLandmarks = result.placedLandmarks;
  } else {
    finalSelected = selectedLandmarkIds ?? [];
    placedLandmarks = placeLandmarks(map, [...nativeIds, ...finalSelected], {
      suits: clearingSuits ?? {},
      playerCount,
      offSuit: allowOffSuitNatives,
      excludedClearings: new Set([...lockedIds, ...floodedIds]),
      floodedClearings: floodedIds,
      rng,
    });
  }

  return {
    clearingSuits,
    unsuitedSlots,
    lockedClearingSuits: { ...lockedSuits },
    floodMarkers,
    nativeLandmarkIds: nativeIds,
    placedLandmarks,
    selectedLandmarks: finalSelected,
  };
}
