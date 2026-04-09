import { useAppState } from './hooks/useAppState.js';
import { useTheme } from './hooks/useTheme.js';
import PersistentBar from './components/PersistentBar.jsx';
import CategoryTabs from './components/CategoryTabs.jsx';
import FactionsTab from './components/FactionsTab.jsx';
import MapCardsTab from './components/MapCardsTab.jsx';
import HirelingsTab from './components/HirelingsTab.jsx';
import LandmarksTab from './components/LandmarksTab.jsx';
import BoardModal from './components/BoardModal.jsx';
import { useState } from 'react';
import { HIRELING_SETS } from './data/accessories.js';

export default function App() {
  const { state, actions } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('factions');
  const [subTabs, setSubTabs] = useState({
    factions: 'results',
    map: 'results',
    hirelings: 'results',
    landmarks: 'results',
  });
  const [boardModal, setBoardModal] = useState(null);

  const {
    selectedFactions,
    ownedAccessories,
    error,
    copied,
    history,
  } = state;

  function setSubTab(category, tab) {
    setSubTabs(prev => ({ ...prev, [category]: tab }));
  }

  // Determine which tabs are disabled (greyed out)
  const canUseHirelings = HIRELING_SETS.some(h => ownedAccessories.has(h.source));
  const canUseLandmarks = (ownedAccessories.has('landmarks_pack') || ownedAccessories.has('underworld_landmarks') || ownedAccessories.has('homeland_landmarks')) && state.useLandmarks;
  const disabledTabs = new Set();
  if (!canUseHirelings) disabledTabs.add('hirelings');
  if (!canUseLandmarks) disabledTabs.add('landmarks');

  function handleBoardClick(images, name, sideLabels) {
    setBoardModal({ images, title: name, sideLabels });
  }

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
        <PersistentBar
          state={state}
          actions={actions}
          copied={copied}
          hasSelection={selectedFactions.length > 0}
          hasHistory={history.length > 0}
        />

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button className="error-dismiss" onClick={actions.clearError} aria-label="Dismiss">×</button>
          </div>
        )}

        <CategoryTabs
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
          disabledTabs={disabledTabs}
        />

        {activeCategory === 'factions' && (
          <FactionsTab
            state={state}
            actions={actions}
            subTab={subTabs.factions}
            onSubTabChange={tab => setSubTab('factions', tab)}
            onBoardClick={(images, name) => handleBoardClick(images, name)}
          />
        )}

        {activeCategory === 'map' && (
          <MapCardsTab
            state={state}
            actions={actions}
            subTab={subTabs.map}
            onSubTabChange={tab => setSubTab('map', tab)}
            onBoardClick={(images, name) => handleBoardClick(images, name)}
          />
        )}

        {activeCategory === 'hirelings' && (
          <HirelingsTab
            state={state}
            actions={actions}
            subTab={subTabs.hirelings}
            onSubTabChange={tab => setSubTab('hirelings', tab)}
            onImageClick={(images, name) => handleBoardClick(images, name, ['Promoted', 'Demoted'])}
          />
        )}

        {activeCategory === 'landmarks' && (
          <LandmarksTab
            state={state}
            actions={actions}
            subTab={subTabs.landmarks}
            onSubTabChange={tab => setSubTab('landmarks', tab)}
            onImageClick={(images, name) => handleBoardClick(images, name)}
          />
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
