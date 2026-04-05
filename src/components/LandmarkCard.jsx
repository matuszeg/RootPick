import { LANDMARK_MAP } from '../data/accessories.js';
import DieIcon from './DieIcon.jsx';

const LANDMARK_ICONS = {
  tower: (
    <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="4" width="8" height="24" rx="1"/>
      <rect x="8" y="22" width="16" height="6" rx="1"/>
      <rect x="10" y="2" width="4" height="6" rx="1"/>
      <rect x="18" y="2" width="4" height="6" rx="1"/>
    </svg>
  ),
  market: (
    <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 14 L16 4 L28 14 L28 28 L4 28 Z"/>
      <rect x="12" y="18" width="8" height="10" rx="1" fill="white" opacity="0.3"/>
      <path d="M4 14 L16 4 L28 14" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  ),
  treetop: (
    <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2 L26 14 H21 L27 22 H18 L18 30 H14 L14 22 H5 L11 14 H6 Z"/>
    </svg>
  ),
  forge: (
    <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 28 L8 14 Q8 6 16 6 Q24 6 24 14 L24 28 Z"/>
      <rect x="6" y="26" width="20" height="4" rx="1"/>
      <ellipse cx="16" cy="14" rx="4" ry="5" fill="white" opacity="0.25"/>
    </svg>
  ),
  city: (
    <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="12"/>
      <path d="M16 6 L16 26 M6 16 L26 16" stroke="white" strokeWidth="1.5" opacity="0.3"/>
      <circle cx="16" cy="16" r="5" fill="white" opacity="0.2"/>
    </svg>
  ),
};

const SOURCE_LABELS = {
  underworld:    'Underworld',
  landmarks_pack: 'Landmarks Pack',
};

export default function LandmarkCard({ landmarkIds, onReroll }) {
  if (!landmarkIds?.length) return null;
  const landmarks = landmarkIds.map(id => LANDMARK_MAP[id]).filter(Boolean);
  if (!landmarks.length) return null;

  return (
    <div className="landmark-card">
      <div className="landmark-card-header">
        <div>
          <div className="landmark-card-label">Landmarks</div>
          <span className="landmark-count">{landmarks.length} in play</span>
        </div>
        <button className="landmark-reroll-btn" onClick={onReroll} title="Re-roll landmarks">
          <DieIcon /> Re-roll
        </button>
      </div>
      <div className="landmark-list">
        {landmarks.map(lm => (
          <div key={lm.id} className="landmark-item">
            <span className="landmark-icon">{LANDMARK_ICONS[lm.id]}</span>
            <div className="landmark-item-content">
              <div className="landmark-item-header">
                <span className="landmark-item-name">{lm.name}</span>
                <span className="landmark-source">{SOURCE_LABELS[lm.source]}</span>
              </div>
              <p className="landmark-item-desc">{lm.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
