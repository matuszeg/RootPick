import { useState, useCallback, useEffect } from 'react';
import { generateCombination } from '../utils/randomizer.js';
import { decodeFromUrl } from '../utils/urlState.js';
import { FACTION_MAP, EXPANSIONS } from '../data/factions.js';
import { MAPS, MAP_MAP } from '../data/maps.js';
import {
  ACCESSORIES, DECKS, HIRELING_SETS, LANDMARKS, LANDMARK_MAP, VAGABOND_CHARACTERS, getHirelingConflicts,
} from '../data/accessories.js';
import { buildMapSetup, getEligibleLandmarks, getNativeLandmarks, getUnsuitedClearings, pickAndPlaceLandmarks, placeLandmarks, randomizeClearingSuits, randomizeFloodMarkers } from '../utils/mapRandomizer.js';

// Recompute the player-count-dependent parts of mapSetup. When the player
// count crosses the 4/5 boundary on Marsh, the floods/natives swap, which
// changes which clearings are suited; we rebuild the whole mapSetup in that
// case (preserving the user's clearing-suit locks).
function recomputeMapSetupForPlayers(s, totalPlayers) {
  if (!s.selectedMap || !s.mapSetup) return s.mapSetup;
  const map = MAP_MAP[s.selectedMap];
  if (!map) return s.mapSetup;
  const newNatives = getNativeLandmarks(map, totalPlayers).map(l => l.id);
  const prevNativeKeys = (s.mapSetup.nativeLandmarkIds ?? []).slice().sort().join(',');
  const newNativeKeys = [...newNatives].sort().join(',');
  const floodsApplicable = map.hasFloodMarkers && totalPlayers <= 4;
  const hasFloods = !!s.mapSetup.floodMarkers;
  const nativesChanged = newNativeKeys !== prevNativeKeys;
  const floodsChanged = floodsApplicable !== hasFloods;
  if (!nativesChanged && !floodsChanged) {
    return { ...s.mapSetup, nativeLandmarkIds: newNatives };
  }
  // Cross the 4/5 boundary: regenerate full setup, preserving locks.
  // Drawn landmarks are kept in place where possible; ones that can't fit
  // the new (5+p natives or 1-4p floods) layout get swapped via the
  // try-and-replace logic in buildMapSetup's pickConfig path.
  const useLandmarks = (s.selectedLandmarks?.length ?? 0) > 0;
  const fresh = buildMapSetup({
    mapId: s.selectedMap,
    playerCount: totalPlayers,
    ownedAccessories: s.ownedAccessories,
    forceSuitRandomizationOnAutumn: s.forceSuitRandomizationOnAutumn,
    lockedSuits: s.mapSetup.lockedClearingSuits ?? {},
    allowOffSuitNatives: s.allowOffSuitNatives,
    pickConfig: useLandmarks ? {
      count: s.selectedLandmarks.length,
      excludedLandmarks: s.excludedLandmarks,
      fixedSelections: s.selectedLandmarks,
    } : null,
    selectedLandmarkIds: useLandmarks ? null : [],
  });
  return fresh ?? s.mapSetup;
}

function pickRandomMap(activeMapExpansions, excludedMaps, mapDifficulties) {
  const eligible = MAPS.filter(m =>
    activeMapExpansions.has(m.expansion) &&
    !excludedMaps.has(m.id) &&
    mapDifficulties.has(m.difficulty)
  );
  if (!eligible.length) return null;
  return eligible[Math.floor(Math.random() * eligible.length)].id;
}

function pickRandomDeck(ownedAccessories) {
  const eligible = DECKS.filter(d => d.accessory === null || ownedAccessories.has(d.accessory));
  if (!eligible.length) return 'standard';
  return eligible[Math.floor(Math.random() * eligible.length)].id;
}

function pickRandomHirelings(ownedExpansions, ownedAccessories, excludedHirelings = new Set(), bannedHirelings = new Set(), lockedHirelingIds = [], selectedFactionIds = new Set()) {
  const COUNT = 3;
  const lockedSet = new Set(lockedHirelingIds);

  const availableForPicking = HIRELING_SETS.filter(h => ownedAccessories.has(h.source));
  const conflictedIds = new Set(
    getHirelingConflicts(availableForPicking, selectedFactionIds).map(c => c.hireling.id)
  );

  const eligible = HIRELING_SETS.filter(h => {
    if (lockedSet.has(h.id)) return false;
    if (excludedHirelings.has(h.id)) return false;
    if (bannedHirelings.has(h.id)) return false;
    if (!ownedAccessories.has(h.source)) return false;
    if (conflictedIds.has(h.id)) return false;
    return true;
  });

  const needed = Math.max(0, COUNT - lockedHirelingIds.length);
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, needed).map(h => h.id);
  return [...lockedHirelingIds, ...picked];
}

function canUseHirelings(ownedAccessories) {
  return HIRELING_SETS.some(h => ownedAccessories.has(h.source));
}

// Returns array of 'promoted'|'demoted' parallel to selectedHirelings
// Rule: demotedCount = playerCount - 2, clamped to [0, count]
// Locked slots keep their current status; remaining slots are randomly assigned
function computeHirelingStatuses(count, playerCount, lockedStatuses = []) {
  const demotedCount = Math.max(0, Math.min(playerCount - 2, count));
  const result = new Array(count).fill(null);
  let lockedDemoted = 0;

  // Preserve locked slots
  for (let i = 0; i < count; i++) {
    if (lockedStatuses[i]) {
      result[i] = lockedStatuses[i];
      if (lockedStatuses[i] === 'demoted') lockedDemoted++;
    }
  }

  // Distribute remaining demoted/promoted among unlocked slots
  const unlocked = [];
  for (let i = 0; i < count; i++) {
    if (!result[i]) unlocked.push(i);
  }
  const remainingDemoted = Math.max(0, demotedCount - lockedDemoted);
  const shuffled = [...unlocked].sort(() => Math.random() - 0.5);
  const demoteSet = new Set(shuffled.slice(0, remainingDemoted));
  for (const i of unlocked) {
    result[i] = demoteSet.has(i) ? 'demoted' : 'promoted';
  }
  return result;
}

function pickRandomLandmarks({
  mapId, playerCount, ownedAccessories, count = 2, excludedLandmarks = new Set(),
}) {
  const map = mapId ? MAP_MAP[mapId] : null;
  const eligible = map
    ? getEligibleLandmarks({
        map, playerCount, ownedAccessories, excludedLandmarks,
        allLandmarks: LANDMARKS,
      })
    : LANDMARKS.filter(l => !excludedLandmarks.has(l.id) && ownedAccessories.has(l.source));
  if (!eligible.length) return [];
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, eligible.length)).map(l => l.id);
}

function pickVagabondCharacters(factionIds, ownedAccessories, excludedCharacters = new Set()) {
  const vagabondIds = factionIds.filter(id => FACTION_MAP[id]?.vagabondVariant);
  if (!vagabondIds.length) return {};

  const availableChars = VAGABOND_CHARACTERS.filter(c => {
    if (excludedCharacters.has(c.id)) return false;
    if (c.source === 'base') return true;
    return ownedAccessories.has(c.source);
  });

  const result = {};
  const usedChars = new Set();

  for (const factionId of vagabondIds) {
    const remaining = availableChars.filter(c => !usedChars.has(c.id));
    if (!remaining.length) break;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    result[factionId] = pick.id;
    usedChars.add(pick.id);
  }
  return result;
}

const LS_KEY = 'rootpick_settings';
const MAX_HISTORY = 25;

// Fields captured by undo/redo snapshots: every settings field plus every
// randomize/reroll output field. Settings are included so undo can restore
// state even if the user has since toggled an expansion or accessory that
// the snapshotted result depends on.
const SNAPSHOT_FIELDS = [
  // settings
  'ownedExpansions', 'activeMapExpansions', 'playerCount', 'botCount',
  'balanceMode', 'requireBalance', 'difficulties', 'mapDifficulties',
  'advancedMode', 'customMinReach', 'customMaxReach', 'allowedExclusions',
  'ownedAccessories', 'avoidUnderdogs', 'useHirelings', 'useLandmarks',
  'landmarkCount', 'forceSuitRandomizationOnAutumn', 'allowOffSuitNatives',
  'excludedMaps', 'excludedHirelings', 'lockedHirelings', 'bannedHirelings',
  'excludedCharacters', 'excludedLandmarks',
  // randomize/reroll outputs
  'selectedFactions', 'lockedFactions', 'bannedFactions',
  'selectedMap', 'mapSetup', 'selectedLandmarks',
  'selectedDeck', 'selectedHirelings', 'hirelingStatuses',
  'vagabondCharacters',
];

function snapshot(s) {
  const snap = {};
  for (const f of SNAPSHOT_FIELDS) snap[f] = structuredClone(s[f]);
  return snap;
}

function pushHistory(s, next) {
  if (next === s) return next;
  return {
    ...next,
    undoStack: [snapshot(s), ...s.undoStack].slice(0, MAX_HISTORY),
    redoStack: [],
  };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Ensure standard_deck is always present (backwards compat)
    const accessories = new Set(parsed.ownedAccessories ?? []);
    if (!accessories.has('standard_deck')) accessories.add('standard_deck');
    // Migration: auto-enable expansion accessories for users who have those expansions
    const expansions = new Set(parsed.ownedExpansions ?? ['base']);
    if (expansions.has('underworld') && !accessories.has('underworld_landmarks')) accessories.add('underworld_landmarks');
    if (expansions.has('homeland') && !accessories.has('homeland_landmarks')) accessories.add('homeland_landmarks');
    if (expansions.has('homeland') && !accessories.has('homeland_characters')) accessories.add('homeland_characters');
    if (expansions.has('riverfolk') && !accessories.has('riverfolk_characters')) accessories.add('riverfolk_characters');
    return {
      ownedExpansions:     expansions,
      activeMapExpansions: new Set(parsed.activeMapExpansions ?? (parsed.ownedExpansions ?? ['base'])),
      playerCount:         parsed.playerCount               ?? 4,
      botCount:            parsed.botCount                  ?? 0,
      balanceMode:         parsed.balanceMode               ?? 'balanced',
      requireBalance:      parsed.requireBalance            ?? true,
      difficulties:        new Set(parsed.difficulties      ?? [1, 2, 3]),
      mapDifficulties:     new Set(parsed.mapDifficulties   ?? [1, 2, 3]),
      advancedMode:        parsed.advancedMode              ?? false,
      customMinReach:      parsed.customMinReach            ?? null,
      customMaxReach:      parsed.customMaxReach            ?? null,
      allowedExclusions:   new Set(parsed.allowedExclusions ?? []),
      ownedAccessories:    accessories,
      avoidUnderdogs:      parsed.avoidUnderdogs            ?? false,
      useHirelings:        parsed.useHirelings              ?? true,
      useLandmarks:        parsed.useLandmarks              ?? false,
      landmarkCount:       parsed.landmarkCount             ?? 2,
      forceSuitRandomizationOnAutumn: parsed.forceSuitRandomizationOnAutumn ?? false,
      allowOffSuitNatives:          parsed.allowOffSuitNatives          ?? false,
      excludedMaps:        new Set(parsed.excludedMaps       ?? []),
      excludedHirelings:   new Set(parsed.excludedHirelings  ?? []),
      lockedHirelings:     new Set(parsed.lockedHirelings    ?? []),
      bannedHirelings:     new Set(parsed.bannedHirelings    ?? []),
      excludedCharacters:  new Set(parsed.excludedCharacters ?? []),
      excludedLandmarks:   new Set(parsed.excludedLandmarks  ?? []),
    };
  } catch {
    return null;
  }
}

function saveSettings(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      ownedExpansions:     [...state.ownedExpansions],
      activeMapExpansions: [...state.activeMapExpansions],
      playerCount:         state.playerCount,
      botCount:            state.botCount,
      balanceMode:         state.balanceMode,
      requireBalance:      state.requireBalance,
      difficulties:        [...state.difficulties],
      mapDifficulties:     [...state.mapDifficulties],
      advancedMode:        state.advancedMode,
      customMinReach:      state.customMinReach,
      customMaxReach:      state.customMaxReach,
      allowedExclusions:   [...state.allowedExclusions],
      ownedAccessories:    [...state.ownedAccessories],
      avoidUnderdogs:      state.avoidUnderdogs,
      useHirelings:        state.useHirelings,
      useLandmarks:        state.useLandmarks,
      landmarkCount:       state.landmarkCount,
      forceSuitRandomizationOnAutumn: state.forceSuitRandomizationOnAutumn,
      allowOffSuitNatives:          state.allowOffSuitNatives,
      excludedMaps:        [...state.excludedMaps],
      excludedHirelings:   [...state.excludedHirelings],
      lockedHirelings:     [...state.lockedHirelings],
      bannedHirelings:     [...state.bannedHirelings],
      excludedCharacters:  [...state.excludedCharacters],
      excludedLandmarks:   [...state.excludedLandmarks],
    }));
  } catch {}
}

function getInitialState() {
  const urlState      = decodeFromUrl();
  const savedSettings = loadSettings();

  const allExpansionIds = EXPANSIONS.map(e => e.id);
  const allAccessoryIds = ACCESSORIES.map(a => a.id);
  const base = {
    ownedExpansions:     new Set(allExpansionIds),
    activeMapExpansions: new Set(allExpansionIds),
    playerCount:         4,
    balanceMode:         'standard',
    requireBalance:      false,
    difficulties:        new Set([1, 2, 3]),
    mapDifficulties:     new Set([1, 2, 3]),
    botCount:            0,
    advancedMode:        false,
    customMinReach:      null,
    customMaxReach:      null,
    allowedExclusions:   new Set(),
    ownedAccessories:    new Set(allAccessoryIds),
    avoidUnderdogs:      false,
    useHirelings:        true,
    useLandmarks:        true,
    landmarkCount:       2,
    forceSuitRandomizationOnAutumn: false,
    allowOffSuitNatives:          false,
    excludedMaps:        new Set(),
    excludedHirelings:   new Set(),
    lockedHirelings:     new Set(),
    bannedHirelings:     new Set(),
    excludedCharacters:  new Set(),
    excludedLandmarks:   new Set(),
    selectedFactions:    [],
    lockedFactions:      new Set(),
    bannedFactions:      new Set(),
    selectedMap:         null,
    selectedDeck:        null,
    selectedHirelings:   [],
    hirelingStatuses:    [],
    selectedLandmarks:   [],
    mapSetup:            null,
    vagabondCharacters:  {},
    undoStack:           [],
    redoStack:           [],
    error:               null,
    copied:              false,
  };

  if (savedSettings) Object.assign(base, savedSettings);
  if (Object.keys(urlState).length > 0) Object.assign(base, urlState);

  return base;
}

export function useAppState() {
  const [state, setState] = useState(getInitialState);

  useEffect(() => {
    saveSettings(state);
  }, [
    state.ownedExpansions, state.activeMapExpansions, state.playerCount, state.balanceMode,
    state.requireBalance, state.difficulties, state.mapDifficulties,
    state.advancedMode, state.customMinReach, state.customMaxReach,
    state.allowedExclusions, state.ownedAccessories, state.avoidUnderdogs, state.useHirelings,
    state.useLandmarks, state.landmarkCount,
    state.forceSuitRandomizationOnAutumn, state.allowOffSuitNatives,
    state.botCount, state.excludedMaps, state.excludedHirelings,
    state.lockedHirelings, state.bannedHirelings,
    state.excludedCharacters, state.excludedLandmarks,
  ]);

  // ── Settings ──────────────────────────────────────────────────────────────

  const toggleExpansion = useCallback(id => {
    setState(s => {
      const next = new Set(s.ownedExpansions);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...s, ownedExpansions: next, selectedFactions: [], lockedFactions: new Set() };
    });
  }, []);

  const setPlayerCount = useCallback(n => {
    setState(s => {
      const newBotCount = Math.min(s.botCount, 6 - n);
      const next = {
        ...s,
        playerCount: n,
        botCount: newBotCount,
        selectedFactions: [],
        lockedFactions: new Set(),
        error: null,
      };
      next.mapSetup = recomputeMapSetupForPlayers(next, n + newBotCount);
      if (next.mapSetup?.selectedLandmarks) next.selectedLandmarks = next.mapSetup.selectedLandmarks;
      return next;
    });
  }, []);

  const setBotCount = useCallback(n => {
    setState(s => {
      const newBotCount = Math.max(0, Math.min(n, 6 - s.playerCount));
      const next = { ...s, botCount: newBotCount, selectedFactions: [], lockedFactions: new Set(), error: null };
      next.mapSetup = recomputeMapSetupForPlayers(next, s.playerCount + newBotCount);
      if (next.mapSetup?.selectedLandmarks) next.selectedLandmarks = next.mapSetup.selectedLandmarks;
      return next;
    });
  }, []);

  const setBalanceMode = useCallback(mode => {
    setState(s => ({ ...s, balanceMode: mode }));
  }, []);

  const setRequireBalance = useCallback(val => {
    setState(s => ({ ...s, requireBalance: val }));
  }, []);

  const setAvoidUnderdogs = useCallback(val => {
    setState(s => ({ ...s, avoidUnderdogs: val, selectedFactions: [], error: null }));
  }, []);

  const toggleDifficulty = useCallback(level => {
    setState(s => {
      const next = new Set(s.difficulties);
      if (next.has(level)) {
        if (next.size === 1) return s;
        next.delete(level);
      } else {
        next.add(level);
      }
      return { ...s, difficulties: next, selectedFactions: [], error: null };
    });
  }, []);

  const toggleMapDifficulty = useCallback(level => {
    setState(s => {
      const next = new Set(s.mapDifficulties);
      if (next.has(level)) {
        if (next.size === 1) return s;
        next.delete(level);
      } else {
        next.add(level);
      }
      return { ...s, mapDifficulties: next };
    });
  }, []);

  const toggleMapExpansion = useCallback(id => {
    if (id === 'base') return; // base maps always available
    setState(s => {
      const next = new Set(s.activeMapExpansions);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...s, activeMapExpansions: next };
    });
  }, []);

  const toggleAccessory = useCallback(id => {
    setState(s => {
      const next = new Set(s.ownedAccessories);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...s, ownedAccessories: next };
    });
  }, []);

  const setUseHirelings = useCallback(val => {
    setState(s => ({ ...s, useHirelings: val }));
  }, []);

  const setUseLandmarks = useCallback(val => {
    setState(s => ({ ...s, useLandmarks: val }));
  }, []);

  const setLandmarkCount = useCallback(val => {
    setState(s => ({ ...s, landmarkCount: val }));
  }, []);

  const setForceSuitRandomizationOnAutumn = useCallback(val => {
    setState(s => {
      const next = { ...s, forceSuitRandomizationOnAutumn: val };
      // If we're currently displaying a printed-suit map, re-derive the
      // clearing suits so the toggle takes effect immediately rather than
      // waiting for the next randomize.
      const map = s.selectedMap ? MAP_MAP[s.selectedMap] : null;
      if (!map?.hasPrintedSuits || !s.mapSetup) return next;
      const totalPlayers = s.playerCount + s.botCount;
      const lockedSuits = s.mapSetup.lockedClearingSuits ?? {};
      const lockedIds = new Set(Object.keys(lockedSuits).map(Number));
      const floodedIds = new Set(Object.values(s.mapSetup.floodMarkers ?? {}));
      const newSuits = randomizeClearingSuits(map, {
        forceSuitRandomizationOnAutumn: val,
        lockedSuits,
        excludedClearings: floodedIds,
      });
      const result = pickAndPlaceLandmarks(map, {
        playerCount: totalPlayers,
        ownedAccessories: s.ownedAccessories,
        excludedLandmarks: s.excludedLandmarks,
        count: s.selectedLandmarks?.length ?? 0,
        fixedSelections: s.selectedLandmarks ?? [],
        suits: newSuits ?? {},
        lockedClearings: lockedIds,
        floodedClearings: floodedIds,
        offSuit: s.allowOffSuitNatives,
      });
      return {
        ...next,
        selectedLandmarks: result.selectedLandmarks,
        mapSetup: {
          ...s.mapSetup,
          clearingSuits: newSuits,
          unsuitedSlots: getUnsuitedClearings(map, newSuits),
          placedLandmarks: result.placedLandmarks,
        },
      };
    });
  }, []);

  const setAllowOffSuitNatives = useCallback(val => {
    setState(s => ({ ...s, allowOffSuitNatives: val }));
  }, []);

  // ── Pool exclusions ───────────────────────────────────────────────────────

  const toggleExcludedMap = useCallback(id => {
    setState(s => {
      const next = new Set(s.excludedMaps);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...s, excludedMaps: next };
    });
  }, []);

  const toggleExcludedHireling = useCallback(id => {
    setState(s => {
      const next = new Set(s.excludedHirelings);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...s, excludedHirelings: next };
    });
  }, []);

  const toggleExcludedCharacter = useCallback(id => {
    setState(s => {
      const next = new Set(s.excludedCharacters);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...s, excludedCharacters: next };
    });
  }, []);

  const toggleExcludedLandmark = useCallback(id => {
    setState(s => {
      const next = new Set(s.excludedLandmarks);
      if (next.has(id)) next.delete(id); else next.add(id);
      return { ...s, excludedLandmarks: next };
    });
  }, []);

  // ── Advanced ──────────────────────────────────────────────────────────────

  const setAdvancedMode = useCallback(val => {
    setState(s => ({
      ...s,
      advancedMode: val,
      ...(val ? {} : { customMinReach: null, customMaxReach: null, allowedExclusions: new Set() }),
    }));
  }, []);

  const setCustomMinReach = useCallback(val => {
    setState(s => ({ ...s, customMinReach: val }));
  }, []);

  const setCustomMaxReach = useCallback(val => {
    setState(s => ({ ...s, customMaxReach: val }));
  }, []);

  const toggleAllowedExclusion = useCallback(pairKey => {
    setState(s => {
      const next = new Set(s.allowedExclusions);
      if (next.has(pairKey)) next.delete(pairKey); else next.add(pairKey);
      return { ...s, allowedExclusions: next };
    });
  }, []);

  // ── Generation ────────────────────────────────────────────────────────────

  const randomize = useCallback((keepLocked = false) => {
    setState(s => {
      const lockedFactionIds = keepLocked ? [...s.lockedFactions] : [];

      const result = generateCombination({
        playerCount:       s.playerCount,
        botCount:          s.botCount,
        ownedExpansions:   s.ownedExpansions,
        bannedFactions:    s.bannedFactions,
        lockedFactionIds,
        balanceMode:       s.balanceMode,
        requireBalance:    s.requireBalance,
        difficulties:      s.difficulties,
        customMinReach:    s.customMinReach,
        customMaxReach:    s.customMaxReach,
        allowedExclusions: s.allowedExclusions,
        avoidUnderdogs:    s.avoidUnderdogs,
      });

      if (result.error) return { ...s, error: result.error };

      const newFactions = result.factions;
      const hirelingsEnabled = canUseHirelings(s.ownedAccessories);
      const lockedHirelingIds = hirelingsEnabled ? [...s.lockedHirelings].filter(id =>
        HIRELING_SETS.find(h => h.id === id && s.ownedAccessories.has(h.source))
      ) : [];
      const newHirelings = hirelingsEnabled
        ? pickRandomHirelings(s.ownedExpansions, s.ownedAccessories, s.excludedHirelings, s.bannedHirelings, lockedHirelingIds, new Set(newFactions))
        : [];

      return pushHistory(s, {
        ...s,
        selectedFactions:   newFactions,
        lockedFactions:     keepLocked ? s.lockedFactions : new Set(),
        ...(() => {
          const newMapId = pickRandomMap(s.activeMapExpansions, s.excludedMaps, s.mapDifficulties);
          const totalPlayers = s.playerCount + s.botCount;
          const setup = newMapId ? buildMapSetup({
            mapId: newMapId,
            playerCount: totalPlayers,
            ownedAccessories: s.ownedAccessories,
            forceSuitRandomizationOnAutumn: s.forceSuitRandomizationOnAutumn,
            allowOffSuitNatives: s.allowOffSuitNatives,
            pickConfig: s.useLandmarks ? {
              count: s.landmarkCount,
              excludedLandmarks: s.excludedLandmarks,
            } : null,
          }) : null;
          return {
            selectedMap: newMapId,
            mapSetup: setup,
            selectedLandmarks: setup?.selectedLandmarks ?? [],
          };
        })(),
        selectedDeck:       pickRandomDeck(s.ownedAccessories),
        selectedHirelings:  newHirelings,
        hirelingStatuses:   computeHirelingStatuses(newHirelings.length, s.playerCount + s.botCount,
          newHirelings.map(id => {
            const prevIdx = s.selectedHirelings.indexOf(id);
            return prevIdx !== -1 && s.lockedHirelings.has(id) ? s.hirelingStatuses[prevIdx] : null;
          })),
        vagabondCharacters: pickVagabondCharacters(newFactions, s.ownedAccessories, s.excludedCharacters),
        error:              null,
      });
    });
  }, []);

  const rerollSingle = useCallback(factionId => {
    setState(s => {
      const isBot = FACTION_MAP[factionId]?.isBot ?? false;
      const otherSelected = s.selectedFactions.filter(id => id !== factionId);
      const tempBanned = new Set([...s.bannedFactions, ...otherSelected, factionId]);

      const result = generateCombination({
        playerCount:       isBot ? 0 : 1,
        botCount:          isBot ? 1 : 0,
        ownedExpansions:   s.ownedExpansions,
        bannedFactions:    tempBanned,
        lockedFactionIds:  [],
        balanceMode:       'chaos',
        requireBalance:    false,
        difficulties:      s.difficulties,
        allowedExclusions: s.allowedExclusions,
      });

      if (result.error) return { ...s, error: 'No replacement found for that faction.' };

      const newFactionId = result.factions[0];
      const newSelected  = s.selectedFactions.map(id => id === factionId ? newFactionId : id);

      const newChars = { ...s.vagabondCharacters };
      if (FACTION_MAP[factionId]?.vagabondVariant) delete newChars[factionId];
      if (FACTION_MAP[newFactionId]?.vagabondVariant && !newChars[newFactionId]) {
        const extra = pickVagabondCharacters([newFactionId], s.ownedAccessories, s.excludedCharacters);
        const used = new Set(Object.values(newChars));
        const pick = Object.values(extra)[0];
        if (pick && !used.has(pick)) newChars[newFactionId] = pick;
      }

      return pushHistory(s, {
        ...s,
        selectedFactions:   newSelected,
        vagabondCharacters: newChars,
        error: null,
      });
    });
  }, []);

  const rerollMap = useCallback(() => {
    setState(s => {
      const eligible = MAPS.filter(m =>
        s.activeMapExpansions.has(m.expansion) &&
        !s.excludedMaps.has(m.id) &&
        s.mapDifficulties.has(m.difficulty) &&
        m.id !== s.selectedMap
      );
      if (!eligible.length) return s;
      const newMapId = eligible[Math.floor(Math.random() * eligible.length)].id;
      const totalPlayers = s.playerCount + s.botCount;
      const setup = buildMapSetup({
        mapId: newMapId,
        playerCount: totalPlayers,
        ownedAccessories: s.ownedAccessories,
        forceSuitRandomizationOnAutumn: s.forceSuitRandomizationOnAutumn,
        allowOffSuitNatives: s.allowOffSuitNatives,
        pickConfig: s.useLandmarks ? {
          count: s.landmarkCount,
          excludedLandmarks: s.excludedLandmarks,
        } : null,
      });
      return pushHistory(s, {
        ...s,
        selectedMap: newMapId,
        mapSetup: setup,
        selectedLandmarks: setup?.selectedLandmarks ?? [],
      });
    });
  }, []);

  const rerollClearingSuits = useCallback(() => {
    setState(s => {
      if (!s.selectedMap || !s.mapSetup) return s;
      const map = MAP_MAP[s.selectedMap];
      if (!map) return s;
      if (map.hasPrintedSuits && !s.forceSuitRandomizationOnAutumn) return s;
      const totalPlayers = s.playerCount + s.botCount;
      const lockedSuits = s.mapSetup.lockedClearingSuits ?? {};
      const lockedIds = new Set(Object.keys(lockedSuits).map(Number));
      // Floods stay put; suits re-shuffle on the remaining clearings.
      const floodedIds = new Set(Object.values(s.mapSetup.floodMarkers ?? {}));
      const newSuits = randomizeClearingSuits(map, {
        forceSuitRandomizationOnAutumn: s.forceSuitRandomizationOnAutumn,
        lockedSuits,
        excludedClearings: floodedIds,
      });
      const newUnsuited = getUnsuitedClearings(map, newSuits);
      // Suit re-shuffle changes the suit-of-each-clearing context. Re-place
      // landmarks under the new suit map; if any drawn landmark can no
      // longer satisfy its rule, swap it out for a fresh draw rather than
      // leaving the user with an orphaned card.
      const result = pickAndPlaceLandmarks(map, {
        playerCount: totalPlayers,
        ownedAccessories: s.ownedAccessories,
        excludedLandmarks: s.excludedLandmarks,
        count: s.selectedLandmarks?.length ?? 0,
        fixedSelections: s.selectedLandmarks ?? [],
        suits: newSuits ?? {},
        lockedClearings: lockedIds,
        floodedClearings: floodedIds,
        offSuit: s.allowOffSuitNatives,
      });
      return pushHistory(s, {
        ...s,
        selectedLandmarks: result.selectedLandmarks,
        mapSetup: {
          ...s.mapSetup,
          clearingSuits: newSuits,
          unsuitedSlots: newUnsuited,
          placedLandmarks: result.placedLandmarks,
        },
      });
    });
  }, []);

  const clearAllClearingLocks = useCallback(() => {
    setState(s => {
      if (!s.mapSetup) return s;
      if (!s.mapSetup.lockedClearingSuits || !Object.keys(s.mapSetup.lockedClearingSuits).length) return s;
      return { ...s, mapSetup: { ...s.mapSetup, lockedClearingSuits: {} } };
    });
  }, []);

  const toggleClearingLock = useCallback(clearingId => {
    setState(s => {
      if (!s.mapSetup) return s;
      const id = Number(clearingId);
      const locked = { ...(s.mapSetup.lockedClearingSuits ?? {}) };
      if (id in locked) {
        delete locked[id];
      } else {
        const suit = s.mapSetup.clearingSuits?.[id];
        if (!suit) return s; // can't lock an unsuited clearing
        locked[id] = suit;
      }
      return { ...s, mapSetup: { ...s.mapSetup, lockedClearingSuits: locked } };
    });
  }, []);

  const rerollFloodMarkers = useCallback(() => {
    setState(s => {
      if (!s.selectedMap || !s.mapSetup) return s;
      const map = MAP_MAP[s.selectedMap];
      if (!map || !map.hasFloodMarkers) return s;
      const totalPlayers = s.playerCount + s.botCount;
      const lockedSuits = s.mapSetup.lockedClearingSuits ?? {};
      const lockedIds = new Set(Object.keys(lockedSuits).map(Number));
      const newFloods = randomizeFloodMarkers(map, totalPlayers, { excludedClearings: lockedIds });
      if (!newFloods) return s;
      // Re-shuffle suits because flood positions changed (newly-flooded
      // clearings lose their suits; newly-freed clearings gain them).
      const floodedIds = new Set(Object.values(newFloods));
      const newSuits = randomizeClearingSuits(map, {
        forceSuitRandomizationOnAutumn: s.forceSuitRandomizationOnAutumn,
        lockedSuits,
        excludedClearings: floodedIds,
      });
      // Re-place landmarks under the new suit/flood layout. Drawn landmarks
      // that no longer fit get swapped for fresh draws.
      const result = pickAndPlaceLandmarks(map, {
        playerCount: totalPlayers,
        ownedAccessories: s.ownedAccessories,
        excludedLandmarks: s.excludedLandmarks,
        count: s.selectedLandmarks?.length ?? 0,
        fixedSelections: s.selectedLandmarks ?? [],
        suits: newSuits ?? {},
        lockedClearings: lockedIds,
        floodedClearings: floodedIds,
        offSuit: s.allowOffSuitNatives,
      });
      return pushHistory(s, {
        ...s,
        selectedLandmarks: result.selectedLandmarks,
        mapSetup: {
          ...s.mapSetup,
          floodMarkers: newFloods,
          clearingSuits: newSuits,
          unsuitedSlots: getUnsuitedClearings(map, newSuits),
          placedLandmarks: result.placedLandmarks,
        },
      });
    });
  }, []);


  const rerollDeck = useCallback(() => {
    setState(s => {
      const eligible = DECKS.filter(d =>
        (d.accessory === null || s.ownedAccessories.has(d.accessory)) && d.id !== s.selectedDeck
      );
      if (!eligible.length) return s;
      return pushHistory(s, { ...s, selectedDeck: eligible[Math.floor(Math.random() * eligible.length)].id });
    });
  }, []);

  const rerollHirelings = useCallback(() => {
    setState(s => {
      const lockedIds = [...s.lockedHirelings].filter(id => s.selectedHirelings.includes(id));
      const newHirelings = pickRandomHirelings(s.ownedExpansions, s.ownedAccessories, s.excludedHirelings, s.bannedHirelings, lockedIds, new Set(s.selectedFactions));
      return pushHistory(s, {
        ...s,
        selectedHirelings: newHirelings,
        hirelingStatuses:  computeHirelingStatuses(newHirelings.length, s.playerCount + s.botCount,
          newHirelings.map(id => {
            const prevIdx = s.selectedHirelings.indexOf(id);
            return prevIdx !== -1 && s.lockedHirelings.has(id) ? s.hirelingStatuses[prevIdx] : null;
          })),
      });
    });
  }, []);

  const rerollSingleHireling = useCallback(hirelingId => {
    setState(s => {
      const others = new Set(s.selectedHirelings.filter(id => id !== hirelingId));
      const expandedFactions = new Set(s.selectedFactions);
      for (const id of s.selectedFactions) {
        const automatesId = FACTION_MAP[id]?.automatesId;
        if (automatesId) expandedFactions.add(automatesId);
      }
      const eligible = HIRELING_SETS.filter(h => {
        if (others.has(h.id)) return false;
        if (h.id === hirelingId) return false;
        if (s.excludedHirelings.has(h.id)) return false;
        if (s.bannedHirelings.has(h.id)) return false;
        if (!s.ownedAccessories.has(h.source)) return false;
        if (h.associatedFactions.some(id => expandedFactions.has(id))) return false;
        return true;
      });
      if (!eligible.length) return { ...s, error: 'No replacement found for that hireling.' };
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      const newSelected = s.selectedHirelings.map(id => id === hirelingId ? pick.id : id);
      const newStatuses = [...s.hirelingStatuses]; // statuses stay in same slots
      return pushHistory(s, {
        ...s,
        selectedHirelings: newSelected,
        hirelingStatuses:  newStatuses,
        lockedHirelings:   (() => { const n = new Set(s.lockedHirelings); n.delete(hirelingId); return n; })(),
      });
    });
  }, []);

  const rerollLandmarks = useCallback(() => {
    setState(s => {
      const map = s.selectedMap ? MAP_MAP[s.selectedMap] : null;
      if (!map || !s.mapSetup) return s;
      const totalPlayers = s.playerCount + s.botCount;
      const lockedIds = new Set(Object.keys(s.mapSetup.lockedClearingSuits ?? {}).map(Number));
      const floodedIds = new Set(Object.values(s.mapSetup.floodMarkers ?? {}));
      const result = pickAndPlaceLandmarks(map, {
        playerCount: totalPlayers,
        ownedAccessories: s.ownedAccessories,
        excludedLandmarks: s.excludedLandmarks,
        count: s.landmarkCount,
        suits: s.mapSetup.clearingSuits ?? {},
        lockedClearings: lockedIds,
        floodedClearings: floodedIds,
        offSuit: s.allowOffSuitNatives,
      });
      return pushHistory(s, {
        ...s,
        selectedLandmarks: result.selectedLandmarks,
        mapSetup: { ...s.mapSetup, placedLandmarks: result.placedLandmarks },
      });
    });
  }, []);

  const rerollSingleLandmark = useCallback(landmarkId => {
    setState(s => {
      const map = s.selectedMap ? MAP_MAP[s.selectedMap] : null;
      if (!map || !s.mapSetup) return s;
      const totalPlayers = s.playerCount + s.botCount;
      const lockedIds = new Set(Object.keys(s.mapSetup.lockedClearingSuits ?? {}).map(Number));
      const floodedIds = new Set(Object.values(s.mapSetup.floodMarkers ?? {}));
      // Keep the OTHER selected landmarks fixed in their existing positions;
      // pick a fresh replacement for the one being re-rolled. The replacement
      // is excluded from being the same id again so the user actually sees a
      // change. Native landmarks (auto-placed by setup) also stay put.
      const others = s.selectedLandmarks.filter(id => id !== landmarkId);
      const exclude = new Set([...s.excludedLandmarks, landmarkId]);
      const placed = s.mapSetup.placedLandmarks ?? {};
      const fixedPlacements = {};
      for (const [id, p] of Object.entries(placed)) {
        if (id === landmarkId) continue;
        fixedPlacements[id] = p;
      }
      const result = pickAndPlaceLandmarks(map, {
        playerCount: totalPlayers,
        ownedAccessories: s.ownedAccessories,
        excludedLandmarks: exclude,
        count: s.landmarkCount,
        fixedSelections: others,
        fixedPlacements,
        suits: s.mapSetup.clearingSuits ?? {},
        lockedClearings: lockedIds,
        floodedClearings: floodedIds,
        offSuit: s.allowOffSuitNatives,
      });
      return pushHistory(s, {
        ...s,
        selectedLandmarks: result.selectedLandmarks,
        mapSetup: { ...s.mapSetup, placedLandmarks: result.placedLandmarks },
      });
    });
  }, []);

  const rerollVagabondCharacter = useCallback(factionId => {
    setState(s => {
      const used = new Set(Object.entries(s.vagabondCharacters)
        .filter(([k]) => k !== factionId).map(([, v]) => v));
      const available = VAGABOND_CHARACTERS.filter(c => {
        if (used.has(c.id)) return false;
        if (c.id === s.vagabondCharacters[factionId]) return false;
        if (s.excludedCharacters.has(c.id)) return false;
        if (c.source === 'base') return true;
        return s.ownedAccessories.has(c.source);
      });
      if (!available.length) return s;
      const pick = available[Math.floor(Math.random() * available.length)];
      return pushHistory(s, { ...s, vagabondCharacters: { ...s.vagabondCharacters, [factionId]: pick.id } });
    });
  }, []);

  const undo = useCallback(() => {
    setState(s => {
      if (s.undoStack.length === 0) return s;
      const [prev, ...rest] = s.undoStack;
      return {
        ...s,
        ...prev,
        undoStack: rest,
        redoStack: [snapshot(s), ...s.redoStack].slice(0, MAX_HISTORY),
        error: null,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(s => {
      if (s.redoStack.length === 0) return s;
      const [next, ...rest] = s.redoStack;
      return {
        ...s,
        ...next,
        redoStack: rest,
        undoStack: [snapshot(s), ...s.undoStack].slice(0, MAX_HISTORY),
        error: null,
      };
    });
  }, []);

  // ── Card actions ──────────────────────────────────────────────────────────

  const toggleLock = useCallback(factionId => {
    setState(s => {
      const next = new Set(s.lockedFactions);
      if (next.has(factionId)) next.delete(factionId); else next.add(factionId);
      return { ...s, lockedFactions: next };
    });
  }, []);

  const banFaction = useCallback(factionId => {
    setState(s => {
      const bannedFactions  = new Set(s.bannedFactions);  bannedFactions.add(factionId);
      const lockedFactions  = new Set(s.lockedFactions);  lockedFactions.delete(factionId);
      const selectedFactions = s.selectedFactions.filter(id => id !== factionId);
      return { ...s, bannedFactions, lockedFactions, selectedFactions };
    });
  }, []);

  const unbanFaction = useCallback(factionId => {
    setState(s => {
      const bannedFactions = new Set(s.bannedFactions);
      bannedFactions.delete(factionId);
      return { ...s, bannedFactions };
    });
  }, []);

  const toggleLockHireling = useCallback(hirelingId => {
    setState(s => {
      const next = new Set(s.lockedHirelings);
      if (next.has(hirelingId)) next.delete(hirelingId); else next.add(hirelingId);
      return { ...s, lockedHirelings: next };
    });
  }, []);

  const banHireling = useCallback(hirelingId => {
    setState(s => {
      const bannedHirelings = new Set(s.bannedHirelings); bannedHirelings.add(hirelingId);
      const lockedHirelings = new Set(s.lockedHirelings); lockedHirelings.delete(hirelingId);
      const selectedHirelings = s.selectedHirelings.filter(id => id !== hirelingId);
      const hirelingStatuses  = s.hirelingStatuses.filter((_, i) => s.selectedHirelings[i] !== hirelingId);
      return { ...s, bannedHirelings, lockedHirelings, selectedHirelings, hirelingStatuses };
    });
  }, []);

  const unbanHireling = useCallback(hirelingId => {
    setState(s => {
      const bannedHirelings = new Set(s.bannedHirelings);
      bannedHirelings.delete(hirelingId);
      return { ...s, bannedHirelings };
    });
  }, []);

  // ── Share ─────────────────────────────────────────────────────────────────

  const share = useCallback(() => {
    setState(s => {
      const params = new URLSearchParams();
      params.set('expansions',  [...s.ownedExpansions].join(','));
      params.set('players',     String(s.playerCount));
      params.set('balance',     s.balanceMode);
      params.set('typebalance', String(s.requireBalance));
      params.set('difficulty',  [...s.difficulties].sort().join(','));
      if (s.selectedFactions.length)  params.set('factions',    s.selectedFactions.join(','));
      if (s.lockedFactions.size)      params.set('locked',      [...s.lockedFactions].join(','));
      if (s.bannedFactions.size)      params.set('banned',      [...s.bannedFactions].join(','));
      if (s.customMinReach !== null)  params.set('minreach',    String(s.customMinReach));
      if (s.customMaxReach !== null)  params.set('maxreach',    String(s.customMaxReach));
      if (s.allowedExclusions.size)   params.set('exclusions',  [...s.allowedExclusions].join(','));
      if (s.ownedAccessories.size)    params.set('accessories', [...s.ownedAccessories].join(','));
      if (s.selectedDeck)             params.set('deck',        s.selectedDeck);
      if (s.selectedHirelings.length) params.set('hirelings',  s.selectedHirelings.join(','));
      if (s.selectedLandmarks.length) params.set('landmarks',  s.selectedLandmarks.join(','));
      if (Object.keys(s.vagabondCharacters).length)
        params.set('characters', Object.entries(s.vagabondCharacters).map(([k, v]) => `${k}:${v}`).join(','));

      const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      navigator.clipboard.writeText(url).catch(() => {});
      return { ...s, copied: true };
    });
    setTimeout(() => setState(s => ({ ...s, copied: false })), 2000);
  }, []);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  return {
    state,
    actions: {
      toggleExpansion, setPlayerCount, setBotCount, setBalanceMode, setRequireBalance, setAvoidUnderdogs,
      toggleDifficulty, toggleMapDifficulty, toggleMapExpansion, toggleAccessory, setUseHirelings,
      setUseLandmarks, setLandmarkCount,
      setForceSuitRandomizationOnAutumn, setAllowOffSuitNatives,
      setAdvancedMode, setCustomMinReach, setCustomMaxReach, toggleAllowedExclusion,
      toggleExcludedMap, toggleExcludedHireling, toggleExcludedCharacter, toggleExcludedLandmark,
      randomize, rerollSingle, rerollMap, rerollDeck, rerollHirelings,
      rerollClearingSuits, rerollFloodMarkers, toggleClearingLock, clearAllClearingLocks,
      rerollSingleHireling, rerollLandmarks, rerollSingleLandmark, rerollVagabondCharacter,
      undo, redo, toggleLock, banFaction, unbanFaction,
      toggleLockHireling, banHireling, unbanHireling,
      share, clearError,
      resetAll: () => {
        localStorage.removeItem(LS_KEY);
        window.location.href = window.location.pathname;
      },
    },
  };
}
