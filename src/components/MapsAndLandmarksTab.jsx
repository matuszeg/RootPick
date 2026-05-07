import { MAPS } from '../data/maps.js';
import { ACCESSORIES, LANDMARKS } from '../data/accessories.js';
import { CheckIcon, StarIcon, XIcon } from './Icons.jsx';
import MapCard from './MapCard.jsx';
import MapSetupCard from './MapSetupCard.jsx';
import LandmarkCard from './LandmarkCard.jsx';
import DieIcon from './DieIcon.jsx';

const HOMELAND_NATIVE_IDS = new Set(['mousehold', 'foxburrow', 'rabbittown']);
const LANDMARK_COLOR = '#5A7A3A';

const SOURCE_LABEL = {
  underworld_landmarks: 'Underworld Expansion',
  homeland_landmarks: 'Homeland Expansion',
  landmarks_pack: 'Landmarks Pack',
};

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

function PoolItem({ name, icon, iconWide, meta, description, excluded, onToggle, accentColor }) {
  return (
    <button
      className={`pool-item ${excluded ? 'excluded' : ''}`}
      onClick={onToggle}
      title={excluded ? `Click to include "${name}" in pool` : `Click to exclude "${name}" from pool`}
      style={{ '--pool-accent': accentColor ?? 'var(--gold)' }}
    >
      <span className={`pool-item-icon ${iconWide ? 'wide' : ''}`}>{icon}</span>
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

export default function MapsAndLandmarksTab({ state, actions, subTab, onSubTabChange, onBoardClick, onImageClick }) {
  const {
    activeMapExpansions, mapDifficulties, selectedMap, ownedAccessories, excludedMaps,
    useLandmarks, landmarkCount, selectedLandmarks, excludedLandmarks,
  } = state;

  const activeMaps = MAPS.filter(m => activeMapExpansions.has(m.expansion) && !excludedMaps.has(m.id));
  const canRerollMap = activeMaps.filter(m => mapDifficulties.has(m.difficulty)).length > 1;

  const canUseLandmarks = ownedAccessories.has('landmarks_pack') || ownedAccessories.has('underworld_landmarks') || ownedAccessories.has('homeland_landmarks');
  const landmarkAccessories = ACCESSORIES.filter(a => a.category === 'landmark');
  const availableLandmarks = LANDMARKS.filter(l => ownedAccessories.has(l.source) && !HOMELAND_NATIVE_IDS.has(l.id));

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
          <h3 className="filter-heading">Landmark Sources</h3>
          {landmarkAccessories.map(a => (
            <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
              <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
              <span className="checkbox-box" />
              <span className="expansion-name">{a.name}</span>
            </label>
          ))}
        </div>

        <div className={`filter-group ${!canUseLandmarks ? 'group-locked' : ''}`}>
          <h3 className="filter-heading">Landmarks in Play</h3>
          <div className="landmark-count-btns">
            <button
              className={`landmark-count-btn ${!useLandmarks ? 'active' : ''}`}
              onClick={() => actions.setUseLandmarks(false)}
              aria-pressed={!useLandmarks}
            >
              Off
            </button>
            {[1, 2].map(n => (
              <button
                key={n}
                className={`landmark-count-btn ${useLandmarks && landmarkCount === n ? 'active' : ''}`}
                onClick={() => { actions.setUseLandmarks(true); actions.setLandmarkCount(n); }}
                aria-pressed={useLandmarks && landmarkCount === n}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3 className="filter-heading">Advanced</h3>
          <label className={`expansion-check ${state.forceSuitRandomizationOnAutumn ? 'checked' : ''}`}>
            <input
              type="checkbox"
              checked={state.forceSuitRandomizationOnAutumn}
              onChange={e => actions.setForceSuitRandomizationOnAutumn(e.target.checked)}
            />
            <span className="checkbox-box" />
            <span className="expansion-name">
              Randomize Autumn clearing suits
              <span className="exclusion-desc"> — Autumn has printed suits; turn this on to randomize them too.</span>
            </span>
          </label>
          <label className={`expansion-check ${state.allowNativeLandmarkOverride ? 'checked' : ''}`}>
            <input
              type="checkbox"
              checked={state.allowNativeLandmarkOverride}
              onChange={e => actions.setAllowNativeLandmarkOverride(e.target.checked)}
            />
            <span className="checkbox-box" />
            <span className="expansion-name">
              Allow native landmarks in random pool
              <span className="exclusion-desc"> — Lets Tower roll on Mountain and Ferry roll on Lake.</span>
            </span>
          </label>
        </div>
      </div>

      <div className="sub-tabs" role="tablist">
        <button className={`sub-tab ${subTab === 'results' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'results'} onClick={() => onSubTabChange('results')}>Results</button>
        <button className={`sub-tab ${subTab === 'pool' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'pool'} onClick={() => onSubTabChange('pool')}>Pool</button>
      </div>

      {subTab === 'results' && (
        <div className="sub-tab-content">
          {selectedMap ? (
            <>
              <div className="visual-row">
                <div className="visual-row-map">
                  <MapCard mapId={selectedMap} onReroll={actions.rerollMap} canReroll={canRerollMap} onBoardClick={onBoardClick} mapSetup={state.mapSetup} onToggleLock={actions.toggleClearingLock} />
                </div>
                {canUseLandmarks && useLandmarks && selectedLandmarks.length > 0 && (
                  <div className="visual-row-landmarks">
                    <div className="visual-row-landmarks-head">
                      <h3 className="visual-row-landmarks-title">Random Landmarks</h3>
                      <button className="reroll-btn" onClick={actions.rerollLandmarks} title="Re-roll all random landmarks">
                        <DieIcon /> Re-roll
                      </button>
                    </div>
                    <div className="landmarks-grid">
                      {selectedLandmarks.map((lid, i) => (
                        <LandmarkCard
                          key={lid}
                          landmarkId={lid}
                          index={i}
                          onReroll={() => actions.rerollSingleLandmark(lid)}
                          onImageClick={onImageClick}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <MapSetupCard state={state} actions={actions} onImageClick={onImageClick} />
              {canUseLandmarks && useLandmarks && selectedLandmarks.length === 0 && (
                <div className="tab-empty-state">
                  <p>No random landmarks picked yet.</p>
                  <p className="tab-empty-sub">Hit Re-roll above or Randomize to get started.</p>
                </div>
              )}
            </>
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
          {availableLandmarks.length === 0 ? (
            <div className="pool-empty"><p>No random-draw landmarks available. Enable a landmark source above.</p></div>
          ) : (
            <>
              <p className="pool-tab-hint">Click a landmark to exclude or include it in the random draw pool.</p>
              <div className="pool-grid">
                {availableLandmarks.map(l => (
                  <PoolItem
                    key={l.id}
                    name={l.name}
                    icon={<img src={l.frontImg} alt="" draggable={false} />}
                    iconWide
                    meta={SOURCE_LABEL[l.source] ?? l.source}
                    description={l.description}
                    accentColor={LANDMARK_COLOR}
                    excluded={excludedLandmarks.has(l.id)}
                    onToggle={() => actions.toggleExcludedLandmark(l.id)}
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
