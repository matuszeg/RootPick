import { FACTIONS, REACH_MINIMUMS, FACTION_MAP } from '../data/factions.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function conflictsWith(faction, others) {
  for (const other of others) {
    if (faction.excludes.includes(other.id)) return true;
    if (other.excludes.includes(faction.id)) return true;
    if (faction.vagabondVariant && other.vagabondVariant) return true;
  }
  return false;
}

export function generateCombination({
  playerCount,
  ownedExpansions,
  bannedFactions,
  lockedFactionIds,
  strictMode,
  requireBalance,
  difficulties,
}) {
  // Build pool
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

  // Filter pool: remove locked and anything excluded by locked
  const eligiblePool = pool.filter(f => {
    if (lockedFactionIds.includes(f.id)) return false;
    if (conflictsWith(f, lockedFactions)) return false;
    return true;
  });

  for (let attempt = 0; attempt < 100; attempt++) {
    const shuffled = shuffle(eligiblePool);
    const picked = [];

    for (const faction of shuffled) {
      if (picked.length >= slotsToFill) break;
      if (!conflictsWith(faction, picked)) {
        picked.push(faction);
      }
    }

    if (picked.length < slotsToFill) continue;

    const allSelected = [...lockedFactions, ...picked];
    const totalReach = allSelected.reduce((sum, f) => sum + f.reach, 0);
    const threshold = strictMode ? (REACH_MINIMUMS[playerCount] ?? 17) : 17;

    if (totalReach < threshold) continue;

    if (requireBalance) {
      const hasMilitant = allSelected.some(f => f.type === 'militant');
      const hasInsurgent = allSelected.some(f => f.type === 'insurgent');
      if (!hasMilitant || !hasInsurgent) continue;
    }

    return { factions: allSelected.map(f => f.id) };
  }

  return {
    error:
      'No valid combination found with your current settings. Try owning more expansions, relaxing the strictness, or turning off the type balance requirement.',
  };
}

export function computeReach(factionIds) {
  return factionIds.reduce((sum, id) => sum + (FACTION_MAP[id]?.reach ?? 0), 0);
}
