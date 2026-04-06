import { useAppState } from './hooks/useAppState.js';
import { useTheme } from './hooks/useTheme.js';
import SetupPanel from './components/SetupPanel.jsx';
import FactionCard from './components/FactionCard.jsx';
import MapCard from './components/MapCard.jsx';
import DeckCard from './components/DeckCard.jsx';
import HirelingCard from './components/HirelingCard.jsx';
import LandmarkCard from './components/LandmarkCard.jsx';
import ReachSummary from './components/ReachSummary.jsx';
import ActionBar from './components/ActionBar.jsx';
import ManagePool from './components/ManagePool.jsx';
import BoardModal from './components/BoardModal.jsx';
import DieIcon from './components/DieIcon.jsx';
import { TreeIcon, TargetIcon } from './components/Icons.jsx';
import { useState } from 'react';
import { FACTIONS, FACTION_MAP } from './data/factions.js';
import { MAPS, MAP_MAP } from './data/maps.js';
import { DECKS } from './data/accessories.js';
import { getReachThreshold } from './utils/randomizer.js';

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon"><TreeIcon width={48} height={48} /></div>
      <p className="empty-text">No factions picked yet.</p>
      <p className="empty-sub">Hit the Randomize button above to assemble your war council.</p>
    </div>
  );
}

export default function App() {
  const { state, actions } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const [setupOpen, setSetupOpen] = useState(true);
  const [viewMode, setViewMode] = useState('pick'); // 'pick' | 'manage'
  const [resultTab, setResultTab] = useState('factions');
  const [boardModal, setBoardModal] = useState(null); // { images, title, sideLabels? }

  const {
    selectedFactions,
    lockedFactions,
    bannedFactions,
    selectedMap,
    selectedDeck,
    selectedHirelings,
    hirelingStatuses,
    lockedHirelings,
    bannedHirelings,
    selectedLandmarks,
    vagabondCharacters,
    playerCount,
    botCount,
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

  function canRerollFaction(factionId) {
    const isBot = FACTION_MAP[factionId]?.isBot ?? false;
    const excluded = new Set([...bannedFactions, ...selectedFactions]);
    return FACTIONS.some(f => {
      if (!!f.isBot !== isBot) return false;
      if (excluded.has(f.id)) return false;
      if (!ownedExpansions.has(f.expansion)) return false;
      if (f.requiresExpansion && !ownedExpansions.has(f.requiresExpansion)) return false;
      if (!isBot && !state.difficulties.has(f.difficulty)) return false;
      return true;
    });
  }

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
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
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
            <span className="tab-icon"><DieIcon width={14} height={14} /></span> Game Setup
          </button>
          <button
            className={`view-tab ${viewMode === 'manage' ? 'active' : ''}`}
            role="tab"
            aria-selected={viewMode === 'manage'}
            onClick={() => setViewMode('manage')}
            title={totalExcluded > 0 ? excludedTooltip : undefined}
          >
            <span className="tab-icon"><TargetIcon width={14} height={14} /></span>
            {' '}Manage Pool{totalExcluded > 0 ? ` (${totalExcluded} excluded)` : ''}
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

            {selectedFactions.length > 0 ? (
              <>
                <ReachSummary
                  selectedFactions={selectedFactions}
                  playerCount={playerCount}
                  balanceMode={balanceMode}
                />

                {/* Result sub-tabs */}
                <nav className="result-tabs" role="tablist" aria-label="Result categories">
                  {[
                    { id: 'factions', label: 'Factions', count: selectedFactions.length, show: true },
                    { id: 'map',      label: 'Map & Deck', count: null, show: !!(selectedMap || selectedDeck) },
                    { id: 'hirelings', label: 'Hirelings', count: selectedHirelings.length, show: selectedHirelings.length > 0 },
                    { id: 'landmarks', label: 'Landmarks', count: selectedLandmarks.length, show: selectedLandmarks.length > 0 },
                  ].filter(t => t.show).map(tab => (
                    <button
                      key={tab.id}
                      className={`result-tab ${resultTab === tab.id ? 'active' : ''}`}
                      role="tab"
                      aria-selected={resultTab === tab.id}
                      onClick={() => setResultTab(tab.id)}
                    >
                      {tab.label}
                      {tab.count != null && <span className="result-tab-count">{tab.count}</span>}
                    </button>
                  ))}
                </nav>

                {/* Factions tab */}
                {resultTab === 'factions' && (
                  <div className="result-tab-content">
                    {lockedFactions.size > 0 && (
                      <button className="reroll-all-btn" onClick={() => actions.randomize(true)}>
                        <DieIcon /> Re-roll unlocked
                      </button>
                    )}
                    <div className="cards-grid">
                      {selectedFactions.map((id, i) => (
                        <FactionCard
                          key={`${id}-${i}`}
                          factionId={id}
                          locked={lockedFactions.has(id)}
                          animIndex={i}
                          onLock={() => actions.toggleLock(id)}
                          onReroll={() => actions.rerollSingle(id)}
                          canReroll={canRerollFaction(id)}
                          onBan={() => actions.banFaction(id)}
                          mapNote={mapData?.factionNotes?.[id] ?? null}
                          vagabondCharacter={vagabondCharacters[id] ?? null}
                          onRerollCharacter={() => actions.rerollVagabondCharacter(id)}
                          playerCount={playerCount + botCount}
                          onBoardClick={(images, name) => setBoardModal({ images, title: name })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Map & Deck tab */}
                {resultTab === 'map' && (
                  <div className="result-tab-content">
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
                  </div>
                )}

                {/* Hirelings tab */}
                {resultTab === 'hirelings' && selectedHirelings.length > 0 && (
                  <div className="result-tab-content">
                    <button className="reroll-all-btn" onClick={actions.rerollHirelings}>
                      <DieIcon /> Re-roll all hirelings
                    </button>
                    <div className="hirelings-grid">
                      {selectedHirelings.map((hid, i) => (
                        <HirelingCard
                          key={hid}
                          hirelingId={hid}
                          index={i}
                          status={hirelingStatuses[i] ?? null}
                          locked={lockedHirelings.has(hid)}
                          onReroll={() => actions.rerollSingleHireling(hid)}
                          onLock={() => actions.toggleLockHireling(hid)}
                          onBan={() => actions.banHireling(hid)}
                          onImageClick={(images, name) => setBoardModal({ images, title: name, sideLabels: ['Promoted', 'Demoted'] })}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Landmarks tab */}
                {resultTab === 'landmarks' && selectedLandmarks.length > 0 && (
                  <div className="result-tab-content">
                    <button className="reroll-all-btn" onClick={actions.rerollLandmarks}>
                      <DieIcon /> Re-roll all landmarks
                    </button>
                    <div className="landmarks-grid">
                      {selectedLandmarks.map((lid, i) => (
                        <LandmarkCard
                          key={lid}
                          landmarkId={lid}
                          index={i}
                          onReroll={() => actions.rerollSingleLandmark(lid)}
                          onImageClick={(images, name) => setBoardModal({ images, title: name })}
                        />
                      ))}
                    </div>
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

      {boardModal && (
        <BoardModal
          images={boardModal.images}
          title={boardModal.title}
          sideLabels={boardModal.sideLabels}
          onClose={() => setBoardModal(null)}
        />
      )}
    </div>
  );
}
