import { MAP_MAP, MAP_COLORS } from '../data/maps.js';
import DieIcon from './DieIcon.jsx';
import { StarIcon } from './Icons.jsx';
import ClearingOverlay from './ClearingOverlay.jsx';

const DIFFICULTY_LABELS = { 1: 'Beginner-friendly', 2: 'Intermediate', 3: 'Advanced' };

function Stars({ count }) {
  return (
    <span className="stars" aria-label={`Difficulty: ${count} of 3`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={i < count ? 'star filled' : 'star empty'}>
          <StarIcon width={11} height={11} filled={i < count} />
        </span>
      ))}
    </span>
  );
}

export default function MapCard({
  mapId,
  mapSetup,
  totalPlayers = 0,
  forceSuitRandomizationOnAutumn = false,
  canReroll,
  onRerollMap,
  onRerollSuits,
  onRerollFloods,
  onRerollPlacements,
  onClearLocks,
  onToggleLock,
}) {
  const map = MAP_MAP[mapId];
  if (!map) return null;

  const colors = MAP_COLORS[mapId] ?? { primary: '#6B5A4A', secondary: '#3A2A1A' };

  // Which controls apply to this map+state?
  const suitsRandomized = mapSetup?.clearingSuits != null
    && (!map.hasPrintedSuits || forceSuitRandomizationOnAutumn);
  const showFloodReroll = !!mapSetup?.floodMarkers && map.hasFloodMarkers && totalPlayers <= 4;
  const showPlacementReroll = !!mapSetup?.nativeLandmarkPlacements
    && Object.keys(mapSetup.nativeLandmarkPlacements).length > 0;
  const lockCount = Object.keys(mapSetup?.lockedClearingSuits ?? {}).length;
  const showClearLocks = lockCount > 0;

  return (
    <div className="map-card" style={{ '--map-color': colors.primary, '--map-color-dark': colors.secondary }}>
      <div className="map-card-header">
        <div className="map-card-title-block">
          <div className="map-card-label">Map</div>
          <h2 className="map-card-name">{map.name}</h2>
          <div className="map-card-board">{map.board} board</div>
        </div>
        <div className="map-card-right">
          <div className="map-card-difficulty">
            <Stars count={map.difficulty} />
            <span className="map-difficulty-label">{DIFFICULTY_LABELS[map.difficulty]}</span>
          </div>
          <div className="map-card-actions">
            {canReroll && (
              <button className="map-reroll-btn" onClick={onRerollMap} title="Re-roll map">
                <DieIcon /> Map
              </button>
            )}
            {suitsRandomized && (
              <button className="map-reroll-btn" onClick={onRerollSuits} title="Re-roll clearing suits">
                <DieIcon /> Suits
              </button>
            )}
            {showFloodReroll && (
              <button className="map-reroll-btn" onClick={onRerollFloods} title="Re-roll flood placements">
                <DieIcon /> Floods
              </button>
            )}
            {showPlacementReroll && (
              <button className="map-reroll-btn" onClick={onRerollPlacements} title="Re-shuffle native landmark placements">
                <DieIcon /> Placements
              </button>
            )}
            {showClearLocks && (
              <button className="map-reroll-btn map-reroll-btn--alt" onClick={onClearLocks} title="Clear all locked clearings">
                ✕ Locks ({lockCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {map.img && (
        <div className="map-card-img-wrap">
          <div className="map-card-img-inner">
            <img src={map.img} alt={`${map.name} map board`} className="map-card-img" draggable={false} />
            <ClearingOverlay map={map} mapSetup={mapSetup} onToggleLock={onToggleLock} />
          </div>
        </div>
      )}

      <div className="map-card-body">
        <p className="map-description">{map.description}</p>
        {map.specialRules && (
          <p className="map-rules">
            <span className="map-rules-label">Rules: </span>
            {map.specialRules}
          </p>
        )}
        {onToggleLock && suitsRandomized && (
          <p className="map-card-hint">
            Click a clearing on the map to lock its suit. Locked clearings keep their suit when you re-roll suits.
          </p>
        )}
      </div>

    </div>
  );
}
