import { EXPANSIONS, REACH_MINIMUMS } from '../data/factions.js';

function InfoIcon({ tip }) {
  return (
    <span className="info-icon" title={tip} aria-label={tip}>
      ?
    </span>
  );
}

export default function SetupPanel({ state, actions }) {
  const { ownedExpansions, playerCount, strictMode, requireBalance, difficulties } = state;
  const threshold = strictMode ? (REACH_MINIMUMS[playerCount] ?? 17) : 17;

  return (
    <aside className="setup-panel">
      <div className="setup-section">
        <h2 className="setup-heading">Expansions Owned</h2>
        <div className="expansion-list">
          {EXPANSIONS.map(exp => (
            <label
              key={exp.id}
              className={`expansion-check ${ownedExpansions.has(exp.id) ? 'checked' : ''} ${exp.required ? 'disabled' : ''}`}
            >
              <input
                type="checkbox"
                checked={ownedExpansions.has(exp.id)}
                disabled={exp.required}
                onChange={() => !exp.required && actions.toggleExpansion(exp.id)}
              />
              <span className="checkbox-box" />
              <span className="expansion-name">{exp.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="setup-section">
        <h2 className="setup-heading">Players</h2>
        <div className="player-count-row">
          {[2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              className={`player-btn ${playerCount === n ? 'active' : ''}`}
              onClick={() => actions.setPlayerCount(n)}
              aria-pressed={playerCount === n}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="reach-label">
          Minimum Reach needed:{' '}
          <strong>{threshold}</strong>
        </p>
      </div>

      <div className="setup-section">
        <h2 className="setup-heading">Compatibility</h2>
        <div className="toggle-group">
          <button
            className={`mode-btn ${strictMode ? 'active' : ''}`}
            onClick={() => actions.setStrictMode(true)}
            aria-pressed={strictMode}
          >
            Strict
          </button>
          <button
            className={`mode-btn ${!strictMode ? 'active' : ''}`}
            onClick={() => actions.setStrictMode(false)}
            aria-pressed={!strictMode}
          >
            Adventurous
          </button>
        </div>
        <p className="mode-description">
          {strictMode
            ? 'Uses official Reach minimums. Ensures a balanced game.'
            : "Flat minimum of 17 for any player count. Leder's 'anything goes' threshold."}
        </p>
      </div>

      <div className="setup-section">
        <h2 className="setup-heading">
          Type Balance
          <InfoIcon tip="Militants control territory from the start. Insurgents disrupt and explode late. A mix makes for a more dynamic game." />
        </h2>
        <label className={`expansion-check ${requireBalance ? 'checked' : ''}`}>
          <input
            type="checkbox"
            checked={requireBalance}
            onChange={e => actions.setRequireBalance(e.target.checked)}
          />
          <span className="checkbox-box" />
          <span className="expansion-name">Require at least one Militant &amp; one Insurgent</span>
        </label>
      </div>

      <div className="setup-section">
        <h2 className="setup-heading">Difficulty</h2>
        <div className="difficulty-pills">
          {[
            { level: 1, label: '★ Beginner' },
            { level: 2, label: '★★ Intermediate' },
            { level: 3, label: '★★★ Expert' },
          ].map(({ level, label }) => (
            <button
              key={level}
              className={`diff-pill ${difficulties.has(level) ? 'active' : ''}`}
              onClick={() => actions.toggleDifficulty(level)}
              aria-pressed={difficulties.has(level)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
