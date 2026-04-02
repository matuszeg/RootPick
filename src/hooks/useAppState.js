import { useState, useCallback, useEffect } from 'react';
import { generateCombination } from '../utils/randomizer.js';
import { decodeFromUrl } from '../utils/urlState.js';
import { FACTION_MAP } from '../data/factions.js';

const LS_KEY = 'rootpick_settings';
const MAX_HISTORY = 5;

function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ownedExpansions: new Set(parsed.ownedExpansions ?? ['base']),
      playerCount: parsed.playerCount ?? 4,
      strictMode: parsed.strictMode ?? true,
      requireBalance: parsed.requireBalance ?? true,
      difficulties: new Set(parsed.difficulties ?? [1, 2, 3]),
    };
  } catch {
    return null;
  }
}

function saveSettings(state) {
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        ownedExpansions: [...state.ownedExpansions],
        playerCount: state.playerCount,
        strictMode: state.strictMode,
        requireBalance: state.requireBalance,
        difficulties: [...state.difficulties],
      })
    );
  } catch {}
}

function getInitialState() {
  const urlState = decodeFromUrl();
  const savedSettings = loadSettings();

  const base = {
    ownedExpansions: new Set(['base']),
    playerCount: 4,
    strictMode: true,
    requireBalance: true,
    difficulties: new Set([1, 2, 3]),
    selectedFactions: [],
    lockedFactions: new Set(),
    bannedFactions: new Set(),
    history: [],
    error: null,
    copied: false,
  };

  // Apply saved settings first
  if (savedSettings) {
    Object.assign(base, savedSettings);
  }

  // URL params override everything (for sharing)
  if (Object.keys(urlState).length > 0) {
    Object.assign(base, urlState);
  }

  return base;
}

export function useAppState() {
  const [state, setState] = useState(getInitialState);

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    saveSettings(state);
  }, [
    state.ownedExpansions,
    state.playerCount,
    state.strictMode,
    state.requireBalance,
    state.difficulties,
  ]);

  // ── Settings ────────────────────────────────────────────────────────────

  const toggleExpansion = useCallback(id => {
    setState(s => {
      const next = new Set(s.ownedExpansions);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // Clear selection when expansions change (may have invalid factions now)
      return { ...s, ownedExpansions: next, selectedFactions: [], lockedFactions: new Set() };
    });
  }, []);

  const setPlayerCount = useCallback(n => {
    setState(s => ({
      ...s,
      playerCount: n,
      selectedFactions: [],
      lockedFactions: new Set(),
      error: null,
    }));
  }, []);

  const setStrictMode = useCallback(val => {
    setState(s => ({ ...s, strictMode: val }));
  }, []);

  const setRequireBalance = useCallback(val => {
    setState(s => ({ ...s, requireBalance: val }));
  }, []);

  const toggleDifficulty = useCallback(level => {
    setState(s => {
      const next = new Set(s.difficulties);
      if (next.has(level)) {
        if (next.size === 1) return s; // can't turn off all
        next.delete(level);
      } else {
        next.add(level);
      }
      return { ...s, difficulties: next, selectedFactions: [], error: null };
    });
  }, []);

  // ── Generation ───────────────────────────────────────────────────────────

  const randomize = useCallback(
    (keepLocked = false) => {
      setState(s => {
        const lockedFactionIds = keepLocked ? [...s.lockedFactions] : [];

        const result = generateCombination({
          playerCount: s.playerCount,
          ownedExpansions: s.ownedExpansions,
          bannedFactions: s.bannedFactions,
          lockedFactionIds,
          strictMode: s.strictMode,
          requireBalance: s.requireBalance,
          difficulties: s.difficulties,
        });

        if (result.error) {
          return { ...s, error: result.error };
        }

        // Push current selection to history (if it exists)
        const historyEntry =
          s.selectedFactions.length > 0
            ? {
                selectedFactions: s.selectedFactions,
                lockedFactions: new Set(s.lockedFactions),
                bannedFactions: new Set(s.bannedFactions),
              }
            : null;

        const newHistory = historyEntry
          ? [historyEntry, ...s.history].slice(0, MAX_HISTORY)
          : s.history;

        return {
          ...s,
          selectedFactions: result.factions,
          lockedFactions: keepLocked ? s.lockedFactions : new Set(),
          history: newHistory,
          error: null,
        };
      });
    },
    []
  );

  const rerollSingle = useCallback(factionId => {
    setState(s => {
      const lockedFactionIds = s.selectedFactions.filter(
        id => id !== factionId && s.lockedFactions.has(id)
      );
      // Treat all other currently selected (unlocked) factions as temporarily locked
      // to avoid picking them again — we want a fresh pick for this one slot
      const otherSelected = s.selectedFactions.filter(id => id !== factionId);
      const tempBanned = new Set([...s.bannedFactions, ...otherSelected]);

      const result = generateCombination({
        playerCount: 1,
        ownedExpansions: s.ownedExpansions,
        bannedFactions: tempBanned,
        lockedFactionIds: [],
        strictMode: false, // single slot — no meaningful reach check
        requireBalance: false,
        difficulties: s.difficulties,
      });

      if (result.error) {
        return { ...s, error: 'No replacement found for that faction.' };
      }

      const newFactionId = result.factions[0];
      const newSelected = s.selectedFactions.map(id =>
        id === factionId ? newFactionId : id
      );

      const historyEntry = {
        selectedFactions: s.selectedFactions,
        lockedFactions: new Set(s.lockedFactions),
        bannedFactions: new Set(s.bannedFactions),
      };

      return {
        ...s,
        selectedFactions: newSelected,
        history: [historyEntry, ...s.history].slice(0, MAX_HISTORY),
        error: null,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(s => {
      if (s.history.length === 0) return s;
      const [prev, ...rest] = s.history;
      return {
        ...s,
        selectedFactions: prev.selectedFactions,
        lockedFactions: prev.lockedFactions,
        bannedFactions: prev.bannedFactions,
        history: rest,
        error: null,
      };
    });
  }, []);

  // ── Card actions ─────────────────────────────────────────────────────────

  const toggleLock = useCallback(factionId => {
    setState(s => {
      const next = new Set(s.lockedFactions);
      if (next.has(factionId)) {
        next.delete(factionId);
      } else {
        next.add(factionId);
      }
      return { ...s, lockedFactions: next };
    });
  }, []);

  const banFaction = useCallback(factionId => {
    setState(s => {
      const bannedFactions = new Set(s.bannedFactions);
      bannedFactions.add(factionId);
      const lockedFactions = new Set(s.lockedFactions);
      lockedFactions.delete(factionId);
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

  // ── Share ────────────────────────────────────────────────────────────────

  const share = useCallback(() => {
    setState(s => {
      const params = new URLSearchParams();
      params.set('expansions', [...s.ownedExpansions].join(','));
      params.set('players', String(s.playerCount));
      params.set('strict', String(s.strictMode));
      params.set('balance', String(s.requireBalance));
      params.set('difficulty', [...s.difficulties].sort().join(','));
      if (s.selectedFactions.length)
        params.set('factions', s.selectedFactions.join(','));
      if (s.lockedFactions.size)
        params.set('locked', [...s.lockedFactions].join(','));
      if (s.bannedFactions.size)
        params.set('banned', [...s.bannedFactions].join(','));

      const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
      navigator.clipboard.writeText(url).catch(() => {});

      return { ...s, copied: true };
    });

    setTimeout(() => {
      setState(s => ({ ...s, copied: false }));
    }, 2000);
  }, []);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  return {
    state,
    actions: {
      toggleExpansion,
      setPlayerCount,
      setStrictMode,
      setRequireBalance,
      toggleDifficulty,
      randomize,
      rerollSingle,
      undo,
      toggleLock,
      banFaction,
      unbanFaction,
      share,
      clearError,
    },
  };
}
