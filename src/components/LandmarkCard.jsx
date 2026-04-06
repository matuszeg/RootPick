import { LANDMARK_MAP } from '../data/accessories.js';
import DieIcon from './DieIcon.jsx';

const SOURCE_LABELS = {
  underworld_landmarks: 'Underworld',
  homeland_landmarks:   'Homeland',
  landmarks_pack:       'Landmarks Pack',
};

export default function LandmarkCard({ landmarkId, index, onReroll, onImageClick }) {
  const landmark = LANDMARK_MAP[landmarkId];
  if (!landmark) return null;

  return (
    <div
      className="landmark-card"
      style={{ '--anim-delay': `${index * 60}ms` }}
    >
      {/* Card image */}
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

      {/* Action bar */}
      <div className="landmark-action-bar">
        <div className="landmark-action-bar-left">
          <span className="landmark-active-name">{landmark.name}</span>
          <span className="landmark-source-label">{SOURCE_LABELS[landmark.source] ?? landmark.source}</span>
        </div>
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
      </div>
    </div>
  );
}
