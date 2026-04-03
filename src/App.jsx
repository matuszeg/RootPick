import { useAppState } from './hooks/useAppState.js';
import SetupPanel from './components/SetupPanel.jsx';
import FactionCard from './components/FactionCard.jsx';
import MapCard from './components/MapCard.jsx';
import DeckCard from './components/DeckCard.jsx';
import HirelingCard from './components/HirelingCard.jsx';
import LandmarkCard from './components/LandmarkCard.jsx';
import ReachSummary from './components/ReachSummary.jsx';
import ActionBar from './components/ActionBar.jsx';
import BannedPanel from './components/BannedPanel.jsx';
import { useState } from 'react';
import { FACTIONS } from './data/factions.js';
import { MAP_MAP } from './data/maps.js';
import { DECKS } from './data/accessories.js';
import { getReachThreshold } from './utils/randomizer.js';

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">🌲</div>
      <p className="empty-text">No factions picked yet.</p>
      <p className="empty-sub">Hit the Randomize button above to assemble your war council.</p>
    </div>
  );
}

function BrowseView({ state, actions }) {
  const { ownedExpansions, bannedFactions, difficulties, playerCount, balanceMode } = state;

  const threshold = getReachThreshold(balanceMode, playerCount);

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
          Reach goal for {playerCount}p: <strong>{threshold === 0 ? 'None' : threshold}</strong>
          <span className="browse-mode-tag">{{ balanced: 'Balanced', standard: 'Standard', chaos: 'Chaos' }[balanceMode]}</span>
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
    selectedMap,
    selectedDeck,
    selectedHirelings,
    selectedLandmarks,
    vagabondCharacters,
    playerCount,
    balanceMode,
    ownedExpansions,
    ownedAccessories,
    error,
    copied,
    history,
  } = state;

  const mapData = selectedMap ? MAP_MAP[selectedMap] : null;
  const canRerollMap = Object.values(MAP_MAP).filter(m => ownedExpansions.has(m.expansion)).length > 1;
  const canRerollDeck = DECKS.filter(d => d.accessory === null || ownedAccessories.has(d.accessory)).length > 1;

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
            <span className="tab-icon">🎲</span> Pick Factions
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
              hasLockedFactions={lockedFactions.size > 0}
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
              balanceMode={balanceMode}
            />

            {selectedFactions.length > 0 ? (
              <>
                {/* Session setup row: Map + Deck */}
                <div className="session-row">
                  {selectedMap && (
                    <MapCard
                      mapId={selectedMap}
                      onReroll={actions.rerollMap}
                      canReroll={canRerollMap}
                    />
                  )}
                  {selectedDeck && (
                    <DeckCard
                      deckId={selectedDeck}
                      onReroll={actions.rerollDeck}
                      canReroll={canRerollDeck}
                    />
                  )}
                </div>

                {/* Landmarks */}
                {selectedLandmarks.length > 0 && (
                  <LandmarkCard
                    landmarkIds={selectedLandmarks}
                    onReroll={actions.rerollLandmarks}
                  />
                )}

                {/* Faction Cards */}
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
                      mapNote={mapData?.factionNotes?.[id] ?? null}
                      vagabondCharacter={vagabondCharacters[id] ?? null}
                      onRerollCharacter={() => actions.rerollVagabondCharacter(id)}
                    />
                  ))}
                </div>

                {/* Hirelings */}
                {selectedHirelings.length > 0 && (
                  <div className="hirelings-section">
                    <h3 className="hirelings-heading">Hirelings</h3>
                    <div className="hirelings-grid">
                      {selectedHirelings.map((hid, i) => (
                        <HirelingCard
                          key={hid}
                          hirelingId={hid}
                          index={i}
                          onReroll={() => actions.rerollSingleHireling(hid)}
                        />
                      ))}
                    </div>
                    <button className="reroll-all-hirelings" onClick={actions.rerollHirelings}>
                      🔄 Re-roll all hirelings
                    </button>
                  </div>
                )}
              </>
            ) : (
              !error && <EmptyState />
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
