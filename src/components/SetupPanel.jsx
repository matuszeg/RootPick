import { useState, useEffect, useRef } from 'react';
import { EXPANSIONS } from '../data/factions.js';
import { ACCESSORIES, HIRELING_SETS } from '../data/accessories.js';
import { getReachThreshold } from '../utils/randomizer.js';

// All mutually-excluding pairs in the game
const EXCLUSION_PAIRS = [
  { key: 'knaves+vagabond1', label: 'Knaves + Vagabond', description: 'Normally cannot play together' },
  { key: 'knaves+vagabond2', label: 'Knaves + Vagabond (2nd)', description: 'Normally cannot play together' },
];

function InfoIcon({ tip }) {
  return (
    <span className="info-icon" title={tip} aria-label={tip}>?</span>
  );
}

export default function SetupPanel({ state, actions }) {
  const {
    ownedExpansions, playerCount, botCount, balanceMode, requireBalance, avoidUnderdogs,
    difficulties, mapDifficulties, advancedMode, customMinReach, customMaxReach,
    allowedExclusions, ownedAccessories, useHirelings, useLandmarks, landmarkCount,
    customHirelingCount,
  } = state;

  const canUseHirelings = HIRELING_SETS.some(h =>
    h.source === 'marauder' ? ownedExpansions.has('marauder') : ownedAccessories.has(h.source)
  );
  const canUseLandmarks = ownedAccessories.has('landmarks_pack');
  const canUseBots = ownedExpansions.has('clockwork') || ownedExpansions.has('clockwork2');

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);
  const [mapsOpen, setMapsOpen] = useState(false);
  const [botsOpen, setBotsOpen] = useState(false);
  const [botAnim, setBotAnim] = useState('idle'); // 'idle' | 'activating' | 'deactivating'
  const prevCanUseBots = useRef(canUseBots);
  useEffect(() => {
    if (prevCanUseBots.current === canUseBots) return;
    prevCanUseBots.current = canUseBots;
    setBotAnim(canUseBots ? 'activating' : 'deactivating');
    if (canUseBots) setBotsOpen(true);
    const t = setTimeout(() => setBotAnim('idle'), 900);
    return () => clearTimeout(t);
  }, [canUseBots]);

  const [hirelingAnim, setHirelingAnim] = useState('idle');
  const prevCanUseHirelings = useRef(canUseHirelings);
  useEffect(() => {
    if (prevCanUseHirelings.current === canUseHirelings) return;
    prevCanUseHirelings.current = canUseHirelings;
    setHirelingAnim(canUseHirelings ? 'activating' : 'idle');
    const t = setTimeout(() => setHirelingAnim('idle'), 800);
    return () => clearTimeout(t);
  }, [canUseHirelings]);

  const availableAccessories = ACCESSORIES.filter(
    a => a.requiresExpansion === null || ownedExpansions.has(a.requiresExpansion)
  );
  const maxBots = 6 - playerCount;
  const threshold = getReachThreshold(balanceMode, playerCount + botCount);
  const hasAdvancedOverrides = customMinReach !== null || customMaxReach !== null || allowedExclusions.size > 0 || customHirelingCount !== null;
  const mapsFiltered = !mapDifficulties.has(1) || !mapDifficulties.has(2) || !mapDifficulties.has(3);

  const eligibleHirelingCount = HIRELING_SETS.filter(h => {
    if (h.source === 'marauder') return ownedExpansions.has('marauder');
    return ownedAccessories.has(h.source);
  }).length;

  return (
    <aside className="setup-panel">

      {/* Expansions */}
      <div className="setup-section">
        <h2 className="setup-heading">Expansions Owned</h2>
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

      {/* Player Count */}
      <div className="setup-section">
        <h2 className="setup-heading">Players</h2>
        <div className="player-count-row">
          {[2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              className={`player-btn ${playerCount === n ? 'active' : ''}`}
              onClick={() => actions.setPlayerCount(n)}
              aria-pressed={playerCount === n}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="reach-label">
          Reach goal: <strong>{threshold === 0 ? 'None' : threshold}</strong>
          <InfoIcon tip="Reach measures how well a faction can establish itself in the early game. A higher total means factions can compete more fairly from the start. Low-reach factions struggle if there aren't enough high-reach factions to balance them out." />
        </p>
      </div>

      {/* Game Balance */}
      <div className="setup-section">
        <h2 className="setup-heading">Game Balance</h2>
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
              <span className="balance-option-name">Chaos Mode 🔥</span>
              <span className="balance-option-desc">No reach minimum. Truly anything goes. Experienced players only.</span>
            </div>
          </label>
        </div>
      </div>

      {/* Type Balance */}
      <div className="setup-section">
        <h2 className="setup-heading">
          Type Balance
          <InfoIcon tip="Militants control territory from the start. Insurgents disrupt and explode late. A mix makes for a more dynamic game." />
        </h2>
        <label className={`expansion-check ${requireBalance ? 'checked' : ''}`}>
          <input
            type="checkbox"
            checked={requireBalance}
            onChange={e => actions.setRequireBalance(e.target.checked)}
          />
          <span className="checkbox-box" />
          <span className="expansion-name">Ensure a balanced combination</span>
        </label>
        <p className="mode-description">
          Requires at least one Militant and one Insurgent in the result.
        </p>
      </div>

      {/* Win Rate Filter */}
      <div className="setup-section">
        <h2 className="setup-heading">
          Win Rate Filter
          <InfoIcon tip="Excludes factions with a win rate below 20% for the current player count, based on community game data. Factions without enough recorded games are always included." />
        </h2>
        <label className={`expansion-check ${avoidUnderdogs ? 'checked' : ''}`}>
          <input
            type="checkbox"
            checked={avoidUnderdogs}
            onChange={e => actions.setAvoidUnderdogs(e.target.checked)}
          />
          <span className="checkbox-box" />
          <span className="expansion-name">Avoid underdogs (below 20% WR)</span>
        </label>
        <p className="mode-description">
          Only affects factions with ≥50 recorded games. Factions without data are always included.
        </p>
      </div>

      {/* Faction Difficulty */}
      <div className="setup-section">
        <h2 className="setup-heading">
          Faction Difficulty
          <InfoIcon tip="Only factions matching the selected difficulties will appear in the pool." />
        </h2>
        <p className="setup-heading-sub">Include in pool</p>
        <div className="difficulty-pills">
          {[
            { level: 1, label: '★ Beginner' },
            { level: 2, label: '★★ Intermediate' },
            { level: 3, label: '★★★ Expert' },
          ].map(({ level, label }) => (
            <button
              key={level}
              className={`diff-pill ${difficulties.has(level) ? 'active' : ''}`}
              onClick={() => actions.toggleDifficulty(level)}
              aria-pressed={difficulties.has(level)}
            >
              {difficulties.has(level) ? `✓ ${label}` : label}
            </button>
          ))}
        </div>
      </div>

      {/* Bots — always rendered, disabled until Clockwork is owned */}
      <div className={`setup-section setup-section-full bots-section ${!canUseBots ? 'bots-disabled' : ''} ${botAnim !== 'idle' ? `bots-${botAnim}` : ''}`}>
        <button
          className={`advanced-toggle ${botsOpen ? 'open' : ''} ${botCount > 0 ? 'has-overrides' : ''}`}
          onClick={() => setBotsOpen(o => !o)}
          aria-expanded={botsOpen}
        >
          <span>
            <span className={`bot-icon${!canUseBots ? ' bot-icon--offline' : ''}${botAnim !== 'idle' ? ` bot-icon--${botAnim}` : ''}`}>🤖</span>
            {' '}Bots
            {botCount > 0 && <span className="override-badge">{botCount} bot{botCount !== 1 ? 's' : ''}</span>}
          </span>
          <span className={`chevron ${botsOpen ? 'up' : ''}`}>▾</span>
        </button>

        {botsOpen && (
          <div className="advanced-panel">
            {!canUseBots ? (
              <p className="mode-description bots-locked-hint">Requires the Clockwork Expansion.</p>
            ) : (
              <p className="mode-description">Bots fill seats without a human player. Max bots = 6 − players.</p>
            )}
            <div className="player-count-row">
              {Array.from({ length: maxBots + 1 }, (_, i) => i).map(n => (
                <button
                  key={n}
                  className={`player-btn ${botCount === n ? 'active' : ''}`}
                  onClick={() => actions.setBotCount(n)}
                  aria-pressed={botCount === n}
                >
                  {n}
                </button>
              ))}
            </div>
            {botCount > 0 && (
              <p className="reach-label">
                Total factions: <strong>{playerCount + botCount}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Maps */}
      <div className="setup-section setup-section-full">
        <button
          className={`advanced-toggle ${mapsOpen ? 'open' : ''} ${mapsFiltered ? 'has-overrides' : ''}`}
          onClick={() => setMapsOpen(o => !o)}
          aria-expanded={mapsOpen}
        >
          <span>
            🗺 Maps
            {mapsFiltered && <span className="override-badge">filtered</span>}
          </span>
          <span className={`chevron ${mapsOpen ? 'up' : ''}`}>▾</span>
        </button>

        {mapsOpen && (
          <div className="advanced-panel">
            <div className="advanced-sub-heading">
              Map Complexity
              <InfoIcon tip="Only maps matching the selected complexity levels will be picked." />
            </div>
            <p className="setup-heading-sub" style={{ marginTop: 0, marginBottom: '0.5rem' }}>Include in pool</p>
            <div className="difficulty-pills">
              {[
                { level: 1, label: '★ Beginner' },
                { level: 2, label: '★★ Moderate' },
                { level: 3, label: '★★★ Complex' },
              ].map(({ level, label }) => (
                <button
                  key={level}
                  className={`diff-pill ${mapDifficulties.has(level) ? 'active' : ''}`}
                  onClick={() => actions.toggleMapDifficulty(level)}
                  aria-pressed={mapDifficulties.has(level)}
                >
                  {mapDifficulties.has(level) ? `✓ ${label}` : label}
                </button>
              ))}
            </div>
            <p className="mode-description" style={{ marginTop: '0.5rem' }}>
              To exclude specific maps, use the Manage Pool tab.
            </p>
          </div>
        )}
      </div>

      {/* Add-ons & Accessories */}
      <div className="setup-section setup-section-full">
        <button
          className={`advanced-toggle ${accessoriesOpen ? 'open' : ''} ${ownedAccessories.size > 1 ? 'has-overrides' : ''}`}
          onClick={() => setAccessoriesOpen(o => !o)}
          aria-expanded={accessoriesOpen}
        >
          <span>
            🎒 Add-ons &amp; Accessories
            {ownedAccessories.size > 1 && (
              <span className="override-badge">{ownedAccessories.size - 1} owned</span>
            )}
          </span>
          <span className={`chevron ${accessoriesOpen ? 'up' : ''}`}>▾</span>
        </button>

        {accessoriesOpen && (
          <div className="advanced-panel accessories-panel">

            {/* Deck accessories */}
            <div className="accessories-group">
              <div className="accessories-group-label">Decks</div>
              {availableAccessories.filter(a => a.category === 'deck').map(a => (
                <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
                  <span className="checkbox-box" />
                  <span className="expansion-name">{a.name}</span>
                </label>
              ))}
            </div>

            {/* Vagabond Pack */}
            <div className="accessories-group">
              <div className="accessories-group-label">Vagabond</div>
              {availableAccessories.filter(a => a.category === 'vagabond').map(a => (
                <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
                  <span className="checkbox-box" />
                  <span className="expansion-name">{a.name}</span>
                </label>
              ))}
              <p className="mode-description">Adds Ronin, Adventurer, and Harrier character cards.</p>
            </div>

            {/* Landmarks */}
            <div className={`accessories-group ${!canUseLandmarks ? 'group-locked' : ''}`}>
              <div className="accessories-group-label">Landmarks</div>
              {availableAccessories.filter(a => a.category === 'landmark').map(a => (
                <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
                  <span className="checkbox-box" />
                  <span className="expansion-name">{a.name}</span>
                </label>
              ))}
              <div className="landmark-count-control">
                <span className="landmark-count-control-label">Landmarks in play</span>
                <div className="landmark-count-btns">
                  <button
                    className={`landmark-count-btn ${!useLandmarks ? 'active' : ''}`}
                    onClick={() => actions.setUseLandmarks(false)}
                    aria-pressed={!useLandmarks}
                  >
                    Off
                  </button>
                  {[1, 2].map(n => (
                    <button
                      key={n}
                      className={`landmark-count-btn ${useLandmarks && landmarkCount === n ? 'active' : ''}`}
                      onClick={() => { actions.setUseLandmarks(true); actions.setLandmarkCount(n); }}
                      aria-pressed={useLandmarks && landmarkCount === n}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hireling packs */}
            <div className={`accessories-group ${!canUseHirelings ? 'group-locked' : ''} ${hirelingAnim === 'activating' ? 'group-activating' : ''}`}>
              <div className="accessories-group-label">Hireling Packs</div>
              {availableAccessories.filter(a => a.category === 'hireling').map(a => (
                <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
                  <span className="checkbox-box" />
                  <span className="expansion-name">{a.name}</span>
                </label>
              ))}
              <label className={`expansion-check ${useHirelings ? 'checked' : ''}`}>
                <input type="checkbox" checked={useHirelings} onChange={e => actions.setUseHirelings(e.target.checked)} />
                <span className="checkbox-box" />
                <span className="expansion-name">Randomize hirelings for this session</span>
              </label>
            </div>

          </div>
        )}
      </div>

      {/* Advanced Mode */}
      <div className="setup-section setup-section-full">
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
            <p className="advanced-warning">
              ⚠ These settings override standard rules. Results may be unbalanced or unconventional.
            </p>

            <div className="advanced-row">
              <label className="advanced-label">
                Min Reach
                <InfoIcon tip="Override the minimum total reach. Leave blank to use the current balance mode's threshold." />
              </label>
              <div className="reach-inputs">
                <input
                  type="number"
                  className="reach-input"
                  placeholder={threshold === 0 ? '0' : String(threshold)}
                  min="0"
                  max="99"
                  value={customMinReach ?? ''}
                  onChange={e => actions.setCustomMinReach(e.target.value === '' ? null : Number(e.target.value))}
                />
                <span className="reach-input-sep">to</span>
                <input
                  type="number"
                  className="reach-input"
                  placeholder="max"
                  min="0"
                  max="99"
                  value={customMaxReach ?? ''}
                  onChange={e => actions.setCustomMaxReach(e.target.value === '' ? null : Number(e.target.value))}
                />
                {(customMinReach !== null || customMaxReach !== null) && (
                  <button
                    className="reach-reset"
                    onClick={() => { actions.setCustomMinReach(null); actions.setCustomMaxReach(null); }}
                    title="Reset to default"
                  >
                    ×
                  </button>
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
                  <label
                    key={key}
                    className={`expansion-check ${allowedExclusions.has(key) ? 'checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={allowedExclusions.has(key)}
                      onChange={() => actions.toggleAllowedExclusion(key)}
                    />
                    <span className="checkbox-box" />
                    <span className="expansion-name">
                      {label}
                      <span className="exclusion-desc"> — {description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {useHirelings && (
              <div className="advanced-row">
                <label className="advanced-label">
                  Hireling Count
                  <InfoIcon tip="Override the default of 3 hirelings. Useful for tighter or more chaotic games." />
                </label>
                <div className="reach-inputs">
                  <input
                    type="number"
                    className="reach-input"
                    placeholder="3"
                    min="0"
                    max={eligibleHirelingCount}
                    value={customHirelingCount ?? ''}
                    onChange={e => {
                      const val = e.target.value === '' ? null : Math.min(Number(e.target.value), eligibleHirelingCount);
                      actions.setCustomHirelingCount(val);
                    }}
                  />
                  {customHirelingCount !== null && (
                    <button
                      className="reach-reset"
                      onClick={() => actions.setCustomHirelingCount(null)}
                      title="Reset to default"
                    >
                      ×
                    </button>
                  )}
                </div>
                <p className="mode-description" style={{ marginTop: 4 }}>
                  Default: 3 · {eligibleHirelingCount} set{eligibleHirelingCount !== 1 ? 's' : ''} available · Promoted/demoted scales with player count.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="setup-section setup-section-full">
        <button className="reset-btn" onClick={actions.resetAll}>
          Reset all settings to defaults
        </button>
      </div>

    </aside>
  );
}
