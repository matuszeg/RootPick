import { HIRELING_MAP } from '../data/accessories.js';

const SOURCE_LABELS = {
  marauder:            'Marauder',
  marauder_hirelings:  'Marauder Pack',
  riverfolk_hirelings: 'Riverfolk Pack',
  underworld_hirelings:'Underworld Pack',
  homeland_hirelings:  'Homeland Pack',
};

export default function HirelingCard({ hirelingId, index, onReroll }) {
  const hireling = HIRELING_MAP[hirelingId];
  if (!hireling) return null;

  return (
    <div className="hireling-card" style={{ '--anim-delay': `${index * 60}ms` }}>
      <div className="hireling-card-header">
        <div className="hireling-header-left">
          <span className="hireling-index">#{index + 1}</span>
          <div>
            <div className="hireling-card-label">Hireling</div>
            <span className="hireling-source-badge">{SOURCE_LABELS[hireling.source] ?? hireling.source}</span>
          </div>
        </div>
        <button
          className="hireling-reroll-btn"
          onClick={onReroll}
          title="Re-roll this hireling"
          aria-label="Re-roll hireling"
        >
          🔄
        </button>
      </div>
      <div className="hireling-card-body">
        <h3 className="hireling-name">{hireling.name}</h3>
        <div className="hireling-sides">
          <span className="hireling-side promoted">▲ {hireling.promoted}</span>
          <span className="hireling-side demoted">▽ {hireling.demoted}</span>
        </div>
        <p className="hireling-description">{hireling.description}</p>
      </div>
    </div>
  );
}
