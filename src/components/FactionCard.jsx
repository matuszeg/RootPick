import { useState, useRef } from 'react';
import { FACTION_MAP } from '../data/factions.js';
import { CHARACTER_MAP } from '../data/accessories.js';
import { getWinRate, WIN_RATES } from '../data/winRates.js';
import FactionIcon from './FactionIcon.jsx';

const EXPANSION_LABELS = {
  base: 'Base',
  riverfolk: 'Riverfolk',
  underworld: 'Underworld',
  marauder: 'Marauder',
  homeland: 'Homeland',
  clockwork: 'Clockwork',
  clockwork2: 'Clockwork 2',
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

export default function FactionCard({ factionId, locked, onLock, onReroll, canReroll = true, onBan, animIndex, browseMode, mapNote, vagabondCharacter, onRerollCharacter, playerCount }) {
  const faction = FACTION_MAP[factionId];
  if (!faction) return null;

  const [lockSnap, setLockSnap] = useState(false);
  const lockSnapTimer = useRef(null);
  const [flipPhase, setFlipPhase] = useState(null); // null | 'out' | 'in'
  const flipTimer = useRef(null);
  const [banning, setBanning] = useState(false);

  function handleLock() {
    clearTimeout(lockSnapTimer.current);
    setLockSnap(true);
    lockSnapTimer.current = setTimeout(() => setLockSnap(false), 220);
    onLock();
  }

  function handleReroll() {
    clearTimeout(flipTimer.current);
    setFlipPhase('out');
    flipTimer.current = setTimeout(() => {
      onReroll();
      setFlipPhase('in');
      flipTimer.current = setTimeout(() => setFlipPhase(null), 180);
    }, 150);
  }

  function handleBan() {
    setBanning(true);
    setTimeout(() => onBan(), 360);
  }

  const headerBg = faction.color;
  const headerText = isDark(headerBg) ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.80)';
  const headerMuted = isDark(headerBg) ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';

  const wrData = faction.isBot ? null : getWinRate(factionId, playerCount);
  // Show "No data" label for non-bot factions — either tracked with insufficient games, or not tracked yet
  const showWrRow = !faction.isBot && playerCount != null;
  const wrColor = wrData === null ? null
    : wrData.wr >= 0.30 ? '#5cad78'
    : wrData.wr >= 0.20 ? '#c8a832'
    : '#c85040';

  return (
    <div
      className={`faction-card ${locked ? 'locked' : ''} type-${faction.type} ${banning ? 'banning' : ''} ${flipPhase ? `flip-${flipPhase}` : ''}`}
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
              {faction.isBot && (
                <span className="bot-badge" style={{ color: headerMuted, borderColor: headerMuted }}>
                  ⚙ Bot
                </span>
              )}
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
        {showWrRow && (
          <div className="faction-wr-row">
            <span className="faction-wr-label">
              Win rate{wrData?.playerCountSpecific ? ` (${playerCount}p)` : ''}
            </span>
            {wrData !== null ? (
              <span className="faction-wr-value" style={{ color: wrColor }} title={`${wrData.n} games · community data`}>
                {Math.round(wrData.wr * 100)}%
                {!wrData.playerCountSpecific && <span className="faction-wr-qualifier"> avg</span>}
              </span>
            ) : (
              <span className="faction-wr-nodata" title="Not enough recorded games to show a reliable win rate">
                No data
              </span>
            )}
          </div>
        )}
        {vagabondCharacter && CHARACTER_MAP[vagabondCharacter] && (
          <div className="vagabond-character">
            <span className="vagabond-character-label">Character</span>
            <span className="vagabond-character-name">{CHARACTER_MAP[vagabondCharacter].name}</span>
            {onRerollCharacter && (
              <button
                className="vagabond-reroll-char"
                onClick={onRerollCharacter}
                title="Re-roll character"
                aria-label="Re-roll vagabond character"
              >
                🔄
              </button>
            )}
          </div>
        )}
        {mapNote && (
          <p className="map-note">{mapNote}</p>
        )}
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
                className={`card-btn lock-btn ${locked ? 'active' : ''} ${lockSnap ? 'snapping' : ''}`}
                onClick={handleLock}
                title={locked ? 'Unlock — this faction will be replaced on re-roll' : 'Lock — keep this faction when re-rolling'}
                aria-label={locked ? 'Unlock faction' : 'Lock faction'}
                style={locked ? { '--btn-active-color': faction.color } : {}}
              >
                {locked ? '🔒' : '🔓'}
                <span>{locked ? 'Locked' : 'Lock'}</span>
              </button>
              <button
                className="card-btn reroll-btn"
                onClick={handleReroll}
                title={!canReroll ? 'No other eligible factions available — expand your pool or change difficulty filters' : locked ? 'Unlock to re-roll' : 'Re-roll just this faction'}
                aria-label="Re-roll"
                disabled={locked || !canReroll}
              >
                🔄 <span>Re-roll</span>
              </button>
            </>
          )}
          <button
            className="card-btn ban-btn"
            onClick={handleBan}
            title="Remove this faction from the pool for this session"
            aria-label="Ban"
            disabled={!browseMode && locked}
          >
            🚫 <span>Ban</span>
          </button>
        </div>
      </div>
    </div>
  );
}
