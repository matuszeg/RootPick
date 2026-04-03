import { FACTION_MAP } from '../data/factions.js';
import { getReachThreshold } from '../utils/randomizer.js';

export default function ReachSummary({ selectedFactions, playerCount, balanceMode }) {
  if (!selectedFactions.length) return null;

  const factions = selectedFactions.map(id => FACTION_MAP[id]).filter(Boolean);
  const totalReach = factions.reduce((sum, f) => sum + f.reach, 0);
  const threshold = getReachThreshold(balanceMode, playerCount);
  const valid = threshold === 0 || totalReach >= threshold;

  const militants = factions.filter(f => f.type === 'militant').length;
  const insurgents = factions.filter(f => f.type === 'insurgent').length;

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
    </div>
  );
}
