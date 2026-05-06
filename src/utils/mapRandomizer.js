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

// Returns { 1: 'fox', 2: 'mouse', ..., 12: suit } for a randomized map,
// or the printed suits unchanged for Autumn (when toggle is off).
export function randomizeClearingSuits(map, { forceSuitRandomizationOnAutumn = false } = {}) {
  if (!map) return null;
  if (map.hasPrintedSuits && !forceSuitRandomizationOnAutumn) {
    return map.printedSuits ? { ...map.printedSuits } : null;
  }
  const suits = shuffle(CLEARING_SUIT_POOL);
  const result = {};
  for (let i = 0; i < map.clearings.length; i++) {
    result[map.clearings[i].id] = suits[i];
  }
  return result;
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

// Randomly assigns Marsh's 3 flood markers to 3 distinct flood-eligible clearings.
// Returns null unless map is Marsh and playerCount <= 4.
// Returns { [markerId]: clearingId } on success.
export function randomizeFloodMarkers(map, playerCount) {
  if (!map || !map.hasFloodMarkers) return null;
  if (playerCount > 4) return null;
  if (!map.floodMarkers.length || map.floodEligibleClearings.length < map.floodMarkers.length) return null;
  const clearings = shuffle(map.floodEligibleClearings).slice(0, map.floodMarkers.length);
  const result = {};
  for (let i = 0; i < map.floodMarkers.length; i++) {
    result[map.floodMarkers[i].id] = clearings[i];
  }
  return result;
}

// Randomly assigns active native landmarks to a map's nativeLandmarkSlots.
// Returns { [landmarkId]: clearingId } for maps with slots (e.g., Marsh's 13/14/15),
// or null when there are no slots or no active natives.
export function randomizeNativeLandmarkPlacements(map, playerCount) {
  if (!map || !Array.isArray(map.nativeLandmarkSlots) || map.nativeLandmarkSlots.length === 0) return null;
  const natives = getNativeLandmarks(map, playerCount);
  if (!natives.length) return null;
  const slots = shuffle(map.nativeLandmarkSlots).slice(0, natives.length);
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
  return {
    clearingSuits: randomizeClearingSuits(map, { forceSuitRandomizationOnAutumn }),
    floodMarkers: randomizeFloodMarkers(map, playerCount),
    nativeLandmarkIds: getNativeLandmarks(map, playerCount).map(l => l.id),
    nativeLandmarkPlacements: randomizeNativeLandmarkPlacements(map, playerCount),
  };
}
