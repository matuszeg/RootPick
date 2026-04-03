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

export function getReachThreshold(balanceMode, totalCount) {
  if (balanceMode === 'chaos') return 0;
  if (balanceMode === 'standard') return 17;
  // balanced — official minimums
  return REACH_MINIMUMS[totalCount] ?? 17;
}

export function generateCombination({
  playerCount,        // human players
  botCount = 0,       // bot players
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
  const totalCount = playerCount + botCount;

  // Human pool: non-bot factions passing all filters
  const humanPool = FACTIONS.filter(
    f =>
      !f.isBot &&
      ownedExpansions.has(f.expansion) &&
      (!f.requiresExpansion || ownedExpansions.has(f.requiresExpansion)) &&
      !bannedFactions.has(f.id) &&
      difficulties.has(f.difficulty)
  );

  // Bot pool: bot factions (skip difficulty filter)
  const botPool = FACTIONS.filter(
    f =>
      f.isBot &&
      ownedExpansions.has(f.expansion) &&
      (!f.requiresExpansion || ownedExpansions.has(f.requiresExpansion)) &&
      !bannedFactions.has(f.id)
  );

  const lockedFactions = lockedFactionIds.map(id => FACTION_MAP[id]).filter(Boolean);
  const lockedBots = lockedFactions.filter(f => f.isBot);
  const lockedHumans = lockedFactions.filter(f => !f.isBot);

  const botSlotsToFill = botCount - lockedBots.length;
  const humanSlotsToFill = playerCount - lockedHumans.length;

  if (botSlotsToFill < 0 || humanSlotsToFill < 0) {
    return {
      error:
        'More factions are locked than the current player count allows. Reduce locked factions or increase player count.',
    };
  }

  const eligibleBotPool = botPool.filter(f => !lockedFactionIds.includes(f.id));
  const eligibleHumanPool = humanPool.filter(
    f => !lockedFactionIds.includes(f.id) && !conflictsWith(f, lockedHumans, allowedExclusions)
  );

  const baseThreshold = getReachThreshold(balanceMode, totalCount);
  const minReach = customMinReach !== null ? customMinReach : baseThreshold;
  const maxReach = customMaxReach !== null ? customMaxReach : Infinity;

  for (let attempt = 0; attempt < 100; attempt++) {
    // Pick bots first
    const shuffledBots = shuffle(eligibleBotPool);
    const pickedBots = [];
    for (const faction of shuffledBots) {
      if (pickedBots.length >= botSlotsToFill) break;
      if (!conflictsWith(faction, [...lockedBots, ...pickedBots], allowedExclusions)) {
        pickedBots.push(faction);
      }
    }
    if (pickedBots.length < botSlotsToFill) continue;

    const allBots = [...lockedBots, ...pickedBots];

    // Pick humans (must not conflict with bots or each other)
    const humanCandidates = eligibleHumanPool.filter(
      f => !conflictsWith(f, allBots, allowedExclusions)
    );
    const shuffledHumans = shuffle(humanCandidates);
    const pickedHumans = [];
    for (const faction of shuffledHumans) {
      if (pickedHumans.length >= humanSlotsToFill) break;
      if (!conflictsWith(faction, [...lockedHumans, ...pickedHumans], allowedExclusions)) {
        pickedHumans.push(faction);
      }
    }
    if (pickedHumans.length < humanSlotsToFill) continue;

    const allSelected = [...lockedFactions, ...pickedBots, ...pickedHumans];
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
