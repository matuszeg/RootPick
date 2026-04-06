import { ACCESSORIES, LANDMARKS } from '../data/accessories.js';
import { CheckIcon, LandmarkIcon, XIcon } from './Icons.jsx';
import LandmarkCard from './LandmarkCard.jsx';
import DieIcon from './DieIcon.jsx';

const LANDMARK_COLOR = '#5A7A3A';

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

const SOURCE_LABEL = {
  underworld_landmarks: 'Underworld Expansion',
  homeland_landmarks: 'Homeland Expansion',
  landmarks_pack: 'Landmarks Pack',
};

export default function LandmarksTab({ state, actions, subTab, onSubTabChange, onImageClick }) {
  const { ownedAccessories, useLandmarks, landmarkCount, selectedLandmarks, excludedLandmarks } = state;

  const canUseLandmarks = ownedAccessories.has('landmarks_pack') || ownedAccessories.has('underworld_landmarks') || ownedAccessories.has('homeland_landmarks');
  const availableAccessories = ACCESSORIES.filter(a => a.category === 'landmark');
  const availableLandmarks = LANDMARKS.filter(l => ownedAccessories.has(l.source));

  return (
    <div className="tab-panel">
      <div className="tab-filters">
        <div className="filter-group">
          <h3 className="filter-heading">Landmark Sources</h3>
          {availableAccessories.map(a => (
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
      </div>

      <div className="sub-tabs" role="tablist">
        <button className={`sub-tab ${subTab === 'results' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'results'} onClick={() => onSubTabChange('results')}>Results</button>
        <button className={`sub-tab ${subTab === 'pool' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'pool'} onClick={() => onSubTabChange('pool')}>Pool</button>
      </div>

      {subTab === 'results' && (
        <div className="sub-tab-content">
          {canUseLandmarks && useLandmarks && (
            <button className="reroll-all-btn" onClick={actions.rerollLandmarks}>
              <DieIcon /> Re-roll all landmarks
            </button>
          )}
          {selectedLandmarks.length > 0 ? (
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
          ) : (
            <div className="tab-empty-state">
              {canUseLandmarks && useLandmarks ? (
                <>
                  <p>No landmarks picked yet.</p>
                  <p className="tab-empty-sub">Hit Re-roll above or Randomize to get started.</p>
                </>
              ) : !canUseLandmarks ? (
                <>
                  <p>No landmark sources enabled.</p>
                  <p className="tab-empty-sub">Check a source above to include landmarks in your session.</p>
                </>
              ) : (
                <>
                  <p>Landmarks are turned off.</p>
                  <p className="tab-empty-sub">Set the count to 1 or 2 above to include landmarks.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {subTab === 'pool' && (
        <div className="sub-tab-content">
          {availableLandmarks.length === 0 ? (
            <div className="pool-empty"><p>No landmarks available. Enable landmark sources above.</p></div>
          ) : (
            <>
              <p className="pool-tab-hint">Click a landmark to exclude or include it.</p>
              <div className="pool-grid">
                {availableLandmarks.map(l => (
                  <PoolItem
                    key={l.id}
                    name={l.name}
                    icon={<span className="pool-generic-icon"><LandmarkIcon width={18} height={18} /></span>}
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
