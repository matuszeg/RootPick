import { MAP_MAP, MAP_COLORS } from '../data/maps.js';

const DIFFICULTY_LABELS = { 1: 'Beginner-friendly', 2: 'Intermediate', 3: 'Advanced' };

function Stars({ count }) {
  return (
    <span className="stars" aria-label={`Difficulty: ${count} of 3`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={i < count ? 'star filled' : 'star empty'}>★</span>
      ))}
    </span>
  );
}

// Simple SVG map icons per map side
const MAP_ICONS = {
  autumn: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tree canopy */}
      <path d="M24 6 L36 22 H29 L36 32 H27 L34 42 H14 L21 32 H12 L19 22 H12 Z" fill="currentColor" opacity="0.9"/>
    </svg>
  ),
  winter: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Snowflake */}
      {[0, 60, 120].map((deg, i) => {
        const r = (Math.PI * deg) / 180;
        const r2 = r + Math.PI / 2;
        return (
          <g key={i}>
            <line x1={24 + 18 * Math.cos(r)} y1={24 + 18 * Math.sin(r)} x2={24 - 18 * Math.cos(r)} y2={24 - 18 * Math.sin(r)} stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <line x1={24 + 18 * Math.cos(r2)} y1={24 + 18 * Math.sin(r2)} x2={24 - 18 * Math.cos(r2)} y2={24 - 18 * Math.sin(r2)} stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </g>
        );
      })}
      <circle cx="24" cy="24" r="3" fill="currentColor"/>
    </svg>
  ),
  mountain: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 6 L44 42 H4 Z" fill="currentColor" opacity="0.9"/>
      <path d="M24 6 L32 22 L26 22 L28 14 Z" fill="white" opacity="0.2"/>
      {/* Pass marker */}
      <rect x="21" y="26" width="6" height="10" rx="1" fill="white" opacity="0.35"/>
    </svg>
  ),
  lake: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Lake oval */}
      <ellipse cx="24" cy="24" rx="14" ry="10" fill="currentColor" opacity="0.9"/>
      {/* Wave lines */}
      <path d="M16 22 Q20 19 24 22 Q28 25 32 22" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
      <path d="M16 26 Q20 23 24 26 Q28 29 32 26" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* Ferry boat */}
      <path d="M20 18 L28 18 L30 22 L18 22 Z" fill="white" opacity="0.4"/>
    </svg>
  ),
  marsh: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Water ripples */}
      <ellipse cx="24" cy="34" rx="16" ry="6" fill="currentColor" opacity="0.5"/>
      {/* Reeds */}
      <line x1="16" y1="34" x2="16" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="24" y1="34" x2="24" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="32" y1="34" x2="32" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="16" cy="14" rx="4" ry="2.5" fill="currentColor"/>
      <ellipse cx="24" cy="10" rx="4" ry="2.5" fill="currentColor"/>
      <ellipse cx="32" cy="16" rx="4" ry="2.5" fill="currentColor"/>
    </svg>
  ),
  gorge: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gorge walls */}
      <path d="M4 8 L16 8 L20 40 L4 40 Z" fill="currentColor" opacity="0.9"/>
      <path d="M44 8 L32 8 L28 40 L44 40 Z" fill="currentColor" opacity="0.9"/>
      {/* Narrow pass */}
      <path d="M20 40 L28 40 L24 20 Z" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
};


export default function MapCard({ mapId, onReroll, canReroll }) {
  const map = MAP_MAP[mapId];
  if (!map) return null;

  const colors = MAP_COLORS[mapId] ?? { primary: '#6B5A4A', secondary: '#3A2A1A' };

  return (
    <div className="map-card" style={{ '--map-color': colors.primary, '--map-color-dark': colors.secondary }}>
      <div className="map-card-header">
        <div className="map-card-icon">
          {MAP_ICONS[mapId]}
        </div>
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
              🔄 Re-roll map
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
