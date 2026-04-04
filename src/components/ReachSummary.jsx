import { FACTION_MAP } from '../data/factions.js';
import { getReachThreshold } from '../utils/randomizer.js';
import { getWinRate } from '../data/winRates.js';

function getBalanceSignal(selectedFactions, playerCount) {
  // Only use human (non-bot) factions for balance signal
  const humanIds = selectedFactions.filter(id => !FACTION_MAP[id]?.isBot);
  if (humanIds.length < 2) return null;

  const rates = humanIds
    .map(id => getWinRate(id, playerCount))
    .filter(d => d !== null);

  // Need data for at least half the human factions to say anything meaningful
  if (rates.length < Math.ceil(humanIds.length / 2)) return null;

  const wrs = rates.map(d => d.wr);
  const spread = Math.max(...wrs) - Math.min(...wrs);
  const missingCount = humanIds.length - rates.length;

  // Classify spread
  let level, label, tip;
  if (spread < 0.10) {
    level = 'good';
    label = 'Balanced matchup';
    tip = `Win rates are within ${Math.round(spread * 100)}% of each other.`;
  } else if (spread < 0.20) {
    level = 'warn';
    label = 'Slightly uneven';
    tip = `Win rate spread is ${Math.round(spread * 100)}% — one faction may have an edge.`;
  } else {
    level = 'bad';
    label = 'Lopsided matchup';
    tip = `Win rate spread is ${Math.round(spread * 100)}% — consider re-rolling for a fairer game.`;
  }

  if (missingCount > 0) {
    tip += ` (${missingCount} faction${missingCount > 1 ? 's' : ''} lack data and are excluded from this calculation.)`;
  }

  return { level, label, tip, spread, dataCount: rates.length, totalCount: humanIds.length };
}

export default function ReachSummary({ selectedFactions, playerCount, balanceMode }) {
  if (!selectedFactions.length) return null;

  const factions = selectedFactions.map(id => FACTION_MAP[id]).filter(Boolean);
  const totalReach = factions.reduce((sum, f) => sum + f.reach, 0);
  const threshold = getReachThreshold(balanceMode, playerCount);
  const valid = threshold === 0 || totalReach >= threshold;

  const militants = factions.filter(f => f.type === 'militant').length;
  const insurgents = factions.filter(f => f.type === 'insurgent').length;

  const balance = getBalanceSignal(selectedFactions, playerCount);

  return (
    <div className={`reach-summary ${valid ? 'valid' : 'invalid'}`}>
      <div className="reach-main">
        <span className="reach-total">
          Total Reach: <strong>{totalReach}</strong>
          {threshold > 0 && (
            <>
              <span className="reach-divider"> / </span>
              <span className="reach-needed">{threshold} needed</span>
            </>
          )}
        </span>
        <span className="reach-status">{valid ? '✅' : '❌'}</span>
      </div>
      <div className="type-breakdown">
        <span className="type-count militant">⚔ Militants: {militants}</span>
        <span className="type-sep">·</span>
        <span className="type-count insurgent">🌿 Insurgents: {insurgents}</span>
      </div>
      {balance && (
        <div className={`balance-signal balance-signal--${balance.level}`} title={balance.tip}>
          <span className="balance-signal-icon">
            {balance.level === 'good' ? '◉' : balance.level === 'warn' ? '◎' : '○'}
          </span>
          <span className="balance-signal-label">{balance.label}</span>
          {balance.dataCount < balance.totalCount && (
            <span className="balance-signal-caveat">
              ({balance.dataCount}/{balance.totalCount} factions have data)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
