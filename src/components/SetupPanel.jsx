import { useState } from 'react';
import { EXPANSIONS } from '../data/factions.js';
import { ACCESSORIES } from '../data/accessories.js';
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
    ownedExpansions, playerCount, balanceMode, requireBalance,
    difficulties, advancedMode, customMinReach, customMaxReach, allowedExclusions,
    ownedAccessories, useHirelings, useLandmarks,
  } = state;

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);

  // Determine which accessories are available given owned expansions
  const availableAccessories = ACCESSORIES.filter(
    a => a.requiresExpansion === null || ownedExpansions.has(a.requiresExpansion)
  );

  // Hirelings require Marauder expansion for the rules
  const canUseHirelings = ownedExpansions.has('marauder');
  // Can use landmarks if Underworld owned (Tower) or Landmarks Pack owned
  const canUseLandmarks = ownedExpansions.has('underworld') || ownedAccessories.has('landmarks_pack');
  const threshold = getReachThreshold(balanceMode, playerCount);
  const hasAdvancedOverrides = customMinReach !== null || customMaxReach !== null || allowedExclusions.size > 0;

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

      {/* Difficulty */}
      <div className="setup-section">
        <h2 className="setup-heading">Difficulty</h2>
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
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Add-ons & Accessories */}
      <div className="setup-section setup-section-full">
        <button
          className={`advanced-toggle ${accessoriesOpen ? 'open' : ''} ${ownedAccessories.size > 0 ? 'has-overrides' : ''}`}
          onClick={() => setAccessoriesOpen(o => !o)}
          aria-expanded={accessoriesOpen}
        >
          <span>
            🎒 Add-ons &amp; Accessories
            {ownedAccessories.size > 0 && (
              <span className="override-badge">{ownedAccessories.size} owned</span>
            )}
          </span>
          <span className={`chevron ${accessoriesOpen ? 'up' : ''}`}>▾</span>
        </button>

        {accessoriesOpen && (
          <div className="advanced-panel accessories-panel">

            {/* Deck accessories */}
            <div className="accessories-group">
              <div className="accessories-group-label">Alternate Decks</div>
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
            <div className="accessories-group">
              <div className="accessories-group-label">Landmarks</div>
              {availableAccessories.filter(a => a.category === 'landmark').map(a => (
                <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
                  <span className="checkbox-box" />
                  <span className="expansion-name">{a.name}</span>
                </label>
              ))}
              {canUseLandmarks && (
                <label className={`expansion-check ${useLandmarks ? 'checked' : ''}`}>
                  <input type="checkbox" checked={useLandmarks} onChange={e => actions.setUseLandmarks(e.target.checked)} />
                  <span className="checkbox-box" />
                  <span className="expansion-name">Randomize landmarks for this session</span>
                </label>
              )}
              {!canUseLandmarks && (
                <p className="mode-description">Requires Underworld Expansion or Landmarks Pack.</p>
              )}
            </div>

            {/* Hireling packs */}
            <div className="accessories-group">
              <div className="accessories-group-label">Hireling Packs</div>
              {availableAccessories.filter(a => a.category === 'hireling').map(a => (
                <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
                  <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
                  <span className="checkbox-box" />
                  <span className="expansion-name">{a.name}</span>
                </label>
              ))}
              {canUseHirelings && (
                <label className={`expansion-check ${useHirelings ? 'checked' : ''}`}>
                  <input type="checkbox" checked={useHirelings} onChange={e => actions.setUseHirelings(e.target.checked)} />
                  <span className="checkbox-box" />
                  <span className="expansion-name">Randomize hirelings for this session</span>
                </label>
              )}
              {!canUseHirelings && (
                <p className="mode-description">Requires the Marauder Expansion for hireling rules.</p>
              )}
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
          </div>
        )}
      </div>

    </aside>
  );
}
