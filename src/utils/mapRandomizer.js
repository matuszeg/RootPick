import { CLEARING_SUIT_POOL, MAP_MAP } from '../data/maps.js';
import { LANDMARK_MAP } from '../data/accessories.js';

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickOne(arr) {
  if (!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
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
  const shuffledTokens = shuffle(remainingPool);
  const shuffledEligible = shuffle(eligibleIds);
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
export function getEligibleLandmarks({
  map,
  playerCount,
  ownedAccessories,
  excludedLandmarks,
  allowNativeOverride,
  allLandmarks,
}) {
  if (!map) return [];
  const nativeIds = new Set(
    getNativeLandmarks(map, playerCount).map(l => l.id)
  );
  return allLandmarks.filter(l => {
    if (!ownedAccessories.has(l.source)) return false;
    if (l.source === 'homeland_landmarks') return false;
    if (excludedLandmarks.has(l.id)) return false;
    if (!allowNativeOverride && nativeIds.has(l.id)) return false;
    return true;
  });
}

// Picks one flood marker per color, randomly choosing between the two
// candidate clearings declared on each marker's `clearingPair`.
// `excludedClearings` (e.g., locked-suit clearings) constrains the choice —
// if one of a pair is excluded, the other is forced.
// Returns null when not applicable (no flood markers, 5+ players, etc.).
export function randomizeFloodMarkers(map, playerCount, { excludedClearings = new Set() } = {}) {
  if (!map || !map.hasFloodMarkers) return null;
  if (playerCount > 4) return null;
  if (!map.floodMarkers?.length) return null;
  const result = {};
  for (const fm of map.floodMarkers) {
    const pair = fm.clearingPair ?? [];
    const eligible = pair.filter(id => !excludedClearings.has(id));
    const pick = pickOne(eligible.length ? eligible : pair);
    if (pick != null) result[fm.id] = pick;
  }
  return Object.keys(result).length ? result : null;
}

// Randomly assigns active native landmarks to clearings. Candidates come from
// `map.nativeLandmarkSlotCandidates` (e.g., Marsh's 6 flood-eligible clearings)
// minus any that are excluded (locked, already used).
export function randomizeNativeLandmarkPlacements(map, playerCount, { excludedClearings = new Set() } = {}) {
  const natives = getNativeLandmarks(map, playerCount);
  if (!natives.length) return null;
  const candidates = (map.nativeLandmarkSlotCandidates ?? []).filter(id => !excludedClearings.has(id));
  if (candidates.length < natives.length) return null;
  const slots = shuffle(candidates).slice(0, natives.length);
  const result = {};
  natives.forEach((lm, i) => { result[lm.id] = slots[i]; });
  return result;
}

// Convenience: build a full mapSetup object. Order:
// 1) Pick flood placements (if 1-4p Marsh) — deterministic clearings excluded from suits.
// 2) Pick native placements (if 5+p Marsh) — chosen clearings excluded from suits.
// 3) Place suits on the remaining clearings (respecting locks).
export function buildMapSetup({
  mapId,
  playerCount,
  ownedAccessories,
  forceSuitRandomizationOnAutumn,
  lockedSuits = {},
}) {
  const map = MAP_MAP[mapId];
  if (!map) return null;

  const lockedIds = new Set(Object.keys(lockedSuits).map(Number));

  const floodMarkers = randomizeFloodMarkers(map, playerCount, { excludedClearings: lockedIds });
  const floodedIds = new Set(Object.values(floodMarkers ?? {}));

  const nativeExclusions = new Set([...lockedIds, ...floodedIds]);
  const nativeLandmarkPlacements = randomizeNativeLandmarkPlacements(map, playerCount, { excludedClearings: nativeExclusions });
  const nativeIds = new Set(Object.values(nativeLandmarkPlacements ?? {}));

  const excludedFromSuits = new Set([...floodedIds, ...nativeIds]);
  const clearingSuits = randomizeClearingSuits(map, {
    forceSuitRandomizationOnAutumn,
    lockedSuits,
    excludedClearings: excludedFromSuits,
  });
  const unsuitedSlots = getUnsuitedClearings(map, clearingSuits);

  return {
    clearingSuits,
    unsuitedSlots,
    lockedClearingSuits: { ...lockedSuits },
    floodMarkers,
    nativeLandmarkIds: getNativeLandmarks(map, playerCount).map(l => l.id),
    nativeLandmarkPlacements,
  };
}
