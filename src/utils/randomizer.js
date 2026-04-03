import { FACTIONS, REACH_MINIMUMS, FACTION_MAP } from '../data/factions.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function conflictsWith(faction, others, allowedExclusions = new Set()) {
  for (const other of others) {
    const pairKey = [faction.id, other.id].sort().join('+');
    if (allowedExclusions.has(pairKey)) continue;
    if (faction.excludes.includes(other.id)) return true;
    if (other.excludes.includes(faction.id)) return true;
    // Two vagabonds are allowed — vagabond2 only enters the pool when Riverfolk
    // is owned, which is the exact condition that permits double-vagabond play.
  }
  return false;
}

export function getReachThreshold(balanceMode, playerCount) {
  if (balanceMode === 'chaos') return 0;
  if (balanceMode === 'standard') return 17;
  // balanced — official minimums
  return REACH_MINIMUMS[playerCount] ?? 17;
}

export function generateCombination({
  playerCount,
  ownedExpansions,
  bannedFactions,
  lockedFactionIds,
  balanceMode = 'balanced',
  requireBalance,
  difficulties,
  customMinReach = null,
  customMaxReach = null,
  allowedExclusions = new Set(),
}) {
  const pool = FACTIONS.filter(
    f =>
      ownedExpansions.has(f.expansion) &&
      !bannedFactions.has(f.id) &&
      difficulties.has(f.difficulty)
  );

  const lockedFactions = lockedFactionIds
    .map(id => FACTION_MAP[id])
    .filter(Boolean);

  const slotsToFill = playerCount - lockedFactions.length;

  if (slotsToFill < 0) {
    return {
      error:
        'More factions are locked than the current player count allows. Reduce locked factions or increase player count.',
    };
  }

  const eligiblePool = pool.filter(f => {
    if (lockedFactionIds.includes(f.id)) return false;
    if (conflictsWith(f, lockedFactions, allowedExclusions)) return false;
    return true;
  });

  const baseThreshold = getReachThreshold(balanceMode, playerCount);
  const minReach = customMinReach !== null ? customMinReach : baseThreshold;
  const maxReach = customMaxReach !== null ? customMaxReach : Infinity;

  for (let attempt = 0; attempt < 100; attempt++) {
    const shuffled = shuffle(eligiblePool);
    const picked = [];

    for (const faction of shuffled) {
      if (picked.length >= slotsToFill) break;
      if (!conflictsWith(faction, picked, allowedExclusions)) {
        picked.push(faction);
      }
    }

    if (picked.length < slotsToFill) continue;

    const allSelected = [...lockedFactions, ...picked];
    const totalReach = allSelected.reduce((sum, f) => sum + f.reach, 0);

    if (totalReach < minReach) continue;
    if (totalReach > maxReach) continue;

    if (requireBalance) {
      const hasMilitant = allSelected.some(f => f.type === 'militant');
      const hasInsurgent = allSelected.some(f => f.type === 'insurgent');
      if (!hasMilitant || !hasInsurgent) continue;
    }

    return { factions: allSelected.map(f => f.id) };
  }

  return {
    error:
      'No valid combination found with your current settings. Try owning more expansions, relaxing the balance mode, or turning off the type balance requirement.',
  };
}

export function computeReach(factionIds) {
  return factionIds.reduce((sum, id) => sum + (FACTION_MAP[id]?.reach ?? 0), 0);
}
