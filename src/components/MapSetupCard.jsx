import { MAP_MAP } from '../data/maps.js';
import { LANDMARK_MAP } from '../data/accessories.js';
import LandmarkCard from './LandmarkCard.jsx';
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
          <div className="landmarks-grid">
            {nativeLandmarkIds.map(id => {
              const lm = LANDMARK_MAP[id];
              if (!lm) return null;
              const warning = excludedLandmarks.has(id)
                ? `${lm.name} is built into the ${map.name} map and is shown here — your Manage Pool exclusion only affects random draws on other maps.`
                : null;
              return (
                <LandmarkCard
                  key={id}
                  landmarkId={id}
                  variant="native"
                  warning={warning}
                  onImageClick={onImageClick}
                />
              );
            })}
          </div>
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
          <ul className="clearing-suit-list">
            {Object.entries(mapSetup.clearingSuits)
              .map(([id, suit]) => [Number(id), suit])
              .sort((a, b) => a[0] - b[0])
              .map(([id, suit]) => (
                <li key={id} className="clearing-suit-row">
                  <span className="clearing-id">Clearing {id}</span>
                  <span className="clearing-suit" style={{ color: SUIT_COLOR[suit] }}>
                    {SUIT_LABEL[suit] ?? suit}
                  </span>
                </li>
              ))}
          </ul>
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
