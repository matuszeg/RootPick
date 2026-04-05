import DieIcon from './DieIcon.jsx';

export default function ActionBar({ hasSelection, hasHistory, copied, actions }) {
  return (
    <div className="action-bar" role="toolbar" aria-label="Session actions">
      <button
        className="action-btn primary randomize-btn"
        onClick={() => actions.randomize(false)}
      >
        <span className="btn-icon"><DieIcon width={16} height={16} /></span>
        <span>Randomize</span>
      </button>

      <div className="action-bar-secondary">
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

        <button
          className="reset-link"
          onClick={actions.resetAll}
          title="Clear all settings and return to defaults"
        >
          ↺ Reset all settings
        </button>
      </div>
    </div>
  );
}
