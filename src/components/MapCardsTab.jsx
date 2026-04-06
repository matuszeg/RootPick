import { MAPS, MAP_MAP, MAP_COLORS } from '../data/maps.js';
import { DECKS, ACCESSORIES } from '../data/accessories.js';
import { CheckIcon, StarIcon, MapIcon, XIcon } from './Icons.jsx';
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

function PoolItem({ name, icon, meta, description, excluded, onToggle, accentColor }) {
  return (
    <button
      className={`pool-item ${excluded ? 'excluded' : ''}`}
      onClick={onToggle}
      title={excluded ? `Click to include "${name}" in pool` : `Click to exclude "${name}" from pool`}
      style={{ '--pool-accent': accentColor ?? 'var(--gold)' }}
    >
      <span className="pool-item-icon">{icon}</span>
      <span className="pool-item-body">
        <span className="pool-item-name">{name}</span>
        {meta && <span className="pool-item-meta">{meta}</span>}
        {description && <span className="pool-item-desc">{description}</span>}
      </span>
      <span className={`pool-item-toggle ${excluded ? 'off' : 'on'}`}>
        {excluded ? <XIcon width={12} height={12} /> : <CheckIcon width={12} height={12} />}
      </span>
    </button>
  );
}

export default function MapCardsTab({ state, actions, subTab, onSubTabChange }) {
  const { activeMapExpansions, mapDifficulties, selectedMap, selectedDeck, ownedAccessories, excludedMaps } = state;

  // Count maps currently in the pool (active expansion + not excluded)
  const activeMaps = MAPS.filter(m => activeMapExpansions.has(m.expansion) && !excludedMaps.has(m.id));

  const canRerollMap = activeMaps.filter(m => mapDifficulties.has(m.difficulty)).length > 1;

  const canRerollDeck = DECKS.filter(d => d.accessory === null || ownedAccessories.has(d.accessory)).length > 1;

  const availableDeckAccessories = ACCESSORIES.filter(a => a.category === 'deck');

  const COMPLEXITY = {
    1: <><StarsInline count={1} /> Beginner</>,
    2: <><StarsInline count={2} /> Moderate</>,
    3: <><StarsInline count={3} /> Complex</>,
  };

  const availableMaps = MAPS.filter(m => activeMapExpansions.has(m.expansion));

  return (
    <div className="tab-panel">
      <div className="tab-filters">
        <div className="filter-group">
          <h3 className="filter-heading">Map Boards</h3>
          {MAPS.map(m => {
            const expansionActive = activeMapExpansions.has(m.expansion);
            const checked = expansionActive && !excludedMaps.has(m.id);
            const isBase = m.expansion === 'base';
            // Can't uncheck the last active map
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
                    } else if (checked) {
                      // Unchecking: exclude this map. If sibling is also excluded, disable the expansion.
                      const sibling = MAPS.find(s => s.expansion === m.expansion && s.id !== m.id);
                      if (!isBase && sibling && excludedMaps.has(sibling.id)) {
                        actions.toggleMapExpansion(m.expansion);
                        // Also un-exclude both so they're clean if re-enabled
                        if (excludedMaps.has(m.id)) actions.toggleExcludedMap(m.id);
                        if (excludedMaps.has(sibling.id)) actions.toggleExcludedMap(sibling.id);
                        // Re-roll if selected map was in this expansion
                        if (selectedMap === m.id || selectedMap === sibling.id) actions.rerollMap();
                      } else {
                        actions.toggleExcludedMap(m.id);
                        // Re-roll if we just excluded the currently selected map
                        if (m.id === selectedMap) actions.rerollMap();
                      }
                    } else {
                      // Re-including: un-exclude this map
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

      <div className="sub-tabs" role="tablist">
        <button className={`sub-tab ${subTab === 'results' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'results'} onClick={() => onSubTabChange('results')}>Results</button>
        <button className={`sub-tab ${subTab === 'pool' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'pool'} onClick={() => onSubTabChange('pool')}>Pool</button>
      </div>

      {subTab === 'results' && (
        <div className="sub-tab-content">
          {selectedMap || selectedDeck ? (
            <div className="session-row">
              {selectedMap && (
                <MapCard mapId={selectedMap} onReroll={actions.rerollMap} canReroll={canRerollMap} />
              )}
              {selectedDeck && (
                <DeckCard deckId={selectedDeck} onReroll={actions.rerollDeck} canReroll={canRerollDeck} />
              )}
            </div>
          ) : (
            <div className="tab-empty-state">
              <p>No map picked yet.</p>
              <p className="tab-empty-sub">Hit Randomize above to get started.</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'pool' && (
        <div className="sub-tab-content">
          {availableMaps.length === 0 ? (
            <div className="pool-empty"><p>No maps available. Enable map boards above.</p></div>
          ) : (
            <>
              <p className="pool-tab-hint">Click a map to exclude or include it.</p>
              <div className="pool-grid">
                {availableMaps.map(m => (
                  <PoolItem
                    key={m.id}
                    name={m.name}
                    icon={<span className="pool-map-icon"><MapIcon width={18} height={18} /></span>}
                    meta={COMPLEXITY[m.difficulty]}
                    description={m.description}
                    accentColor={(MAP_COLORS[m.id] ?? {}).primary}
                    excluded={excludedMaps.has(m.id)}
                    onToggle={() => actions.toggleExcludedMap(m.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
