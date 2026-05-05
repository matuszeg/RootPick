import { MAP_MAP } from '../data/maps.js';
import { LANDMARK_MAP } from '../data/accessories.js';
import DieIcon from './DieIcon.jsx';

const SUIT_LABEL = {
  fox: 'Fox',
  rabbit: 'Rabbit',
  mouse: 'Mouse',
};

const SUIT_COLOR = {
  fox: '#C4621A',
  rabbit: '#B8985A',
  mouse: '#8A6B3A',
};

export default function MapSetupCard({ state, actions, onImageClick }) {
  const { selectedMap, mapSetup, excludedLandmarks } = state;
  if (!selectedMap || !mapSetup) return null;

  const map = MAP_MAP[selectedMap];
  if (!map) return null;

  const totalPlayers = state.playerCount + state.botCount;

  const nativeLandmarkIds = mapSetup.nativeLandmarkIds ?? [];
  const showSuits = mapSetup.clearingSuits != null;
  const isPrintedSuits = map.hasPrintedSuits && !state.forceSuitRandomizationOnAutumn;
  const showFloods = mapSetup.floodMarkers != null && map.hasFloodMarkers && totalPlayers <= 4;
  const suitsRerollable = !isPrintedSuits;

  return (
    <div className="map-setup-card">
      <h3 className="map-setup-header">Map Setup</h3>

      {nativeLandmarkIds.length > 0 && (
        <section className="map-setup-section">
          <h4>Native Landmarks</h4>
          <ul className="native-landmark-list">
            {nativeLandmarkIds.map(id => {
              const lm = LANDMARK_MAP[id];
              if (!lm) return null;
              const warning = excludedLandmarks.has(id)
                ? `Built into ${map.name}; your pool exclusion only affects other maps.`
                : null;
              return (
                <li key={id} className="native-landmark-row">
                  <button
                    type="button"
                    className="native-landmark-thumb"
                    onClick={() => onImageClick?.({ front: lm.frontImg, back: lm.backImg }, lm.name)}
                    title={`View ${lm.name}`}
                  >
                    <img src={lm.frontImg} alt="" draggable={false} />
                  </button>
                  <div className="native-landmark-body">
                    <div className="native-landmark-name">
                      {lm.name}
                      <span className="landmark-tag"> (built-in)</span>
                    </div>
                    <div className="native-landmark-desc">{lm.description}</div>
                    {warning && <div className="native-landmark-warning">{warning}</div>}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {showSuits && (
        <section className="map-setup-section">
          <div className="map-setup-section-head">
            <h4>
              Clearing Suits
              {isPrintedSuits && <span className="landmark-tag"> (printed, not randomized)</span>}
            </h4>
            {suitsRerollable && (
              <button className="reroll-btn" onClick={actions.rerollClearingSuits} title="Re-roll clearing suits">
                <DieIcon /> Re-roll suits
              </button>
            )}
          </div>
          <div className="clearing-suit-grouped">
            {['fox', 'rabbit', 'mouse'].map(suit => {
              const ids = Object.entries(mapSetup.clearingSuits)
                .filter(([, s]) => s === suit)
                .map(([id]) => Number(id))
                .sort((a, b) => a - b);
              return (
                <div key={suit} className="clearing-suit-group" style={{ borderColor: SUIT_COLOR[suit] }}>
                  <div className="clearing-suit-group-head" style={{ color: SUIT_COLOR[suit] }}>
                    {SUIT_LABEL[suit]} <span className="clearing-suit-count">({ids.length})</span>
                  </div>
                  <div className="clearing-suit-chips">
                    {ids.length === 0 ? (
                      <span className="clearing-suit-empty">—</span>
                    ) : (
                      ids.map(id => (
                        <span key={id} className="clearing-chip">{id}</span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {showFloods && (
        <section className="map-setup-section">
          <div className="map-setup-section-head">
            <h4>Flood Markers</h4>
            <button className="reroll-btn" onClick={actions.rerollFloodMarkers} title="Re-roll flood placements">
              <DieIcon /> Re-roll floods
            </button>
          </div>
          <ul className="flood-marker-list">
            {map.floodMarkers.map(fm => (
              <li key={fm.id} className="flood-marker-row">
                <span className="flood-swatch" style={{ background: fm.color }} />
                <span className="flood-name">{fm.name}</span>
                <span className="flood-clearing">→ Clearing {mapSetup.floodMarkers[fm.id]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
