import { FACTION_MAP, REACH_MINIMUMS } from '../data/factions.js';

export default function ReachSummary({ selectedFactions, playerCount, strictMode }) {
  if (!selectedFactions.length) return null;

  const factions = selectedFactions.map(id => FACTION_MAP[id]).filter(Boolean);
  const totalReach = factions.reduce((sum, f) => sum + f.reach, 0);
  const threshold = strictMode ? (REACH_MINIMUMS[playerCount] ?? 17) : 17;
  const valid = totalReach >= threshold;

  const militants = factions.filter(f => f.type === 'militant').length;
  const insurgents = factions.filter(f => f.type === 'insurgent').length;

  return (
    <div className={`reach-summary ${valid ? 'valid' : 'invalid'}`}>
      <div className="reach-main">
        <span className="reach-total">
          Total Reach: <strong>{totalReach}</strong>
          <span className="reach-divider"> / </span>
          <span className="reach-needed">{threshold} needed</span>
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
