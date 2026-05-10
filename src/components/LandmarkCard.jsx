import { LANDMARK_MAP } from '../data/accessories.js';
import DieIcon from './DieIcon.jsx';

const SOURCE_LABELS = {
  underworld_landmarks: 'Underworld',
  homeland_landmarks:   'Homeland',
  landmarks_pack:       'Landmarks Pack',
};

export default function LandmarkCard({ landmarkId, index, onReroll, onImageClick, variant = 'random', warning = null }) {
  const landmark = LANDMARK_MAP[landmarkId];
  if (!landmark) return null;
  const isNative = variant === 'native';

  return (
    <div
      className={`landmark-card ${isNative ? 'native' : ''}`}
      style={{ '--anim-delay': `${(index ?? 0) * 60}ms` }}
    >
      <div
        className="landmark-img-wrapper"
        onClick={() => onImageClick?.({
          front: landmark.frontImg,
          back:  landmark.backImg,
        }, landmark.name)}
        style={{ cursor: onImageClick ? 'pointer' : undefined }}
      >
        <img
          src={landmark.frontImg}
          alt={landmark.name}
          className="landmark-card-img"
          draggable={false}
        />
      </div>

      <div className="landmark-action-bar">
        <div className="landmark-action-bar-left">
          <span className="landmark-active-name">
            {landmark.name}
            {isNative && <span className="landmark-tag"> (built-in)</span>}
          </span>
          <span className="landmark-source-label">{SOURCE_LABELS[landmark.source] ?? landmark.source}</span>
        </div>
        {!isNative && onReroll && (
          <div className="landmark-action-bar-right">
            <button
              className="landmark-btn landmark-reroll-btn"
              onClick={onReroll}
              title="Re-roll this landmark"
              aria-label="Re-roll landmark"
            >
              <DieIcon />
            </button>
          </div>
        )}
      </div>

      {warning && <p className="landmark-warning">{warning}</p>}
    </div>
  );
}
