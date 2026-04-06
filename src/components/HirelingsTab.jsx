import { ACCESSORIES, HIRELING_SETS } from '../data/accessories.js';
import { CheckIcon, XIcon } from './Icons.jsx';
import HirelingCard from './HirelingCard.jsx';
import DieIcon from './DieIcon.jsx';

const HIRELING_SOURCE_COLORS = {
  marauder_hirelings_base: '#C83228',
  marauder_hirelings:      '#C83228',
  riverfolk_hirelings:  '#3AACA8',
  underworld_hirelings: '#7B4FA3',
  homeland_hirelings:   '#3A9CB0',
};

const HIRELING_GROUPS = [
  { source: 'marauder_hirelings_base', label: 'Marauder Expansion' },
  { source: 'marauder_hirelings',      label: 'Marauder Hirelings Pack' },
  { source: 'riverfolk_hirelings',     label: 'Riverfolk Hirelings Pack' },
  { source: 'underworld_hirelings',    label: 'Underworld Hirelings Pack' },
  { source: 'homeland_hirelings',      label: 'Homeland Hirelings Pack' },
];

function HirelingPoolCard({ hireling, excluded, banned, onToggle, onUnban }) {
  const accentColor = HIRELING_SOURCE_COLORS[hireling.source] ?? '#7A5A2A';
  if (banned) {
    return (
      <div className="hireling-pool-card hireling-pool-card--banned">
        <div className="hireling-pool-thumb-wrap">
          <img src={hireling.promotedImg} alt={hireling.promoted} className="hireling-pool-thumb" />
          <div className="hireling-pool-banned-overlay">Banned</div>
        </div>
        <div className="hireling-pool-info">
          <span className="hireling-pool-name">{hireling.promoted}</span>
          <span className="hireling-pool-sides">{hireling.promoted} / {hireling.demoted}</span>
          <button className="hireling-pool-unban-btn" onClick={onUnban}>Unban</button>
        </div>
      </div>
    );
  }
  return (
    <button
      className={`hireling-pool-card ${excluded ? 'hireling-pool-card--excluded' : ''}`}
      onClick={onToggle}
      style={{ '--hireling-accent': accentColor }}
      title={excluded ? `Include "${hireling.promoted}" in pool` : `Exclude "${hireling.promoted}" from pool`}
    >
      <div className="hireling-pool-thumb-wrap">
        <img src={hireling.promotedImg} alt={hireling.promoted} className="hireling-pool-thumb" />
        {excluded && <div className="hireling-pool-excluded-overlay">Excluded</div>}
      </div>
      <div className="hireling-pool-info">
        <span className="hireling-pool-name">{hireling.promoted}</span>
        <span className="hireling-pool-sides">{hireling.promoted} / {hireling.demoted}</span>
        <span className={`hireling-pool-toggle ${excluded ? 'off' : 'on'}`}>{excluded ? <XIcon width={12} height={12} /> : <CheckIcon width={12} height={12} />}</span>
      </div>
    </button>
  );
}

export default function HirelingsTab({ state, actions, subTab, onSubTabChange, onImageClick }) {
  const { ownedAccessories, selectedHirelings, hirelingStatuses, lockedHirelings, bannedHirelings, excludedHirelings } = state;

  const canUseHirelings = HIRELING_SETS.some(h => ownedAccessories.has(h.source));
  const availableAccessories = ACCESSORIES.filter(a => a.category === 'hireling');
  const availableHirelings = HIRELING_SETS.filter(h => ownedAccessories.has(h.source));

  return (
    <div className="tab-panel">
      <div className="tab-filters">
        <div className="filter-group">
          <h3 className="filter-heading">Hireling Packs</h3>
          {availableAccessories.map(a => (
            <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
              <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
              <span className="checkbox-box" />
              <span className="expansion-name">{a.name}</span>
            </label>
          ))}
          {canUseHirelings && (
            <p className="mode-description">Hirelings are included automatically when any pack is checked.</p>
          )}
          {!canUseHirelings && (
            <p className="mode-description">Check a hireling pack above to include hirelings in your session.</p>
          )}
        </div>
      </div>

      <div className="sub-tabs" role="tablist">
        <button className={`sub-tab ${subTab === 'results' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'results'} onClick={() => onSubTabChange('results')}>Results</button>
        <button className={`sub-tab ${subTab === 'pool' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'pool'} onClick={() => onSubTabChange('pool')}>Pool</button>
      </div>

      {subTab === 'results' && (
        <div className="sub-tab-content">
          {selectedHirelings.length > 0 ? (
            <>
              <button className="reroll-all-btn" onClick={actions.rerollHirelings}>
                <DieIcon /> Re-roll all hirelings
              </button>
              <div className="hirelings-grid">
                {selectedHirelings.map((hid, i) => (
                  <HirelingCard
                    key={hid}
                    hirelingId={hid}
                    index={i}
                    status={hirelingStatuses[i] ?? null}
                    locked={lockedHirelings.has(hid)}
                    onReroll={() => actions.rerollSingleHireling(hid)}
                    onLock={() => actions.toggleLockHireling(hid)}
                    onBan={() => actions.banHireling(hid)}
                    onImageClick={onImageClick}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="tab-empty-state">
              {canUseHirelings ? (
                <>
                  <p>No hirelings picked yet.</p>
                  <p className="tab-empty-sub">Hit Randomize above to get started.</p>
                </>
              ) : (
                <>
                  <p>No hireling packs enabled.</p>
                  <p className="tab-empty-sub">Check a pack above to include hirelings in your session.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {subTab === 'pool' && (
        <div className="sub-tab-content">
          {availableHirelings.length === 0 ? (
            <div className="pool-empty"><p>No hirelings available. Enable hireling packs above.</p></div>
          ) : (
            <>
              <p className="pool-tab-hint">Click a hireling card to exclude or include it from the draw.</p>
              {HIRELING_GROUPS.map(group => {
                const groupHirelings = availableHirelings.filter(h => h.source === group.source);
                if (groupHirelings.length === 0) return null;
                return (
                  <div key={group.source} className="pool-section">
                    <h4 className="pool-section-heading" style={{ borderColor: HIRELING_SOURCE_COLORS[group.source] ?? '#7A5A2A' }}>
                      {group.label}
                    </h4>
                    <div className="hireling-pool-grid">
                      {groupHirelings.map(h => (
                        <HirelingPoolCard
                          key={h.id}
                          hireling={h}
                          excluded={excludedHirelings.has(h.id)}
                          banned={bannedHirelings.has(h.id)}
                          onToggle={() => actions.toggleExcludedHireling(h.id)}
                          onUnban={() => actions.unbanHireling(h.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
