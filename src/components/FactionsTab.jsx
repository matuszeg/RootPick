import { useState } from 'react';
import { EXPANSIONS, FACTIONS, FACTION_MAP } from '../data/factions.js';
import { MAP_MAP } from '../data/maps.js';
import { VAGABOND_CHARACTERS } from '../data/accessories.js';
import { getReachThreshold } from '../utils/randomizer.js';
import { CheckIcon, StarIcon, FlameIcon, XIcon } from './Icons.jsx';
import FactionCard from './FactionCard.jsx';
import FactionIcon from './FactionIcon.jsx';
import ReachSummary from './ReachSummary.jsx';
import DieIcon from './DieIcon.jsx';

function StarsInline({ count }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} width={10} height={10} filled />
      ))}
    </>
  );
}

function InfoIcon({ tip }) {
  return <span className="info-icon" title={tip} aria-label={tip}>?</span>;
}

const EXCLUSION_PAIRS = [
  { key: 'knaves+vagabond1', label: 'Knaves + Vagabond', description: 'Normally cannot play together' },
  { key: 'knaves+vagabond2', label: 'Knaves + Vagabond (2nd)', description: 'Normally cannot play together' },
];

function PoolItem({ name, icon, meta, excluded, onToggle, accentColor }) {
  return (
    <button
      className={`pool-item ${excluded ? 'excluded' : ''}`}
      onClick={onToggle}
      title={excluded ? `Click to include "${name}" in pool` : `Click to exclude "${name}" from pool`}
      style={{ '--pool-accent': accentColor ?? 'var(--gold)' }}
    >
      <span className="pool-item-icon">{icon}</span>
      <span className="pool-item-body">
        <span className="pool-item-name">{name}</span>
        {meta && <span className="pool-item-meta">{meta}</span>}
      </span>
      <span className={`pool-item-toggle ${excluded ? 'off' : 'on'}`}>
        {excluded ? <XIcon width={12} height={12} /> : <CheckIcon width={12} height={12} />}
      </span>
    </button>
  );
}

const CHARACTER_COLOR = '#8C7B6A';

function FactionPool({ state, actions }) {
  const { ownedExpansions, bannedFactions } = state;

  const available = FACTIONS.filter(f =>
    !f.isBot &&
    ownedExpansions.has(f.expansion) &&
    (!f.requiresExpansion || ownedExpansions.has(f.requiresExpansion))
  );
  const bots = FACTIONS.filter(f =>
    f.isBot &&
    ownedExpansions.has(f.expansion) &&
    (!f.requiresExpansion || ownedExpansions.has(f.requiresExpansion))
  );

  if (available.length === 0 && bots.length === 0) {
    return <div className="pool-empty"><p>No factions available. Enable expansions above.</p></div>;
  }

  const militants = available.filter(f => f.type === 'militant').sort((a, b) => b.reach - a.reach);
  const insurgents = available.filter(f => f.type === 'insurgent').sort((a, b) => b.reach - a.reach);

  return (
    <>
      <p className="pool-tab-hint">Click a faction to exclude or include it in the randomization pool.</p>

      {militants.length > 0 && (
        <div className="pool-section">
          <h4 className="pool-section-heading militant">Militants</h4>
          <div className="pool-grid">
            {militants.map(f => (
              <PoolItem
                key={f.id}
                name={f.name}
                icon={<FactionIcon factionId={f.id} className="pool-faction-icon" />}
                meta={<>Reach {f.reach} · <StarsInline count={f.difficulty} /></>}
                accentColor={f.color}
                excluded={bannedFactions.has(f.id)}
                onToggle={() => bannedFactions.has(f.id) ? actions.unbanFaction(f.id) : actions.banFaction(f.id)}
              />
            ))}
          </div>
        </div>
      )}

      {insurgents.length > 0 && (
        <div className="pool-section">
          <h4 className="pool-section-heading insurgent">Insurgents</h4>
          <div className="pool-grid">
            {insurgents.map(f => (
              <PoolItem
                key={f.id}
                name={f.name}
                icon={<FactionIcon factionId={f.id} className="pool-faction-icon" />}
                meta={<>Reach {f.reach} · <StarsInline count={f.difficulty} /></>}
                accentColor={f.color}
                excluded={bannedFactions.has(f.id)}
                onToggle={() => bannedFactions.has(f.id) ? actions.unbanFaction(f.id) : actions.banFaction(f.id)}
              />
            ))}
          </div>
        </div>
      )}

      {bots.length > 0 && (
        <div className="pool-section">
          <h4 className="pool-section-heading">Bots</h4>
          <div className="pool-grid">
            {bots.map(f => (
              <PoolItem
                key={f.id}
                name={f.name}
                icon={<FactionIcon factionId={f.id} className="pool-faction-icon" />}
                meta={`Reach ${f.reach} · ${f.type === 'militant' ? 'Militant' : 'Insurgent'}`}
                accentColor={FACTION_MAP[f.automatesId].color}
                excluded={bannedFactions.has(f.id)}
                onToggle={() => bannedFactions.has(f.id) ? actions.unbanFaction(f.id) : actions.banFaction(f.id)}
              />
            ))}
          </div>
        </div>
      )}

      <VagabondCharacterPool state={state} actions={actions} />
    </>
  );
}

function VagabondCharacterPool({ state, actions }) {
  const { ownedAccessories, excludedCharacters } = state;

  const SOURCE_LABEL = {
    base: 'Base Game',
    riverfolk_characters: 'Riverfolk',
    vagabond_pack: 'Vagabond Pack',
    homeland_characters: 'Homeland',
  };

  const available = VAGABOND_CHARACTERS.filter(c => {
    if (c.source === 'base') return true;
    return ownedAccessories.has(c.source);
  });

  if (available.length === 0) return null;

  return (
    <div className="pool-section">
      <h4 className="pool-section-heading">Vagabond Characters</h4>
      <div className="pool-grid">
        {available.map(c => (
          <PoolItem
            key={c.id}
            name={c.name}
            icon={<img src={c.faceImg} alt={c.name} className="pool-character-face" />}
            meta={SOURCE_LABEL[c.source] ?? c.source}
            accentColor={CHARACTER_COLOR}
            excluded={excludedCharacters.has(c.id)}
            onToggle={() => actions.toggleExcludedCharacter(c.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function FactionsTab({ state, actions, subTab, onSubTabChange, onBoardClick }) {
  const {
    ownedExpansions, balanceMode, requireBalance, avoidUnderdogs,
    difficulties, customMinReach, customMaxReach,
    allowedExclusions, selectedFactions, lockedFactions, bannedFactions,
    vagabondCharacters, playerCount, botCount,
  } = state;

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const threshold = getReachThreshold(balanceMode, playerCount + botCount);
  const hasAdvancedOverrides = customMinReach !== null || customMaxReach !== null || allowedExclusions.size > 0;

  const mapData = state.selectedMap ? MAP_MAP[state.selectedMap] : null;

  function canRerollFaction(factionId) {
    const isBot = FACTION_MAP[factionId]?.isBot ?? false;
    const excluded = new Set([...bannedFactions, ...selectedFactions]);
    return FACTIONS.some(f => {
      if (!!f.isBot !== isBot) return false;
      if (excluded.has(f.id)) return false;
      if (!ownedExpansions.has(f.expansion)) return false;
      if (f.requiresExpansion && !ownedExpansions.has(f.requiresExpansion)) return false;
      if (!isBot && !difficulties.has(f.difficulty)) return false;
      return true;
    });
  }

  return (
    <div className="tab-panel">
      {/* Filters */}
      <div className="tab-filters">
        <div className="filter-group">
          <h3 className="filter-heading">Expansions</h3>
          <div className="expansion-list">
            {EXPANSIONS.map(exp => (
              <label
                key={exp.id}
                className={`expansion-check ${ownedExpansions.has(exp.id) ? 'checked' : ''} ${exp.required ? 'disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={ownedExpansions.has(exp.id)}
                  disabled={exp.required}
                  onChange={() => !exp.required && actions.toggleExpansion(exp.id)}
                />
                <span className="checkbox-box" />
                <span className="expansion-name">{exp.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3 className="filter-heading">Game Balance</h3>
          <div className="balance-options">
            <label className={`balance-option ${balanceMode === 'balanced' ? 'active' : ''}`}>
              <input type="radio" name="balanceMode" checked={balanceMode === 'balanced'} onChange={() => actions.setBalanceMode('balanced')} />
              <div className="balance-option-content">
                <span className="balance-option-name">Balanced</span>
                <span className="balance-option-desc">All factions have a fair shot at winning</span>
              </div>
            </label>
            <label className={`balance-option ${balanceMode === 'standard' ? 'active' : ''}`}>
              <input type="radio" name="balanceMode" checked={balanceMode === 'standard'} onChange={() => actions.setBalanceMode('standard')} />
              <div className="balance-option-content">
                <span className="balance-option-name">Standard</span>
                <span className="balance-option-desc">Leder's published minimum — looser but still reasonable</span>
              </div>
            </label>
            <label className={`balance-option chaos ${balanceMode === 'chaos' ? 'active' : ''}`}>
              <input type="radio" name="balanceMode" checked={balanceMode === 'chaos'} onChange={() => actions.setBalanceMode('chaos')} />
              <div className="balance-option-content">
                <span className="balance-option-name">Chaos Mode <FlameIcon width={13} height={13} /></span>
                <span className="balance-option-desc">No reach minimum. Truly anything goes. Experienced players only.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="filter-group">
          <h3 className="filter-heading">
            Type Balance
            <InfoIcon tip="Militants control territory from the start. Insurgents disrupt and explode late. A mix makes for a more dynamic game." />
          </h3>
          <label className={`expansion-check ${requireBalance ? 'checked' : ''}`}>
            <input type="checkbox" checked={requireBalance} onChange={e => actions.setRequireBalance(e.target.checked)} />
            <span className="checkbox-box" />
            <span className="expansion-name">Ensure a balanced combination</span>
          </label>
          <p className="mode-description">Requires at least one Militant and one Insurgent in the result.</p>
        </div>

        <div className="filter-group">
          <h3 className="filter-heading">
            Win Rate Filter
            <InfoIcon tip="Excludes factions with a win rate below 20% for the current player count, based on community game data. Factions without enough recorded games are always included." />
          </h3>
          <label className={`expansion-check ${avoidUnderdogs ? 'checked' : ''}`}>
            <input type="checkbox" checked={avoidUnderdogs} onChange={e => actions.setAvoidUnderdogs(e.target.checked)} />
            <span className="checkbox-box" />
            <span className="expansion-name">Avoid underdogs (below 20% WR)</span>
          </label>
          <p className="mode-description">Only affects factions with ≥50 recorded games. Factions without data are always included.</p>
        </div>

        <div className="filter-group">
          <h3 className="filter-heading">
            Faction Difficulty
            <InfoIcon tip="Only factions matching the selected difficulties will appear in the pool." />
          </h3>
          <p className="setup-heading-sub">Include in pool</p>
          <div className="difficulty-pills">
            {[
              { level: 1, label: 'Beginner' },
              { level: 2, label: 'Intermediate' },
              { level: 3, label: 'Expert' },
            ].map(({ level, label }) => (
              <button
                key={level}
                className={`diff-pill ${difficulties.has(level) ? 'active' : ''}`}
                onClick={() => actions.toggleDifficulty(level)}
                aria-pressed={difficulties.has(level)}
              >
                {difficulties.has(level) && <CheckIcon width={12} height={12} />} <StarsInline count={level} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <button
            className={`advanced-toggle ${advancedOpen ? 'open' : ''} ${hasAdvancedOverrides ? 'has-overrides' : ''}`}
            onClick={() => setAdvancedOpen(o => !o)}
            aria-expanded={advancedOpen}
          >
            <span>
              ⚙ Advanced
              {hasAdvancedOverrides && <span className="override-badge">overrides active</span>}
            </span>
            <span className={`chevron ${advancedOpen ? 'up' : ''}`}>▾</span>
          </button>
          {advancedOpen && (
            <div className="advanced-panel">
              <p className="advanced-warning">⚠ These settings override standard rules. Results may be unbalanced or unconventional.</p>
              <div className="advanced-row">
                <label className="advanced-label">
                  Min Reach
                  <InfoIcon tip="Override the minimum total reach. Leave blank to use the current balance mode's threshold." />
                </label>
                <div className="reach-inputs">
                  <input type="number" className="reach-input" placeholder={threshold === 0 ? '0' : String(threshold)} min="0" max="99" value={customMinReach ?? ''} onChange={e => actions.setCustomMinReach(e.target.value === '' ? null : Number(e.target.value))} />
                  <span className="reach-input-sep">to</span>
                  <input type="number" className="reach-input" placeholder="max" min="0" max="99" value={customMaxReach ?? ''} onChange={e => actions.setCustomMaxReach(e.target.value === '' ? null : Number(e.target.value))} />
                  {(customMinReach !== null || customMaxReach !== null) && (
                    <button className="reach-reset" onClick={() => { actions.setCustomMinReach(null); actions.setCustomMaxReach(null); }} title="Reset to default">×</button>
                  )}
                </div>
              </div>
              <div className="advanced-row">
                <label className="advanced-label">
                  Allow Excluded Pairs
                  <InfoIcon tip="Override mutual exclusion rules to allow normally-incompatible factions together." />
                </label>
                <div className="exclusion-list">
                  {EXCLUSION_PAIRS.map(({ key, label, description }) => (
                    <label key={key} className={`expansion-check ${allowedExclusions.has(key) ? 'checked' : ''}`}>
                      <input type="checkbox" checked={allowedExclusions.has(key)} onChange={() => actions.toggleAllowedExclusion(key)} />
                      <span className="checkbox-box" />
                      <span className="expansion-name">{label}<span className="exclusion-desc"> — {description}</span></span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="sub-tabs" role="tablist">
        <button className={`sub-tab ${subTab === 'results' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'results'} onClick={() => onSubTabChange('results')}>Results</button>
        <button className={`sub-tab ${subTab === 'pool' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'pool'} onClick={() => onSubTabChange('pool')}>Pool</button>
      </div>

      {subTab === 'results' && (
        <div className="sub-tab-content">
          {selectedFactions.length > 0 ? (
            <>
              <ReachSummary selectedFactions={selectedFactions} playerCount={playerCount} balanceMode={balanceMode} />
              <button className="reroll-all-btn" onClick={() => actions.randomize(true)}>
                <DieIcon /> {lockedFactions.size > 0 ? 'Re-roll unlocked factions' : 'Re-roll all factions'}
              </button>
              <div className="cards-grid">
                {selectedFactions.map((id, i) => (
                  <FactionCard
                    key={`${id}-${i}`}
                    factionId={id}
                    locked={lockedFactions.has(id)}
                    animIndex={i}
                    onLock={() => actions.toggleLock(id)}
                    onReroll={() => actions.rerollSingle(id)}
                    canReroll={canRerollFaction(id)}
                    onBan={() => actions.banFaction(id)}
                    mapNote={mapData?.factionNotes?.[id] ?? null}
                    vagabondCharacter={vagabondCharacters[id] ?? null}
                    onRerollCharacter={() => actions.rerollVagabondCharacter(id)}
                    playerCount={playerCount + botCount}
                    onBoardClick={onBoardClick}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="tab-empty-state">
              <p>No factions picked yet.</p>
              <p className="tab-empty-sub">Hit Randomize above to get started.</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'pool' && (
        <div className="sub-tab-content">
          <FactionPool state={state} actions={actions} />
        </div>
      )}
    </div>
  );
}
