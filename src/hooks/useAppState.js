import { useState, useCallback, useEffect } from 'react';
import { generateCombination } from '../utils/randomizer.js';
import { decodeFromUrl } from '../utils/urlState.js';
import { FACTION_MAP } from '../data/factions.js';
import { MAPS } from '../data/maps.js';
import {
  DECKS, HIRELING_SETS, LANDMARKS, VAGABOND_CHARACTERS,
} from '../data/accessories.js';

function pickRandomMap(ownedExpansions) {
  const eligible = MAPS.filter(m => ownedExpansions.has(m.expansion));
  if (!eligible.length) return null;
  return eligible[Math.floor(Math.random() * eligible.length)].id;
}

function pickRandomDeck(ownedAccessories) {
  const eligible = DECKS.filter(d => d.accessory === null || ownedAccessories.has(d.accessory));
  if (!eligible.length) return 'standard';
  return eligible[Math.floor(Math.random() * eligible.length)].id;
}

function pickRandomHirelings(ownedExpansions, ownedAccessories, count = 3) {
  const eligible = HIRELING_SETS.filter(h => {
    if (h.source === 'marauder') return ownedExpansions.has('marauder');
    return ownedAccessories.has(h.source);
  });
  if (eligible.length < count) return eligible.map(h => h.id);
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(h => h.id);
}

function pickRandomLandmarks(ownedExpansions, ownedAccessories, count = 2) {
  const eligible = LANDMARKS.filter(l => {
    if (l.source === 'underworld') return ownedExpansions.has('underworld');
    return ownedAccessories.has(l.source);
  });
  if (!eligible.length) return [];
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, eligible.length)).map(l => l.id);
}

function pickVagabondCharacters(factionIds, ownedExpansions, ownedAccessories) {
  const vagabondIds = factionIds.filter(id => FACTION_MAP[id]?.vagabondVariant);
  if (!vagabondIds.length) return {};

  const availableChars = VAGABOND_CHARACTERS.filter(c => {
    if (c.source === 'base') return true;
    if (['riverfolk', 'underworld', 'marauder', 'homeland'].includes(c.source)) return ownedExpansions.has(c.source);
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
const MAX_HISTORY = 5;

function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ownedExpansions:   new Set(parsed.ownedExpansions   ?? ['base']),
      playerCount:       parsed.playerCount               ?? 4,
      balanceMode:       parsed.balanceMode               ?? 'balanced',
      requireBalance:    parsed.requireBalance            ?? true,
      difficulties:      new Set(parsed.difficulties      ?? [1, 2, 3]),
      advancedMode:      parsed.advancedMode              ?? false,
      customMinReach:    parsed.customMinReach            ?? null,
      customMaxReach:    parsed.customMaxReach            ?? null,
      allowedExclusions: new Set(parsed.allowedExclusions ?? []),
      ownedAccessories:  new Set(parsed.ownedAccessories  ?? []),
      useHirelings:      parsed.useHirelings              ?? false,
      useLandmarks:      parsed.useLandmarks              ?? false,
    };
  } catch {
    return null;
  }
}

function saveSettings(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      ownedExpansions:   [...state.ownedExpansions],
      playerCount:       state.playerCount,
      balanceMode:       state.balanceMode,
      requireBalance:    state.requireBalance,
      difficulties:      [...state.difficulties],
      advancedMode:      state.advancedMode,
      customMinReach:    state.customMinReach,
      customMaxReach:    state.customMaxReach,
      allowedExclusions: [...state.allowedExclusions],
      ownedAccessories:  [...state.ownedAccessories],
      useHirelings:      state.useHirelings,
      useLandmarks:      state.useLandmarks,
    }));
  } catch {}
}

function getInitialState() {
  const urlState    = decodeFromUrl();
  const savedSettings = loadSettings();

  const base = {
    ownedExpansions:   new Set(['base']),
    playerCount:       4,
    balanceMode:       'balanced',
    requireBalance:    true,
    difficulties:      new Set([1, 2, 3]),
    advancedMode:      false,
    customMinReach:    null,
    customMaxReach:    null,
    allowedExclusions: new Set(),
    ownedAccessories:  new Set(),
    useHirelings:      false,
    useLandmarks:      false,
    selectedFactions:  [],
    lockedFactions:    new Set(),
    bannedFactions:    new Set(),
    selectedMap:       null,
    selectedDeck:      null,
    selectedHirelings: [],
    selectedLandmarks: [],
    vagabondCharacters: {},
    history:           [],
    error:             null,
    copied:            false,
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
    state.ownedExpansions, state.playerCount, state.balanceMode,
    state.requireBalance, state.difficulties, state.advancedMode,
    state.customMinReach, state.customMaxReach, state.allowedExclusions,
    state.ownedAccessories, state.useHirelings, state.useLandmarks,
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
    setState(s => ({ ...s, playerCount: n, selectedFactions: [], lockedFactions: new Set(), error: null }));
  }, []);

  const setBalanceMode = useCallback(mode => {
    setState(s => ({ ...s, balanceMode: mode }));
  }, []);

  const setRequireBalance = useCallback(val => {
    setState(s => ({ ...s, requireBalance: val }));
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
        ownedExpansions:   s.ownedExpansions,
        bannedFactions:    s.bannedFactions,
        lockedFactionIds,
        balanceMode:       s.balanceMode,
        requireBalance:    s.requireBalance,
        difficulties:      s.difficulties,
        customMinReach:    s.customMinReach,
        customMaxReach:    s.customMaxReach,
        allowedExclusions: s.allowedExclusions,
      });

      if (result.error) return { ...s, error: result.error };

      const historyEntry = s.selectedFactions.length > 0
        ? { selectedFactions: s.selectedFactions, lockedFactions: new Set(s.lockedFactions), bannedFactions: new Set(s.bannedFactions) }
        : null;

      const newHistory = historyEntry
        ? [historyEntry, ...s.history].slice(0, MAX_HISTORY)
        : s.history;

      const newFactions = result.factions;

      return {
        ...s,
        selectedFactions:   newFactions,
        lockedFactions:     keepLocked ? s.lockedFactions : new Set(),
        selectedMap:        pickRandomMap(s.ownedExpansions),
        selectedDeck:       pickRandomDeck(s.ownedAccessories),
        selectedHirelings:  s.useHirelings ? pickRandomHirelings(s.ownedExpansions, s.ownedAccessories) : [],
        selectedLandmarks:  s.useLandmarks ? pickRandomLandmarks(s.ownedExpansions, s.ownedAccessories) : [],
        vagabondCharacters: pickVagabondCharacters(newFactions, s.ownedExpansions, s.ownedAccessories),
        history:            newHistory,
        error:              null,
      };
    });
  }, []);

  const rerollSingle = useCallback(factionId => {
    setState(s => {
      const otherSelected = s.selectedFactions.filter(id => id !== factionId);
      const tempBanned = new Set([...s.bannedFactions, ...otherSelected]);

      const result = generateCombination({
        playerCount: 1, ownedExpansions: s.ownedExpansions,
        bannedFactions: tempBanned, lockedFactionIds: [],
        balanceMode: 'chaos', requireBalance: false,
        difficulties: s.difficulties, allowedExclusions: s.allowedExclusions,
      });

      if (result.error) return { ...s, error: 'No replacement found for that faction.' };

      const newFactionId = result.factions[0];
      const newSelected  = s.selectedFactions.map(id => id === factionId ? newFactionId : id);

      // Re-pick vagabond character if needed
      const newChars = { ...s.vagabondCharacters };
      if (FACTION_MAP[factionId]?.vagabondVariant) delete newChars[factionId];
      if (FACTION_MAP[newFactionId]?.vagabondVariant && !newChars[newFactionId]) {
        const extra = pickVagabondCharacters([newFactionId], s.ownedExpansions, s.ownedAccessories);
        // Avoid character already in use by another vagabond
        const used = new Set(Object.values(newChars));
        const pick = Object.values(extra)[0];
        if (pick && !used.has(pick)) newChars[newFactionId] = pick;
      }

      const historyEntry = {
        selectedFactions: s.selectedFactions,
        lockedFactions: new Set(s.lockedFactions),
        bannedFactions: new Set(s.bannedFactions),
      };

      return {
        ...s,
        selectedFactions:   newSelected,
        vagabondCharacters: newChars,
        history: [historyEntry, ...s.history].slice(0, MAX_HISTORY),
        error: null,
      };
    });
  }, []);

  const rerollMap = useCallback(() => {
    setState(s => {
      const eligible = MAPS.filter(m => s.ownedExpansions.has(m.expansion) && m.id !== s.selectedMap);
      if (!eligible.length) return s;
      return { ...s, selectedMap: eligible[Math.floor(Math.random() * eligible.length)].id };
    });
  }, []);

  const rerollDeck = useCallback(() => {
    setState(s => {
      const eligible = DECKS.filter(d =>
        (d.accessory === null || s.ownedAccessories.has(d.accessory)) && d.id !== s.selectedDeck
      );
      if (!eligible.length) return s;
      return { ...s, selectedDeck: eligible[Math.floor(Math.random() * eligible.length)].id };
    });
  }, []);

  const rerollHirelings = useCallback(() => {
    setState(s => ({
      ...s,
      selectedHirelings: pickRandomHirelings(s.ownedExpansions, s.ownedAccessories),
    }));
  }, []);

  const rerollSingleHireling = useCallback(hirelingId => {
    setState(s => {
      const others = new Set(s.selectedHirelings.filter(id => id !== hirelingId));
      const eligible = HIRELING_SETS.filter(h => {
        if (others.has(h.id)) return false;
        if (h.source === 'marauder') return s.ownedExpansions.has('marauder');
        return s.ownedAccessories.has(h.source);
      });
      if (!eligible.length) return s;
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      return {
        ...s,
        selectedHirelings: s.selectedHirelings.map(id => id === hirelingId ? pick.id : id),
      };
    });
  }, []);

  const rerollLandmarks = useCallback(() => {
    setState(s => ({
      ...s,
      selectedLandmarks: pickRandomLandmarks(s.ownedExpansions, s.ownedAccessories),
    }));
  }, []);

  const rerollVagabondCharacter = useCallback(factionId => {
    setState(s => {
      const used = new Set(Object.entries(s.vagabondCharacters)
        .filter(([k]) => k !== factionId).map(([, v]) => v));
      const available = VAGABOND_CHARACTERS.filter(c => {
        if (used.has(c.id)) return false;
        if (c.id === s.vagabondCharacters[factionId]) return false;
        if (c.source === 'base') return true;
        if (['riverfolk', 'underworld', 'marauder', 'homeland'].includes(c.source)) return s.ownedExpansions.has(c.source);
        return s.ownedAccessories.has(c.source);
      });
      if (!available.length) return s;
      const pick = available[Math.floor(Math.random() * available.length)];
      return { ...s, vagabondCharacters: { ...s.vagabondCharacters, [factionId]: pick.id } };
    });
  }, []);

  const undo = useCallback(() => {
    setState(s => {
      if (s.history.length === 0) return s;
      const [prev, ...rest] = s.history;
      return { ...s, selectedFactions: prev.selectedFactions, lockedFactions: prev.lockedFactions, bannedFactions: prev.bannedFactions, history: rest, error: null };
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
      toggleExpansion, setPlayerCount, setBalanceMode, setRequireBalance,
      toggleDifficulty, toggleAccessory, setUseHirelings, setUseLandmarks,
      setAdvancedMode, setCustomMinReach, setCustomMaxReach, toggleAllowedExclusion,
      randomize, rerollSingle, rerollMap, rerollDeck, rerollHirelings,
      rerollSingleHireling, rerollLandmarks, rerollVagabondCharacter,
      undo, toggleLock, banFaction, unbanFaction, share, clearError,
    },
  };
}
