import { HIRELING_MAP } from '../data/accessories.js';
import DieIcon from './DieIcon.jsx';
import LockIcon from './LockIcon.jsx';

const SOURCE_LABELS = {
  marauder_hirelings_base: 'Marauder Expansion',
  marauder_hirelings:      'Marauder Pack',
  riverfolk_hirelings:  'Riverfolk Pack',
  underworld_hirelings: 'Underworld Pack',
  homeland_hirelings:   'Homeland Pack',
};

export default function HirelingCard({ hirelingId, index, status, locked, onReroll, onLock, onBan }) {
  const hireling = HIRELING_MAP[hirelingId];
  if (!hireling) return null;

  const showingPromoted = status === 'promoted';

  const activeImg  = showingPromoted ? hireling.promotedImg : hireling.demotedImg;
  const activeName = showingPromoted ? hireling.promoted    : hireling.demoted;
  const activeSide = showingPromoted ? 'promoted'           : 'demoted';

  return (
    <div
      className={`hireling-card ${locked ? 'locked' : ''}`}
      style={{ '--anim-delay': `${index * 60}ms` }}
    >
      {/* Card image */}
      <div className="hireling-flip-wrapper">
        <img
          src={activeImg}
          alt={activeName}
          className="hireling-card-img"
          draggable={false}
        />
        <div className={`hireling-side-pill ${activeSide}`}>
          {showingPromoted ? '▲ Promoted' : '▽ Demoted'}
        </div>
      </div>

      {/* Action bar */}
      <div className="hireling-action-bar">
        <div className="hireling-action-bar-left">
          <span className="hireling-active-name">{activeName}</span>
          <span className="hireling-source-label">{SOURCE_LABELS[hireling.source] ?? hireling.source}</span>
        </div>
        <div className="hireling-action-bar-right">
          <button
            className={`hireling-btn hireling-lock-btn ${locked ? 'active' : ''}`}
            onClick={onLock}
            title={locked ? 'Unlock this hireling' : 'Lock this hireling'}
            aria-label={locked ? 'Unlock hireling' : 'Lock hireling'}
          >
            <LockIcon locked={locked} />
          </button>
          <button
            className="hireling-btn hireling-reroll-btn"
            onClick={onReroll}
            title="Re-roll this hireling"
            aria-label="Re-roll hireling"
            disabled={locked}
          >
            <DieIcon />
          </button>
          <button
            className="hireling-btn hireling-ban-btn"
            onClick={onBan}
            title="Ban this hireling from the pool"
            aria-label="Ban hireling"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
