import { MAP_MAP, MAP_COLORS } from '../data/maps.js';
import DieIcon from './DieIcon.jsx';
import { StarIcon } from './Icons.jsx';

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

export default function MapCard({ mapId, onReroll, canReroll, onBoardClick }) {
  const map = MAP_MAP[mapId];
  if (!map) return null;

  const colors = MAP_COLORS[mapId] ?? { primary: '#6B5A4A', secondary: '#3A2A1A' };

  return (
    <div className="map-card" style={{ '--map-color': colors.primary, '--map-color-dark': colors.secondary }}>
      {map.img && (
        <div className="map-card-img-wrap" onClick={() => onBoardClick?.({ front: map.img, back: null }, map.name)}>
          <img src={map.img} alt={`${map.name} map board`} className="map-card-img" draggable={false} />
          <div className="map-card-img-overlay">
            <span className="map-card-zoom-hint">Click to enlarge</span>
          </div>
        </div>
      )}

      <div className="map-card-header">
        <div className="map-card-title-block">
          <div className="map-card-label">Map</div>
          <h2 className="map-card-name">{map.name}</h2>
          <div className="map-card-board">{map.board} board</div>
        </div>
        <div className="map-card-right">
          <Stars count={map.difficulty} />
          <span className="map-difficulty-label">{DIFFICULTY_LABELS[map.difficulty]}</span>
          {canReroll && (
            <button
              className="map-reroll-btn"
              onClick={onReroll}
              title="Re-roll map"
              aria-label="Re-roll map"
            >
              <DieIcon /> Re-roll map
            </button>
          )}
        </div>
      </div>

      <div className="map-card-body">
        <p className="map-description">{map.description}</p>
        {map.specialRules && (
          <p className="map-rules">
            <span className="map-rules-label">Rules: </span>
            {map.specialRules}
          </p>
        )}
      </div>
    </div>
  );
}
