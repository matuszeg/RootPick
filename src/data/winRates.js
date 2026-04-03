/**
 * Win rate data sourced from the Woodland Warriors Discord community spreadsheet.
 * Source: https://docs.google.com/spreadsheets/d/1yf1kZLdlWCSBdiROvzjIZt2Zay9ec7BzyIbdybI5NE4/
 * Standard Setup tab, snapshot April 2026.
 *
 * overall: win rate across all game counts (from spreadsheet header row)
 * p2: win rate in 2-player games specifically
 * null = insufficient data for that player count
 *
 * Game counts for 2p entries (sample sizes):
 *   marquise: 149g, eyrie: 125g, alliance: 79g, lizard: 42g,
 *   duchy: 48g, vagabond1: 35g, riverfolk: 35g
 *
 * Note: corvid, keepers, hundreds, vagabond2 lack tracked 2p data in this snapshot.
 * Note: Keepers overall WR appears as 0.0% in spreadsheet — likely incomplete data.
 */
export const WIN_RATES = {
  eyrie:     { overall: 0.229, p2: 0.320 },
  marquise:  { overall: 0.221, p2: 0.342 },
  alliance:  { overall: 0.301, p2: 0.430 },
  lizard:    { overall: 0.198, p2: 0.286 },
  riverfolk: { overall: 0.257, p2: 0.143 },
  duchy:     { overall: 0.277, p2: 0.292 },
  corvid:    { overall: 0.261, p2: null  },
  keepers:   { overall: null,  p2: null  },
  hundreds:  { overall: 0.167, p2: null  },
  vagabond1: { overall: 0.350, p2: 0.286 },
  vagabond2: { overall: null,  p2: null  },
};

/**
 * Returns the best available win rate for a faction given a player count.
 * Prefers player-count-specific data; falls back to overall.
 */
export function getWinRate(factionId, playerCount) {
  const data = WIN_RATES[factionId];
  if (!data) return null;
  if (playerCount === 2 && data.p2 !== null) return data.p2;
  return data.overall ?? null;
}
