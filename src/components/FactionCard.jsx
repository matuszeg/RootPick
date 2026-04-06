import { useState, useRef } from 'react';
import { FACTION_MAP } from '../data/factions.js';
import { CHARACTER_MAP } from '../data/accessories.js';
import { getWinRate } from '../data/winRates.js';
import { getBoardImages, getHeadImage } from '../data/factionImages.js';
import DieIcon from './DieIcon.jsx';
import LockIcon from './LockIcon.jsx';
import { XIcon, StarIcon } from './Icons.jsx';

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
    <span className="fc-stars" aria-label={`Difficulty: ${count} of 3`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={i < count ? 'fc-star filled' : 'fc-star empty'}>
          <StarIcon width={11} height={11} filled={i < count} />
        </span>
      ))}
    </span>
  );
}

function isDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 155;
}

export default function FactionCard({ factionId, locked, onLock, onReroll, canReroll = true, onBan, animIndex, browseMode, mapNote, vagabondCharacter, onRerollCharacter, playerCount, onBoardClick }) {
  const faction = FACTION_MAP[factionId];
  if (!faction) return null;

  const [flipPhase, setFlipPhase] = useState(null);
  const flipTimer = useRef(null);
  const [banning, setBanning] = useState(false);
  const [showingFront, setShowingFront] = useState(true);

  const boardImages = getBoardImages(factionId);
  const headImg = getHeadImage(factionId);
  const hasBack = boardImages?.back != null;
  const activeBoardSrc = showingFront ? boardImages?.front : boardImages?.back;

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

  function handleBoardFlip(e) {
    e.stopPropagation();
    if (hasBack) setShowingFront(f => !f);
  }

  const headerBg = faction.color;
  const headerText = isDark(headerBg) ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.80)';
  const headerMuted = isDark(headerBg) ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';

  const wrData = faction.isBot ? null : getWinRate(factionId, playerCount);
  const showWrRow = !faction.isBot && playerCount != null;
  const wrColor = wrData === null ? null
    : wrData.wr >= 0.30 ? '#5cad78'
    : wrData.wr >= 0.20 ? '#c8a832'
    : '#c85040';

  return (
    <div
      className={`fc ${locked ? 'fc--locked' : ''} ${banning ? 'fc--banning' : ''} ${flipPhase ? `fc--flip-${flipPhase}` : ''}`}
      style={{
        '--anim-delay': `${animIndex * 60}ms`,
        '--faction-color': headerBg,
        '--faction-locked-glow': `${headerBg}55`,
      }}
    >
      {/* Board image hero */}
      {activeBoardSrc && (
        <div className="fc-board-wrap" onClick={() => onBoardClick?.(boardImages, faction.name)}>
          <img
            src={activeBoardSrc}
            alt={`${faction.name} board`}
            className="fc-board-img"
            draggable={false}
          />
          <div className="fc-board-overlay">
            <span className="fc-board-zoom-hint">Click to enlarge</span>
          </div>
          {hasBack && (
            <button
              className="fc-board-flip-btn"
              onClick={handleBoardFlip}
              title={`Show ${showingFront ? 'back' : 'front'} of board`}
              aria-label="Flip board"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d="M1 4v6h6" />
                <path d="M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
            </button>
          )}
          {hasBack && (
            <div className="fc-board-side-pill">
              {showingFront ? 'Front' : 'Back'}
            </div>
          )}
        </div>
      )}

      {/* Info bar — colored stripe with head, name, badges, reach */}
      <div className="fc-info" style={{ background: headerBg, color: headerText }}>
        {headImg && (
          <img src={headImg} alt="" className="fc-head" draggable={false} />
        )}
        <div className="fc-info-text">
          <span className="fc-name">{faction.name}</span>
          <div className="fc-badges">
            <span className="fc-type-badge" style={{ color: headerMuted, borderColor: headerMuted }}>
              {faction.type === 'militant' ? 'Militant' : 'Insurgent'}
            </span>
            <span className="fc-exp-badge" style={{ color: headerMuted }}>
              {EXPANSION_LABELS[faction.expansion]}
            </span>
            <Stars count={faction.difficulty} />
          </div>
        </div>
        <div className="fc-reach">
          <span className="fc-reach-value">{faction.reach}</span>
          <span className="fc-reach-label" style={{ color: headerMuted }}>reach</span>
        </div>
      </div>

      {/* Details section */}
      <div className="fc-details">
        <p className="fc-flavor">{faction.flavor}</p>
        {showWrRow && (
          <div className="fc-wr-row">
            <span className="fc-wr-label">
              Win rate{wrData?.playerCountSpecific ? ` (${playerCount}p)` : ''}
            </span>
            {wrData !== null ? (
              <span className="fc-wr-value" style={{ color: wrColor }} title={`${wrData.n} games · community data`}>
                {Math.round(wrData.wr * 100)}%
                {!wrData.playerCountSpecific && <span className="fc-wr-qualifier"> avg</span>}
              </span>
            ) : (
              <span className="fc-wr-nodata" title="Not enough recorded games to show a reliable win rate">
                No data
              </span>
            )}
          </div>
        )}
        {vagabondCharacter && CHARACTER_MAP[vagabondCharacter] && (() => {
          const char = CHARACTER_MAP[vagabondCharacter];
          const SOURCE_LABEL = { base: 'Base Game', riverfolk_characters: 'Riverfolk', vagabond_pack: 'Vagabond Pack', homeland_characters: 'Homeland' };
          return (
            <div
              className="fc-vagabond-row"
              onClick={() => onBoardClick?.({ front: char.cardImg, back: null }, char.name)}
              title="View character card"
            >
              <img
                src={char.faceImg}
                alt={char.name}
                className="fc-vagabond-face"
              />
              <div className="fc-vagabond-info">
                <span className="fc-vagabond-name">{char.name}</span>
                <span className="fc-vagabond-source">{SOURCE_LABEL[char.source] ?? char.source}</span>
              </div>
              {onRerollCharacter && (
                <button
                  className="fc-vagabond-reroll"
                  onClick={e => { e.stopPropagation(); onRerollCharacter(); }}
                  title="Re-roll character"
                  aria-label="Re-roll vagabond character"
                >
                  <DieIcon width={13} height={13} />
                </button>
              )}
            </div>
          );
        })()}
        {mapNote && <p className="fc-map-note">{mapNote}</p>}
        {browseMode && faction.excludes.length > 0 && (
          <p className="fc-conflict">
            ⚠ Excludes:{' '}
            {faction.excludes.map(id => FACTION_MAP[id]?.name ?? id).join(', ')}
          </p>
        )}
      </div>

      {/* Action bar */}
      {!browseMode && (
        <div className="fc-actions">
          <button
            className={`fc-btn fc-lock-btn ${locked ? 'active' : ''}`}
            onClick={onLock}
            title={locked ? 'Unlock — this faction will be replaced on re-roll' : 'Lock — keep this faction when re-rolling'}
            aria-label={locked ? 'Unlock faction' : 'Lock faction'}
            style={locked ? { '--btn-active-color': faction.color } : {}}
          >
            <LockIcon locked={locked} />
          </button>
          <button
            className="fc-btn fc-reroll-btn"
            onClick={handleReroll}
            title={!canReroll ? 'No other eligible factions available' : locked ? 'Unlock to re-roll' : 'Re-roll just this faction'}
            aria-label="Re-roll"
            disabled={locked || !canReroll}
          >
            <DieIcon />
          </button>
          <button
            className="fc-btn fc-ban-btn"
            onClick={handleBan}
            title="Ban from pool"
            aria-label="Ban faction"
            disabled={locked}
          >
            <XIcon width={12} height={12} />
          </button>
        </div>
      )}
    </div>
  );
}
