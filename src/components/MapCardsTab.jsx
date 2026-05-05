import { MAPS } from '../data/maps.js';
import { DECKS, ACCESSORIES } from '../data/accessories.js';
import { CheckIcon, StarIcon } from './Icons.jsx';
import MapCard from './MapCard.jsx';
import DeckCard from './DeckCard.jsx';

function StarsInline({ count }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} width={10} height={10} filled />
      ))}
    </>
  );
}

function InfoIcon({ tip }) {
  return <span className="info-icon" title={tip} aria-label={tip}>?</span>;
}

export default function MapCardsTab({ state, actions, onBoardClick }) {
  const { activeMapExpansions, mapDifficulties, selectedMap, selectedDeck, ownedAccessories, excludedMaps } = state;

  const activeMaps = MAPS.filter(m => activeMapExpansions.has(m.expansion) && !excludedMaps.has(m.id));

  const canRerollMap = activeMaps.filter(m => mapDifficulties.has(m.difficulty)).length > 1;

  const canRerollDeck = DECKS.filter(d => d.accessory === null || ownedAccessories.has(d.accessory)).length > 1;

  const availableDeckAccessories = ACCESSORIES.filter(a => a.category === 'deck');

  return (
    <div className="tab-panel">
      <div className="tab-filters">
        <div className="filter-group">
          <h3 className="filter-heading">Map Boards</h3>
          {MAPS.map(m => {
            const expansionActive = activeMapExpansions.has(m.expansion);
            const checked = expansionActive && !excludedMaps.has(m.id);
            const isBase = m.expansion === 'base';
            const isLastActive = checked && activeMaps.length === 1;
            return (
              <label key={m.id} className={`expansion-check ${checked ? 'checked' : ''} ${isLastActive ? 'disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isLastActive}
                  onChange={() => {
                    if (!expansionActive) {
                      actions.toggleMapExpansion(m.expansion);
                      const sibling = MAPS.find(s => s.expansion === m.expansion && s.id !== m.id);
                      if (sibling && !isBase && !excludedMaps.has(sibling.id)) {
                        actions.toggleExcludedMap(sibling.id);
                      }
                    } else if (checked) {
                      const sibling = MAPS.find(s => s.expansion === m.expansion && s.id !== m.id);
                      if (!isBase && sibling && excludedMaps.has(sibling.id)) {
                        actions.toggleMapExpansion(m.expansion);
                        if (excludedMaps.has(m.id)) actions.toggleExcludedMap(m.id);
                        if (excludedMaps.has(sibling.id)) actions.toggleExcludedMap(sibling.id);
                        if (selectedMap === m.id || selectedMap === sibling.id) actions.rerollMap();
                      } else {
                        actions.toggleExcludedMap(m.id);
                        if (m.id === selectedMap) actions.rerollMap();
                      }
                    } else {
                      actions.toggleExcludedMap(m.id);
                    }
                  }}
                />
                <span className="checkbox-box" />
                <span className="expansion-name">{m.name}</span>
              </label>
            );
          })}
        </div>

        <div className="filter-group">
          <h3 className="filter-heading">
            Map Complexity
            <InfoIcon tip="Only maps matching the selected complexity levels will be picked." />
          </h3>
          <p className="setup-heading-sub">Include in pool</p>
          <div className="difficulty-pills">
            {[
              { level: 1, label: 'Beginner' },
              { level: 2, label: 'Moderate' },
              { level: 3, label: 'Complex' },
            ].map(({ level, label }) => (
              <button
                key={level}
                className={`diff-pill ${mapDifficulties.has(level) ? 'active' : ''}`}
                onClick={() => actions.toggleMapDifficulty(level)}
                aria-pressed={mapDifficulties.has(level)}
              >
                {mapDifficulties.has(level) && <CheckIcon width={12} height={12} />} <StarsInline count={level} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3 className="filter-heading">Card Decks</h3>
          {availableDeckAccessories.map(a => (
            <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
              <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
              <span className="checkbox-box" />
              <span className="expansion-name">{a.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="sub-tab-content">
        {selectedMap || selectedDeck ? (
          <div className="session-row">
            {selectedMap && (
              <MapCard mapId={selectedMap} onReroll={actions.rerollMap} canReroll={canRerollMap} onBoardClick={onBoardClick} />
            )}
            {selectedDeck && (
              <DeckCard deckId={selectedDeck} onReroll={actions.rerollDeck} canReroll={canRerollDeck} onBoardClick={onBoardClick} />
            )}
          </div>
        ) : (
          <div className="tab-empty-state">
            <p>No map picked yet.</p>
            <p className="tab-empty-sub">Hit Randomize above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
