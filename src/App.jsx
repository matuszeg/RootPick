import { useAppState } from './hooks/useAppState.js';
import SetupPanel from './components/SetupPanel.jsx';
import FactionCard from './components/FactionCard.jsx';
import MapCard from './components/MapCard.jsx';
import DeckCard from './components/DeckCard.jsx';
import HirelingCard from './components/HirelingCard.jsx';
import LandmarkCard from './components/LandmarkCard.jsx';
import ReachSummary from './components/ReachSummary.jsx';
import ActionBar from './components/ActionBar.jsx';
import ManagePool from './components/ManagePool.jsx';
import { useState } from 'react';
import { FACTIONS } from './data/factions.js';
import { MAPS, MAP_MAP } from './data/maps.js';
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

export default function App() {
  const { state, actions } = useAppState();
  const [setupOpen, setSetupOpen] = useState(true);
  const [viewMode, setViewMode] = useState('pick'); // 'pick' | 'manage'

  const {
    selectedFactions,
    lockedFactions,
    bannedFactions,
    selectedMap,
    selectedDeck,
    selectedHirelings,
    hirelingStatuses,
    selectedLandmarks,
    vagabondCharacters,
    playerCount,
    balanceMode,
    ownedExpansions,
    ownedAccessories,
    excludedMaps,
    excludedHirelings,
    excludedCharacters,
    excludedLandmarks,
    error,
    copied,
    history,
  } = state;

  const mapData = selectedMap ? MAP_MAP[selectedMap] : null;
  const canRerollMap = MAPS.filter(m =>
    ownedExpansions.has(m.expansion) &&
    !excludedMaps.has(m.id) &&
    state.mapDifficulties.has(m.difficulty)
  ).length > 1;
  const canRerollDeck = DECKS.filter(d => d.accessory === null || ownedAccessories.has(d.accessory)).length > 1;

  // Compute total excluded count for tab indicator
  const excludedCounts = [
    { label: 'factions',   count: bannedFactions.size },
    { label: 'maps',       count: excludedMaps.size },
    { label: 'hirelings',  count: excludedHirelings.size },
    { label: 'characters', count: excludedCharacters.size },
    { label: 'landmarks',  count: excludedLandmarks.size },
  ].filter(x => x.count > 0);
  const totalExcluded = excludedCounts.reduce((sum, x) => sum + x.count, 0);
  const excludedTooltip = excludedCounts.map(x => `${x.count} ${x.label}`).join(' · ');

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
            className={`view-tab ${viewMode === 'manage' ? 'active' : ''}`}
            role="tab"
            aria-selected={viewMode === 'manage'}
            onClick={() => setViewMode('manage')}
            title={totalExcluded > 0 ? excludedTooltip : undefined}
          >
            <span className="tab-icon">🎯</span>
            {' '}Manage Pool{totalExcluded > 0 ? ` (${totalExcluded} excluded)` : ''}
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
                      playerCount={playerCount}
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
                          status={hirelingStatuses[i] ?? null}
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
          <ManagePool state={state} actions={actions} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          <a href="https://rootpick.app" className="footer-link">rootpick.app</a>
          {' '}·{' '}Fan-made tool. Not affiliated with or endorsed by Leder Games.
          {' '}·{' '}<a href="https://github.com/matuszeg/RootPick/" className="footer-link" target="_blank" rel="noopener noreferrer">Open source on GitHub</a>
        </p>
      </footer>
    </div>
  );
}
