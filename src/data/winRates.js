/**
 * Win rate data sourced from the Woodland Warriors Discord community spreadsheet.
 * Source: https://docs.google.com/spreadsheets/d/1yf1kZLdlWCSBdiROvzjIZt2Zay9ec7BzyIbdybI5NE4/
 * Standard Setup tab, snapshot April 2026.
 *
 * NOTE: The spreadsheet contains NO 2-player data. Breakdowns are 3p/4p/5p only.
 * Previous version of this file incorrectly labelled 3p data as 2p — corrected here.
 *
 * Keepers and Hundreds (Marauder expansion) have <10 total games recorded —
 * the expansion was too new when this data was compiled. Treated as no-data.
 *
 * Homeland factions (lilypad, twilight, knaves) are not tracked in this dataset.
 */

const MIN_GAMES = 50; // below this threshold, data is not statistically meaningful

export const WIN_RATES = {
  eyrie:     { overall: 0.229, n: 532,  p3: 0.320, p3n: 125, p4: 0.203, p4n: 295, p5: 0.219, p5n:  96 },
  marquise:  { overall: 0.221, n: 598,  p3: 0.342, p3n: 149, p4: 0.197, p4n: 346, p5: 0.092, p5n:  87 },
  alliance:  { overall: 0.301, n: 405,  p3: 0.430, p3n:  79, p4: 0.285, p4n: 228, p5: 0.247, p5n:  85 },
  lizard:    { overall: 0.198, n: 329,  p3: 0.286, p3n:  42, p4: 0.202, p4n: 193, p5: 0.173, p5n:  81 },
  riverfolk: { overall: 0.257, n: 331,  p3: 0.143, p3n:  35, p4: 0.273, p4n: 187, p5: 0.229, p5n:  96 },
  duchy:     { overall: 0.277, n: 282,  p3: 0.292, p3n:  48, p4: 0.267, p4n: 165, p5: 0.288, p5n:  59 },
  corvid:    { overall: 0.261, n: 222,  p3: 0.500, p3n:  26, p4: 0.281, p4n: 135, p5: 0.109, p5n:  55 },
  keepers:   { overall: null,  n:   5,  p3: null,  p3n:   2, p4: null,  p4n:   1, p5: null,  p5n:   1 },
  hundreds:  { overall: null,  n:   6,  p3: null,  p3n:   1, p4: null,  p4n:   2, p5: null,  p5n:   1 },
  vagabond1: { overall: 0.350, n: 391,  p3: 0.286, p3n:  35, p4: 0.390, p4n: 249, p5: 0.295, p5n:  95 },
  // No data: vagabond2, lilypad, twilight, knaves (too new or not tracked)
};

/**
 * Returns the best available win rate for a faction given a player count,
 * along with the sample size. Returns null if data is absent or below threshold.
 *
 * @returns {{ wr: number, n: number, playerCountSpecific: boolean } | null}
 */
export function getWinRate(factionId, playerCount) {
  const data = WIN_RATES[factionId];
  if (!data) return null;

  // Try player-count-specific data first
  const pcKey  = playerCount === 3 ? 'p3' : playerCount === 4 ? 'p4' : playerCount === 5 ? 'p5' : null;
  const pcNKey = playerCount === 3 ? 'p3n' : playerCount === 4 ? 'p4n' : playerCount === 5 ? 'p5n' : null;

  if (pcKey && data[pcKey] !== null && data[pcNKey] >= MIN_GAMES) {
    return { wr: data[pcKey], n: data[pcNKey], playerCountSpecific: true };
  }

  // Fall back to overall
  if (data.overall !== null && data.n >= MIN_GAMES) {
    return { wr: data.overall, n: data.n, playerCountSpecific: false };
  }

  return null;
}
