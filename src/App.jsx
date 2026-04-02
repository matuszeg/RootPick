import { useAppState } from './hooks/useAppState.js';
import SetupPanel from './components/SetupPanel.jsx';
import FactionCard from './components/FactionCard.jsx';
import ReachSummary from './components/ReachSummary.jsx';
import ActionBar from './components/ActionBar.jsx';
import BannedPanel from './components/BannedPanel.jsx';
import { useState } from 'react';
import { FACTIONS, REACH_MINIMUMS } from './data/factions.js';

function EmptyState({ onRandomize }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🌲</div>
      <p className="empty-text">No factions picked yet.</p>
      <p className="empty-sub">Hit Randomize to assemble your war council.</p>
      <button className="action-btn primary randomize-btn" onClick={onRandomize}>
        <span className="btn-icon">🎲</span>
        <span>Randomize</span>
      </button>
    </div>
  );
}

function BrowseView({ state, actions }) {
  const { ownedExpansions, bannedFactions, difficulties, playerCount, strictMode } = state;

  const threshold = strictMode ? (REACH_MINIMUMS[playerCount] ?? 17) : 17;
  const poolReach = FACTIONS
    .filter(f => ownedExpansions.has(f.expansion) && !bannedFactions.has(f.id) && difficulties.has(f.difficulty))
    .reduce((sum, f) => sum + f.reach, 0);

  const pool = FACTIONS.filter(
    f =>
      ownedExpansions.has(f.expansion) &&
      !bannedFactions.has(f.id) &&
      difficulties.has(f.difficulty)
  );

  const militants = pool.filter(f => f.type === 'militant').sort((a, b) => b.reach - a.reach);
  const insurgents = pool.filter(f => f.type === 'insurgent').sort((a, b) => b.reach - a.reach);

  if (pool.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🌿</div>
        <p className="empty-text">No factions match your filters.</p>
        <p className="empty-sub">Try enabling more expansions or difficulty levels.</p>
      </div>
    );
  }

  return (
    <div className="browse-view">
      <div className="browse-header">
        <span className="browse-count">
          {pool.length} faction{pool.length !== 1 ? 's' : ''} in pool
        </span>
        <span className="browse-reach-goal">
          Reach goal for {playerCount}p: <strong>{threshold}</strong>
          <span className="browse-mode-tag">{strictMode ? 'Strict' : 'Adventurous'}</span>
        </span>
      </div>

      {militants.length > 0 && (
        <section className="browse-group">
          <h3 className="browse-group-heading militant">
            <span className="group-dot" />
            Militants — {militants.length}
          </h3>
          <div className="cards-grid">
            {militants.map((f, i) => (
              <FactionCard
                key={f.id}
                factionId={f.id}
                animIndex={i}
                browseMode
                onBan={() => actions.banFaction(f.id)}
              />
            ))}
          </div>
        </section>
      )}

      {insurgents.length > 0 && (
        <section className="browse-group">
          <h3 className="browse-group-heading insurgent">
            <span className="group-dot" />
            Insurgents — {insurgents.length}
          </h3>
          <div className="cards-grid">
            {insurgents.map((f, i) => (
              <FactionCard
                key={f.id}
                factionId={f.id}
                animIndex={i}
                browseMode
                onBan={() => actions.banFaction(f.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function App() {
  const { state, actions } = useAppState();
  const [setupOpen, setSetupOpen] = useState(true);
  const [viewMode, setViewMode] = useState('pick'); // 'pick' | 'browse'

  const {
    selectedFactions,
    lockedFactions,
    bannedFactions,
    playerCount,
    strictMode,
    error,
    copied,
    history,
  } = state;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="wordmark">
            <span className="wordmark-root">Root</span>
            <span className="wordmark-pick">Pick</span>
          </div>
          <p className="header-tagline">Faction randomizer for Root</p>
        </div>
      </header>

      <main className="app-main">
        {/* Setup panel toggle (mobile) */}
        <button
          className="setup-toggle"
          onClick={() => setSetupOpen(o => !o)}
          aria-expanded={setupOpen}
        >
          <span>⚙ Settings</span>
          <span className={`chevron ${setupOpen ? 'up' : ''}`}>▾</span>
        </button>

        <div className={`setup-drawer ${setupOpen ? 'open' : ''}`}>
          <SetupPanel state={state} actions={actions} />
        </div>

        {/* View mode tabs */}
        <div className="view-tabs" role="tablist">
          <button
            className={`view-tab ${viewMode === 'pick' ? 'active' : ''}`}
            role="tab"
            aria-selected={viewMode === 'pick'}
            onClick={() => setViewMode('pick')}
          >
            <span className="tab-icon">🎲</span> Randomize
          </button>
          <button
            className={`view-tab ${viewMode === 'browse' ? 'active' : ''}`}
            role="tab"
            aria-selected={viewMode === 'browse'}
            onClick={() => setViewMode('browse')}
          >
            <span className="tab-icon">📋</span> Browse Pool
          </button>
        </div>

        {viewMode === 'pick' ? (
          <>
            <ActionBar
              hasSelection={selectedFactions.length > 0}
              hasHistory={history.length > 0}
              copied={copied}
              actions={actions}
            />

            {error && (
              <div className="error-banner" role="alert">
                <span>{error}</span>
                <button
                  className="error-dismiss"
                  onClick={actions.clearError}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            )}

            <ReachSummary
              selectedFactions={selectedFactions}
              playerCount={playerCount}
              strictMode={strictMode}
            />

            {selectedFactions.length > 0 ? (
              <div className="cards-grid">
                {selectedFactions.map((id, i) => (
                  <FactionCard
                    key={`${id}-${i}`}
                    factionId={id}
                    locked={lockedFactions.has(id)}
                    animIndex={i}
                    onLock={() => actions.toggleLock(id)}
                    onReroll={() => actions.rerollSingle(id)}
                    onBan={() => actions.banFaction(id)}
                  />
                ))}
              </div>
            ) : (
              !error && <EmptyState onRandomize={() => actions.randomize(false)} />
            )}
          </>
        ) : (
          <BrowseView state={state} actions={actions} />
        )}

        <BannedPanel
          bannedFactions={bannedFactions}
          onUnban={actions.unbanFaction}
        />
      </main>

      <footer className="app-footer">
        <p>
          <a href="https://rootpick.app" className="footer-link">rootpick.app</a>
          {' '}·{' '}Fan-made tool. Not affiliated with or endorsed by Leder Games.
        </p>
      </footer>
    </div>
  );
}
