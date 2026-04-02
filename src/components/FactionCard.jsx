import { FACTION_MAP } from '../data/factions.js';
import FactionIcon from './FactionIcon.jsx';

const EXPANSION_LABELS = {
  base: 'Base',
  riverfolk: 'Riverfolk',
  underworld: 'Underworld',
  marauder: 'Marauder',
  homeland: 'Homeland',
};

function Stars({ count }) {
  return (
    <span className="stars" aria-label={`Difficulty: ${count} of 3`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={i < count ? 'star filled' : 'star empty'}>
          ★
        </span>
      ))}
    </span>
  );
}

// Decide whether to use white or dark text on a given hex background
function isDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Perceived luminance
  return (r * 299 + g * 587 + b * 114) / 1000 < 155;
}

export default function FactionCard({ factionId, locked, onLock, onReroll, onBan, animIndex, browseMode }) {
  const faction = FACTION_MAP[factionId];
  if (!faction) return null;

  const headerBg = faction.color;
  const headerText = isDark(headerBg) ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.80)';
  const headerMuted = isDark(headerBg) ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';

  return (
    <div
      className={`faction-card ${locked ? 'locked' : ''} type-${faction.type}`}
      style={{
        '--anim-delay': `${animIndex * 60}ms`,
        '--faction-color': headerBg,
        '--faction-locked-glow': `${headerBg}55`,
      }}
    >
      <div
        className="card-header"
        style={{ background: headerBg, color: headerText }}
      >
        <div className="card-header-left">
          <FactionIcon factionId={factionId} className="card-faction-icon" />
          <div className="card-header-meta">
            <div className="card-badges">
              <span className="type-badge" style={{ color: headerMuted, borderColor: headerMuted }}>
                {faction.type === 'militant' ? 'Militant' : 'Insurgent'}
              </span>
              <span className="exp-badge" style={{ color: headerMuted }}>
                {EXPANSION_LABELS[faction.expansion]}
              </span>
            </div>
          </div>
        </div>
        <div className="reach-block">
          <span className="reach-value">{faction.reach}</span>
          <span className="reach-label-sm" style={{ color: headerMuted }}>reach</span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="faction-name">{faction.name}</h3>
        <p className="faction-flavor">{faction.flavor}</p>
        {browseMode && faction.excludes.length > 0 && (
          <p className="faction-conflict">
            ⚠ Excludes:{' '}
            {faction.excludes.map(id => FACTION_MAP[id]?.name ?? id).join(', ')}
          </p>
        )}
      </div>

      <div className="card-footer">
        <Stars count={faction.difficulty} />
        <div className="card-actions">
          {!browseMode && (
            <>
              <button
                className={`card-btn lock-btn ${locked ? 'active' : ''}`}
                onClick={onLock}
                title={locked ? 'Unlock this faction' : 'Lock this faction (keep on re-roll)'}
                aria-label={locked ? 'Unlock' : 'Lock'}
                style={locked ? { '--btn-active-color': faction.color } : {}}
              >
                {locked ? '🔒' : '🔓'}
              </button>
              <button
                className="card-btn reroll-btn"
                onClick={onReroll}
                title="Re-roll just this faction"
                aria-label="Re-roll"
                disabled={locked}
              >
                🔄
              </button>
            </>
          )}
          <button
            className="card-btn ban-btn"
            onClick={onBan}
            title="Ban this faction for the session"
            aria-label="Ban"
            disabled={!browseMode && locked}
          >
            🚫
          </button>
        </div>
      </div>
    </div>
  );
}
