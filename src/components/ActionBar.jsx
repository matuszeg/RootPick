import DieIcon from './DieIcon.jsx';

export default function ActionBar({ hasSelection, hasLockedFactions, hasHistory, copied, actions }) {
  return (
    <div className="action-bar" role="toolbar" aria-label="Session actions">
      <button
        className="action-btn primary randomize-btn"
        onClick={() => actions.randomize(false)}
      >
        <span className="btn-icon">🎲</span>
        <span>Randomize</span>
      </button>

      <div className="action-bar-secondary">
        <button
          className="action-btn secondary"
          onClick={() => actions.randomize(true)}
          disabled={!hasSelection}
          title={!hasLockedFactions ? 'Lock a faction card first, then use this to re-roll everything else' : 'Keep locked factions, re-roll the rest'}
        >
          <span className="btn-icon"><DieIcon width={16} height={16} /></span>
          <span>Re-roll unlocked</span>
        </button>

        <button
          className="action-btn secondary"
          onClick={actions.undo}
          disabled={!hasHistory}
          title="Undo last randomize"
        >
          <span className="btn-icon">↩️</span>
          <span>Undo</span>
        </button>

        <button
          className={`action-btn secondary share-btn ${copied ? 'copied' : ''}`}
          onClick={actions.share}
          disabled={!hasSelection}
          title="Copy shareable link to clipboard"
        >
          <span className="btn-icon">{copied ? '✓' : '🔗'}</span>
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>

      <button
        className="reset-link"
        onClick={actions.resetAll}
        title="Clear all settings and return to defaults"
      >
        ↺ Reset all settings
      </button>
    </div>
  );
}
