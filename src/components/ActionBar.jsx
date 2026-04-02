export default function ActionBar({ hasSelection, hasHistory, copied, actions }) {
  return (
    <div className="action-bar">
      <button
        className="action-btn primary randomize-btn"
        onClick={() => actions.randomize(false)}
      >
        <span className="btn-icon">🎲</span>
        <span>Randomize</span>
      </button>

      <button
        className="action-btn secondary"
        onClick={() => actions.randomize(true)}
        disabled={!hasSelection}
        title="Re-roll unlocked factions only"
      >
        <span className="btn-icon">🔁</span>
        <span>Re-roll Unlocked</span>
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
  );
}
