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

// Returns { clearingId: suit } for the (up to 12) clearings that receive a
// suit token. For maps with more clearings than tokens (e.g., Marsh's 15),
// the 12 tokens are placed on a random subset; the remainder become unsuited.
// Autumn returns its printed suits when the override is off.
export function randomizeClearingSuits(map, { forceSuitRandomizationOnAutumn = false } = {}) {
  if (!map) return null;
  if (map.hasPrintedSuits && !forceSuitRandomizationOnAutumn) {
    return map.printedSuits ? { ...map.printedSuits } : null;
  }
  const allIds = map.clearings.map(c => c.id);
  const tokens = shuffle(CLEARING_SUIT_POOL);
  const suitedIds = shuffle(allIds).slice(0, tokens.length);
  const result = {};
  suitedIds.forEach((id, i) => { result[id] = tokens[i]; });
  return result;
}

// Returns the array of clearing IDs that did NOT receive a suit token
// (i.e., the leftover unsuited clearings on Marsh).
export function getUnsuitedClearings(map, clearingSuits) {
  if (!map || !clearingSuits) return [];
  const suited = new Set(Object.keys(clearingSuits).map(Number));
  return map.clearings.map(c => c.id).filter(id => !suited.has(id));
}

// Returns the array of native Landmark objects active for the given map+playerCount.
// Filtered by minPlayers gate where present.
export function getNativeLandmarks(map, playerCount) {
  if (!map || !map.nativeLandmarks) return [];
  return map.nativeLandmarks
    .filter(entry => entry.minPlayers === undefined || playerCount >= entry.minPlayers)
    .map(entry => LANDMARK_MAP[entry.id])
    .filter(Boolean);
}

// Returns the eligible Landmark[] pool for random landmark drawing on a given map.
// - Filters to landmarks whose source is in ownedAccessories.
// - Always drops homeland_landmarks (Marsh-only natives, never random-drawn).
// - Drops native landmarks for the current map+playerCount unless allowNativeOverride.
// - Drops user-excluded landmarks.
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

// Randomly assigns Marsh's flood markers to the unsuited (leftover) clearings.
// Returns null unless map has flood markers, player count is <= 4, and there
// are enough unsuited slots to receive all the markers.
export function randomizeFloodMarkers(map, playerCount, unsuitedSlots) {
  if (!map || !map.hasFloodMarkers) return null;
  if (playerCount > 4) return null;
  if (!map.floodMarkers.length) return null;
  if (!Array.isArray(unsuitedSlots) || unsuitedSlots.length < map.floodMarkers.length) return null;
  const slots = shuffle(unsuitedSlots).slice(0, map.floodMarkers.length);
  const result = {};
  map.floodMarkers.forEach((fm, i) => { result[fm.id] = slots[i]; });
  return result;
}

// Randomly assigns active native landmarks to the unsuited (leftover) clearings.
// Returns null when there are no unsuited slots or no active natives.
export function randomizeNativeLandmarkPlacements(map, playerCount, unsuitedSlots) {
  if (!Array.isArray(unsuitedSlots) || unsuitedSlots.length === 0) return null;
  const natives = getNativeLandmarks(map, playerCount);
  if (!natives.length) return null;
  if (unsuitedSlots.length < natives.length) return null;
  const slots = shuffle(unsuitedSlots).slice(0, natives.length);
  const result = {};
  natives.forEach((lm, i) => { result[lm.id] = slots[i]; });
  return result;
}

// Convenience: build a full mapSetup object given the inputs.
export function buildMapSetup({
  mapId,
  playerCount,
  ownedAccessories,
  forceSuitRandomizationOnAutumn,
}) {
  const map = MAP_MAP[mapId];
  if (!map) return null;
  const clearingSuits = randomizeClearingSuits(map, { forceSuitRandomizationOnAutumn });
  const unsuitedSlots = getUnsuitedClearings(map, clearingSuits);
  return {
    clearingSuits,
    unsuitedSlots,
    floodMarkers: randomizeFloodMarkers(map, playerCount, unsuitedSlots),
    nativeLandmarkIds: getNativeLandmarks(map, playerCount).map(l => l.id),
    nativeLandmarkPlacements: randomizeNativeLandmarkPlacements(map, playerCount, unsuitedSlots),
  };
}
