# Category-First Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the app from a split setup/results/pool layout into category-first tabs (Factions, Map & Cards, Hirelings, Landmarks) where each tab owns its filters, results, and pool management.

**Architecture:** Replace the current SetupPanel + result tabs + ManagePool three-way split with a persistent bar (player count, bots, action buttons) and four category tabs. Each category tab contains a filters section at top and Results/Pool sub-tabs below. All existing card components and state logic remain unchanged.

**Tech Stack:** React 18, single-file CSS (src/index.css), no test framework in this project.

**Spec:** `docs/superpowers/specs/2026-04-05-category-first-navigation-design.md`

---

## File Structure

### New files to create:
- `src/components/PersistentBar.jsx` — player count, bots selector, Randomize/Undo/Share/Reset buttons
- `src/components/CategoryTabs.jsx` — top-level tab navigation (Factions | Map & Cards | Hirelings | Landmarks)
- `src/components/FactionsTab.jsx` — factions filters + Results/Pool sub-tabs
- `src/components/MapCardsTab.jsx` — map & cards filters + Results/Pool sub-tabs
- `src/components/HirelingsTab.jsx` — hirelings filters + Results/Pool sub-tabs
- `src/components/LandmarksTab.jsx` — landmarks filters + Results/Pool sub-tabs

### Files to modify:
- `src/App.jsx` — replace SetupPanel/ManagePool/result-tabs with PersistentBar + CategoryTabs + active tab component
- `src/index.css` — new styles for persistent bar, category tabs, tab filters, sub-tabs; remove old setup-panel/view-tabs/result-tabs/manage-pool styles

### Files to delete (after migration):
- `src/components/SetupPanel.jsx` — contents distributed into tab components + PersistentBar
- `src/components/ManagePool.jsx` — contents distributed into each tab's Pool sub-tab

### Files unchanged:
- `src/components/FactionCard.jsx`, `MapCard.jsx`, `DeckCard.jsx`, `HirelingCard.jsx`, `LandmarkCard.jsx`
- `src/components/BoardModal.jsx`, `ReachSummary.jsx`, `ActionBar.jsx`
- `src/components/Icons.jsx`, `DieIcon.jsx`, `LockIcon.jsx`, `FactionIcon.jsx`
- `src/hooks/useAppState.js` — no state model changes
- All data files

---

## Task 1: Create PersistentBar component

Extracts player count, bots, and action buttons into a persistent bar that sits above the category tabs.

**Files:**
- Create: `src/components/PersistentBar.jsx`

- [ ] **Step 1: Create PersistentBar.jsx**

This component combines the player count selector (from SetupPanel lines 99-118), the bots section (from SetupPanel lines 213-254), and the existing ActionBar. The ActionBar component is embedded directly rather than imported separately, since we're merging them into one bar.

```jsx
import { useState, useEffect, useRef } from 'react';
import { getReachThreshold } from '../utils/randomizer.js';
import DieIcon from './DieIcon.jsx';
import { UndoIcon, ShareIcon, CheckIcon, TrashIcon, BotIcon } from './Icons.jsx';

function InfoIcon({ tip }) {
  return (
    <span className="info-icon" title={tip} aria-label={tip}>?</span>
  );
}

export default function PersistentBar({ state, actions, copied, hasSelection, hasHistory }) {
  const {
    playerCount, botCount, balanceMode, ownedExpansions,
  } = state;

  const canUseBots = ownedExpansions.has('clockwork') || ownedExpansions.has('clockwork2');
  const maxBots = 6 - playerCount;
  const threshold = getReachThreshold(balanceMode, playerCount + botCount);

  const [botsOpen, setBotsOpen] = useState(false);
  const [botAnim, setBotAnim] = useState('idle');
  const prevCanUseBots = useRef(canUseBots);

  useEffect(() => {
    if (prevCanUseBots.current === canUseBots) return;
    prevCanUseBots.current = canUseBots;
    setBotAnim(canUseBots ? 'activating' : 'deactivating');
    setBotsOpen(canUseBots);
    const t = setTimeout(() => setBotAnim('idle'), 900);
    return () => clearTimeout(t);
  }, [canUseBots]);

  return (
    <div className="persistent-bar">
      {/* Player count + bots row */}
      <div className="pbar-settings">
        <div className="pbar-players">
          <span className="pbar-label">Players</span>
          <div className="pbar-count-row">
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
          <span className="pbar-reach">
            Reach goal: <strong>{threshold === 0 ? 'None' : threshold}</strong>
            <InfoIcon tip="Reach measures how well a faction can establish itself in the early game. A higher total means factions can compete more fairly from the start. Low-reach factions struggle if there aren't enough high-reach factions to balance them out." />
          </span>
        </div>

        {canUseBots && (
          <div className={`pbar-bots ${botAnim !== 'idle' ? `bots-${botAnim}` : ''}`}>
            <span className="pbar-label">
              <BotIcon width={14} height={14} /> Bots
            </span>
            <div className="pbar-count-row">
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
              <span className="pbar-reach">
                Total factions: <strong>{playerCount + botCount}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="pbar-actions" role="toolbar" aria-label="Session actions">
        <button
          className="action-btn primary randomize-btn"
          onClick={() => actions.randomize(false)}
        >
          <span className="btn-icon"><DieIcon width={16} height={16} /></span>
          <span>Randomize</span>
        </button>

        <div className="action-bar-secondary">
          <button
            className="action-btn secondary"
            onClick={actions.undo}
            disabled={!hasHistory}
            title="Undo last randomize"
          >
            <span className="btn-icon"><UndoIcon /></span>
            <span>Undo</span>
          </button>
          <button
            className={`action-btn secondary share-btn ${copied ? 'copied' : ''}`}
            onClick={actions.share}
            disabled={!hasSelection}
            title="Copy shareable link to clipboard"
          >
            <span className="btn-icon">{copied ? <CheckIcon /> : <ShareIcon />}</span>
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
          <button
            className="action-btn secondary reset-btn"
            onClick={actions.resetAll}
            title="Clear all settings and return to defaults"
          >
            <span className="btn-icon"><TrashIcon /></span>
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PersistentBar.jsx
git commit -m "feat: create PersistentBar component with player count, bots, and action buttons"
```

---

## Task 2: Create CategoryTabs component

A simple tab bar for the four category tabs with greyed-out support.

**Files:**
- Create: `src/components/CategoryTabs.jsx`

- [ ] **Step 1: Create CategoryTabs.jsx**

```jsx
import DieIcon from './DieIcon.jsx';
import { MapIcon, LandmarkIcon, PackIcon } from './Icons.jsx';

const TABS = [
  { id: 'factions',  label: 'Factions',      icon: DieIcon },
  { id: 'map',       label: 'Map & Cards',   icon: MapIcon },
  { id: 'hirelings', label: 'Hirelings',     icon: PackIcon },
  { id: 'landmarks', label: 'Landmarks',     icon: LandmarkIcon },
];

export default function CategoryTabs({ activeTab, onTabChange, disabledTabs }) {
  return (
    <nav className="category-tabs" role="tablist" aria-label="Categories">
      {TABS.map(tab => {
        const Icon = tab.icon;
        const disabled = disabledTabs?.has(tab.id);
        return (
          <button
            key={tab.id}
            className={`category-tab ${activeTab === tab.id ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="category-tab-icon"><Icon width={14} height={14} /></span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/CategoryTabs.jsx
git commit -m "feat: create CategoryTabs component for top-level category navigation"
```

---

## Task 3: Create FactionsTab component

The largest tab — combines faction filters from SetupPanel, faction results from App.jsx, and faction + character pool from ManagePool.

**Files:**
- Create: `src/components/FactionsTab.jsx`

- [ ] **Step 1: Create FactionsTab.jsx**

This component has three sections:
1. Filters: expansion checkboxes, balance mode, type balance, win rate filter, difficulty, advanced (collapsible)
2. Results sub-tab: ReachSummary + faction cards grid
3. Pool sub-tab: faction exclusion list + vagabond character exclusion list

The filters are extracted from `SetupPanel.jsx` (lines 77-499). The Results content is extracted from `App.jsx` (lines 222-248). The Pool content is the `FactionsTab` and `CharactersTab` functions from `ManagePool.jsx`.

```jsx
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

// ── Pool sub-components ──────────────────────────────────────────────────

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
                icon={<FactionIcon factionId={f.automatesId} className="pool-faction-icon" />}
                meta={`Reach ${f.reach} · ${f.type === 'militant' ? 'Militant' : 'Insurgent'}`}
                accentColor={FACTION_MAP[f.automatesId].color}
                excluded={bannedFactions.has(f.id)}
                onToggle={() => bannedFactions.has(f.id) ? actions.unbanFaction(f.id) : actions.banFaction(f.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Vagabond Characters section */}
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

// ── Main component ──────────────────────────────────────────────────────

export default function FactionsTab({ state, actions, subTab, onSubTabChange, onBoardClick }) {
  const {
    ownedExpansions, balanceMode, requireBalance, avoidUnderdogs,
    difficulties, advancedMode, customMinReach, customMaxReach,
    allowedExclusions, selectedFactions, lockedFactions, bannedFactions,
    vagabondCharacters, playerCount, botCount,
  } = state;

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const threshold = getReachThreshold(balanceMode, playerCount + botCount);
  const hasAdvancedOverrides = customMinReach !== null || customMaxReach !== null || allowedExclusions.size > 0;

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

  const mapData = state.selectedMap ? MAP_MAP[state.selectedMap] : null;

  return (
    <div className="tab-panel">
      {/* ── Filters ── */}
      <div className="tab-filters">
        {/* Expansions */}
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

        {/* Game Balance */}
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

        {/* Type Balance */}
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

        {/* Win Rate Filter */}
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

        {/* Faction Difficulty */}
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

        {/* Advanced (collapsible) */}
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

      {/* ── Sub-tabs ── */}
      <div className="sub-tabs" role="tablist">
        <button className={`sub-tab ${subTab === 'results' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'results'} onClick={() => onSubTabChange('results')}>Results</button>
        <button className={`sub-tab ${subTab === 'pool' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'pool'} onClick={() => onSubTabChange('pool')}>Pool</button>
      </div>

      {/* ── Sub-tab content ── */}
      {subTab === 'results' && (
        <div className="sub-tab-content">
          {selectedFactions.length > 0 ? (
            <>
              <ReachSummary selectedFactions={selectedFactions} playerCount={playerCount} balanceMode={balanceMode} />
              {lockedFactions.size > 0 && (
                <button className="reroll-all-btn" onClick={() => actions.randomize(true)}>
                  <DieIcon /> Re-roll unlocked
                </button>
              )}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FactionsTab.jsx
git commit -m "feat: create FactionsTab with filters, results, and pool management"
```

---

## Task 4: Create MapCardsTab component

Map & Cards tab with map board/complexity filters, deck selection, results, and pool management.

**Files:**
- Create: `src/components/MapCardsTab.jsx`

- [ ] **Step 1: Create MapCardsTab.jsx**

Filters extracted from SetupPanel lines 256-315. Results from App.jsx lines 251-270. Pool from ManagePool MapsTab function.

```jsx
import { MAPS, MAP_MAP, MAP_COLORS } from '../data/maps.js';
import { DECKS, ACCESSORIES } from '../data/accessories.js';
import { CheckIcon, StarIcon, MapIcon, XIcon } from './Icons.jsx';
import MapCard from './MapCard.jsx';
import DeckCard from './DeckCard.jsx';

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

function PoolItem({ name, icon, meta, description, excluded, onToggle, accentColor }) {
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
        {description && <span className="pool-item-desc">{description}</span>}
      </span>
      <span className={`pool-item-toggle ${excluded ? 'off' : 'on'}`}>
        {excluded ? <XIcon width={12} height={12} /> : <CheckIcon width={12} height={12} />}
      </span>
    </button>
  );
}

export default function MapCardsTab({ state, actions, subTab, onSubTabChange }) {
  const { activeMapExpansions, mapDifficulties, selectedMap, selectedDeck, ownedAccessories, excludedMaps } = state;

  const canRerollMap = MAPS.filter(m =>
    activeMapExpansions.has(m.expansion) &&
    !excludedMaps.has(m.id) &&
    mapDifficulties.has(m.difficulty)
  ).length > 1;

  const canRerollDeck = DECKS.filter(d => d.accessory === null || ownedAccessories.has(d.accessory)).length > 1;

  const availableDeckAccessories = ACCESSORIES.filter(a => a.category === 'deck');

  const COMPLEXITY = {
    1: <><StarsInline count={1} /> Beginner</>,
    2: <><StarsInline count={2} /> Moderate</>,
    3: <><StarsInline count={3} /> Complex</>,
  };

  const availableMaps = MAPS.filter(m => activeMapExpansions.has(m.expansion));

  return (
    <div className="tab-panel">
      {/* ── Filters ── */}
      <div className="tab-filters">
        <div className="filter-group">
          <h3 className="filter-heading">Map Boards</h3>
          {[
            { id: 'base',       label: 'Autumn · Winter',  required: true },
            { id: 'underworld', label: 'Mountain · Lake',  required: false },
            { id: 'homeland',   label: 'Marsh · Gorge',    required: false },
          ].map(({ id, label, required }) => (
            <label key={id} className={`expansion-check ${activeMapExpansions.has(id) ? 'checked' : ''} ${required ? 'disabled' : ''}`}>
              <input type="checkbox" checked={activeMapExpansions.has(id)} disabled={required} onChange={() => actions.toggleMapExpansion(id)} />
              <span className="checkbox-box" />
              <span className="expansion-name">{label}</span>
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h3 className="filter-heading">
            Map Complexity
            <InfoIcon tip="Only maps matching the selected complexity levels will be picked." />
          </h3>
          <p className="setup-heading-sub">Include in pool</p>
          <div className="difficulty-pills">
            {[
              { level: 1, label: 'Beginner' },
              { level: 2, label: 'Moderate' },
              { level: 3, label: 'Complex' },
            ].map(({ level, label }) => (
              <button
                key={level}
                className={`diff-pill ${mapDifficulties.has(level) ? 'active' : ''}`}
                onClick={() => actions.toggleMapDifficulty(level)}
                aria-pressed={mapDifficulties.has(level)}
              >
                {mapDifficulties.has(level) && <CheckIcon width={12} height={12} />} <StarsInline count={level} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3 className="filter-heading">Card Decks</h3>
          {availableDeckAccessories.map(a => (
            <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
              <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
              <span className="checkbox-box" />
              <span className="expansion-name">{a.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Sub-tabs ── */}
      <div className="sub-tabs" role="tablist">
        <button className={`sub-tab ${subTab === 'results' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'results'} onClick={() => onSubTabChange('results')}>Results</button>
        <button className={`sub-tab ${subTab === 'pool' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'pool'} onClick={() => onSubTabChange('pool')}>Pool</button>
      </div>

      {subTab === 'results' && (
        <div className="sub-tab-content">
          {selectedMap || selectedDeck ? (
            <div className="session-row">
              {selectedMap && (
                <MapCard mapId={selectedMap} onReroll={actions.rerollMap} canReroll={canRerollMap} />
              )}
              {selectedDeck && (
                <DeckCard deckId={selectedDeck} onReroll={actions.rerollDeck} canReroll={canRerollDeck} />
              )}
            </div>
          ) : (
            <div className="tab-empty-state">
              <p>No map picked yet.</p>
              <p className="tab-empty-sub">Hit Randomize above to get started.</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'pool' && (
        <div className="sub-tab-content">
          {availableMaps.length === 0 ? (
            <div className="pool-empty"><p>No maps available. Enable map boards above.</p></div>
          ) : (
            <>
              <p className="pool-tab-hint">Click a map to exclude or include it.</p>
              <div className="pool-grid">
                {availableMaps.map(m => (
                  <PoolItem
                    key={m.id}
                    name={m.name}
                    icon={<span className="pool-map-icon"><MapIcon width={18} height={18} /></span>}
                    meta={COMPLEXITY[m.difficulty]}
                    description={m.description}
                    accentColor={(MAP_COLORS[m.id] ?? {}).primary}
                    excluded={excludedMaps.has(m.id)}
                    onToggle={() => actions.toggleExcludedMap(m.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MapCardsTab.jsx
git commit -m "feat: create MapCardsTab with map/deck filters, results, and pool"
```

---

## Task 5: Create HirelingsTab component

**Files:**
- Create: `src/components/HirelingsTab.jsx`

- [ ] **Step 1: Create HirelingsTab.jsx**

Filters from SetupPanel lines 395-408. Results from App.jsx lines 273-295. Pool from ManagePool HirelingsTab.

```jsx
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
      {/* ── Filters ── */}
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

      {/* ── Sub-tabs ── */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HirelingsTab.jsx
git commit -m "feat: create HirelingsTab with pack filters, results, and pool"
```

---

## Task 6: Create LandmarksTab component

**Files:**
- Create: `src/components/LandmarksTab.jsx`

- [ ] **Step 1: Create LandmarksTab.jsx**

Filters from SetupPanel lines 361-393. Results from App.jsx lines 297-315. Pool from ManagePool LandmarksTab.

```jsx
import { ACCESSORIES, LANDMARKS } from '../data/accessories.js';
import { CheckIcon, LandmarkIcon, XIcon } from './Icons.jsx';
import LandmarkCard from './LandmarkCard.jsx';
import DieIcon from './DieIcon.jsx';

const LANDMARK_COLOR = '#5A7A3A';

function PoolItem({ name, icon, meta, description, excluded, onToggle, accentColor }) {
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
        {description && <span className="pool-item-desc">{description}</span>}
      </span>
      <span className={`pool-item-toggle ${excluded ? 'off' : 'on'}`}>
        {excluded ? <XIcon width={12} height={12} /> : <CheckIcon width={12} height={12} />}
      </span>
    </button>
  );
}

const SOURCE_LABEL = {
  underworld_landmarks: 'Underworld Expansion',
  homeland_landmarks: 'Homeland Expansion',
  landmarks_pack: 'Landmarks Pack',
};

export default function LandmarksTab({ state, actions, subTab, onSubTabChange, onImageClick }) {
  const { ownedAccessories, useLandmarks, landmarkCount, selectedLandmarks, excludedLandmarks } = state;

  const canUseLandmarks = ownedAccessories.has('landmarks_pack') || ownedAccessories.has('underworld_landmarks') || ownedAccessories.has('homeland_landmarks');
  const availableAccessories = ACCESSORIES.filter(a => a.category === 'landmark');
  const availableLandmarks = LANDMARKS.filter(l => ownedAccessories.has(l.source));

  return (
    <div className="tab-panel">
      {/* ── Filters ── */}
      <div className="tab-filters">
        <div className="filter-group">
          <h3 className="filter-heading">Landmark Sources</h3>
          {availableAccessories.map(a => (
            <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
              <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
              <span className="checkbox-box" />
              <span className="expansion-name">{a.name}</span>
            </label>
          ))}
        </div>

        <div className={`filter-group ${!canUseLandmarks ? 'group-locked' : ''}`}>
          <h3 className="filter-heading">Landmarks in Play</h3>
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

      {/* ── Sub-tabs ── */}
      <div className="sub-tabs" role="tablist">
        <button className={`sub-tab ${subTab === 'results' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'results'} onClick={() => onSubTabChange('results')}>Results</button>
        <button className={`sub-tab ${subTab === 'pool' ? 'active' : ''}`} role="tab" aria-selected={subTab === 'pool'} onClick={() => onSubTabChange('pool')}>Pool</button>
      </div>

      {subTab === 'results' && (
        <div className="sub-tab-content">
          {selectedLandmarks.length > 0 ? (
            <>
              <button className="reroll-all-btn" onClick={actions.rerollLandmarks}>
                <DieIcon /> Re-roll all landmarks
              </button>
              <div className="landmarks-grid">
                {selectedLandmarks.map((lid, i) => (
                  <LandmarkCard
                    key={lid}
                    landmarkId={lid}
                    index={i}
                    onReroll={() => actions.rerollSingleLandmark(lid)}
                    onImageClick={onImageClick}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="tab-empty-state">
              {canUseLandmarks && useLandmarks ? (
                <>
                  <p>No landmarks picked yet.</p>
                  <p className="tab-empty-sub">Hit Randomize above to get started.</p>
                </>
              ) : !canUseLandmarks ? (
                <>
                  <p>No landmark sources enabled.</p>
                  <p className="tab-empty-sub">Check a source above to include landmarks in your session.</p>
                </>
              ) : (
                <>
                  <p>Landmarks are turned off.</p>
                  <p className="tab-empty-sub">Set the count to 1 or 2 above to include landmarks.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {subTab === 'pool' && (
        <div className="sub-tab-content">
          {availableLandmarks.length === 0 ? (
            <div className="pool-empty"><p>No landmarks available. Enable landmark sources above.</p></div>
          ) : (
            <>
              <p className="pool-tab-hint">Click a landmark to exclude or include it.</p>
              <div className="pool-grid">
                {availableLandmarks.map(l => (
                  <PoolItem
                    key={l.id}
                    name={l.name}
                    icon={<span className="pool-generic-icon"><LandmarkIcon width={18} height={18} /></span>}
                    meta={SOURCE_LABEL[l.source] ?? l.source}
                    description={l.description}
                    accentColor={LANDMARK_COLOR}
                    excluded={excludedLandmarks.has(l.id)}
                    onToggle={() => actions.toggleExcludedLandmark(l.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/LandmarksTab.jsx
git commit -m "feat: create LandmarksTab with source filters, results, and pool"
```

---

## Task 7: Rewrite App.jsx

Replace the current SetupPanel + view-tabs + result-tabs + ManagePool structure with PersistentBar + CategoryTabs + active tab component.

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Rewrite App.jsx**

Replace the entire component. Key changes:
- Remove imports for SetupPanel, ManagePool, ActionBar
- Add imports for PersistentBar, CategoryTabs, FactionsTab, MapCardsTab, HirelingsTab, LandmarksTab
- Replace `viewMode` and `resultTab` state with `activeCategory` and per-category `subTabs` state
- Remove `setupOpen` state (no more setup drawer)
- Remove the `canRerollFaction` function (moved into FactionsTab)
- Remove the `excludedCounts`/`totalExcluded` computation (no more Manage Pool badge)
- Compute `disabledTabs` set for greyed-out tabs

```jsx
import { useAppState } from './hooks/useAppState.js';
import { useTheme } from './hooks/useTheme.js';
import PersistentBar from './components/PersistentBar.jsx';
import CategoryTabs from './components/CategoryTabs.jsx';
import FactionsTab from './components/FactionsTab.jsx';
import MapCardsTab from './components/MapCardsTab.jsx';
import HirelingsTab from './components/HirelingsTab.jsx';
import LandmarksTab from './components/LandmarksTab.jsx';
import BoardModal from './components/BoardModal.jsx';
import { useState } from 'react';
import { HIRELING_SETS } from './data/accessories.js';

export default function App() {
  const { state, actions } = useAppState();
  const { theme, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState('factions');
  const [subTabs, setSubTabs] = useState({
    factions: 'results',
    map: 'results',
    hirelings: 'results',
    landmarks: 'results',
  });
  const [boardModal, setBoardModal] = useState(null);

  const {
    selectedFactions,
    selectedHirelings,
    selectedLandmarks,
    ownedAccessories,
    error,
    copied,
    history,
  } = state;

  function setSubTab(category, tab) {
    setSubTabs(prev => ({ ...prev, [category]: tab }));
  }

  // Determine which tabs are disabled (greyed out)
  const canUseHirelings = HIRELING_SETS.some(h => ownedAccessories.has(h.source));
  const canUseLandmarks = (ownedAccessories.has('landmarks_pack') || ownedAccessories.has('underworld_landmarks') || ownedAccessories.has('homeland_landmarks')) && state.useLandmarks;
  const disabledTabs = new Set();
  if (!canUseHirelings) disabledTabs.add('hirelings');
  if (!canUseLandmarks) disabledTabs.add('landmarks');

  function handleBoardClick(images, name, sideLabels) {
    setBoardModal({ images, title: name, sideLabels });
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="wordmark">
            <span className="wordmark-root">Root</span>
            <span className="wordmark-pick">Pick</span>
          </div>
          <p className="header-tagline">Faction randomizer for Root</p>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </header>

      <main className="app-main">
        <PersistentBar
          state={state}
          actions={actions}
          copied={copied}
          hasSelection={selectedFactions.length > 0}
          hasHistory={history.length > 0}
        />

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button className="error-dismiss" onClick={actions.clearError} aria-label="Dismiss">×</button>
          </div>
        )}

        <CategoryTabs
          activeTab={activeCategory}
          onTabChange={setActiveCategory}
          disabledTabs={disabledTabs}
        />

        {activeCategory === 'factions' && (
          <FactionsTab
            state={state}
            actions={actions}
            subTab={subTabs.factions}
            onSubTabChange={tab => setSubTab('factions', tab)}
            onBoardClick={(images, name) => handleBoardClick(images, name)}
          />
        )}

        {activeCategory === 'map' && (
          <MapCardsTab
            state={state}
            actions={actions}
            subTab={subTabs.map}
            onSubTabChange={tab => setSubTab('map', tab)}
          />
        )}

        {activeCategory === 'hirelings' && (
          <HirelingsTab
            state={state}
            actions={actions}
            subTab={subTabs.hirelings}
            onSubTabChange={tab => setSubTab('hirelings', tab)}
            onImageClick={(images, name) => handleBoardClick(images, name, ['Promoted', 'Demoted'])}
          />
        )}

        {activeCategory === 'landmarks' && (
          <LandmarksTab
            state={state}
            actions={actions}
            subTab={subTabs.landmarks}
            onSubTabChange={tab => setSubTab('landmarks', tab)}
            onImageClick={(images, name) => handleBoardClick(images, name)}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          <a href="https://rootpick.app" className="footer-link">rootpick.app</a>
          {' '}·{' '}Fan-made tool. Not affiliated with or endorsed by Leder Games.
          {' '}·{' '}<a href="https://github.com/matuszeg/RootPick/" className="footer-link" target="_blank" rel="noopener noreferrer">Open source on GitHub</a>
        </p>
      </footer>

      {boardModal && (
        <BoardModal
          images={boardModal.images}
          title={boardModal.title}
          sideLabels={boardModal.sideLabels}
          onClose={() => setBoardModal(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: rewrite App.jsx with category-first navigation structure"
```

---

## Task 8: Add CSS for new layout

Add styles for persistent bar, category tabs, tab filters, sub-tabs, and empty states. Remove old setup-panel, view-tabs, result-tabs, setup-drawer, and manage-pool styles.

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add new CSS sections**

Add the following new CSS blocks. These can be added after the existing header styles and before the faction card styles. The exact insertion point and old-style removal will need to be done carefully by reading the current CSS.

**Persistent bar styles:**

```css
/* ─── Persistent bar ─────────────────────────────────────────────────── */
.persistent-bar {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pbar-settings {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.pbar-players,
.pbar-bots {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.pbar-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.pbar-count-row {
  display: flex;
  gap: 0.3rem;
}

.pbar-reach {
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.pbar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
```

**Category tab styles:**

```css
/* ─── Category tabs ──────────────────────────────────────────────────── */
.category-tabs {
  display: flex;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-card);
}

.category-tab {
  flex: 1;
  padding: 0.65rem 0.5rem;
  background: none;
  border: none;
  border-right: 1px solid var(--border);
  color: var(--ink-mid);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: background 0.15s, color 0.15s;
}

.category-tab:last-child { border-right: none; }
.category-tab:hover:not(.active) { color: var(--gold-bright); background: var(--bg-card-hover); }

.category-tab.active {
  color: var(--gold);
  background: var(--bg-card-hover);
  box-shadow: inset 0 -2px 0 var(--gold);
}

.category-tab.disabled {
  opacity: 0.4;
}
.category-tab.disabled.active {
  opacity: 0.7;
}

.category-tab-icon {
  display: flex;
  align-items: center;
}
```

**Tab panel, filters, sub-tabs styles:**

```css
/* ─── Tab panel ──────────────────────────────────────────────────────── */
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tab-filters {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-heading {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* ─── Sub-tabs (Results | Pool) ──────────────────────────────────────── */
.sub-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-top: 0.75rem;
  gap: 0;
}

.sub-tab {
  padding: 0.5rem 1.2rem;
  background: none;
  border: none;
  color: var(--ink-muted);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.sub-tab:hover { color: var(--gold-bright); }
.sub-tab.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

.sub-tab-content {
  padding-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ─── Tab empty states ───────────────────────────────────────────────── */
.tab-empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--ink-muted);
}

.tab-empty-state p {
  margin: 0;
  font-size: 1rem;
}

.tab-empty-sub {
  font-size: 0.85rem;
  margin-top: 0.4rem;
  opacity: 0.7;
}

/* ─── Mobile persistent bar ─────────────────────────────────────────── */
@media (max-width: 600px) {
  .pbar-settings {
    flex-direction: column;
    gap: 0.75rem;
  }
  .tab-filters {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Remove old styles**

Remove or comment out these CSS sections that are no longer used:
- `.setup-toggle` and related styles (lines ~171-197)
- `.setup-drawer` styles (lines ~193-197)
- `.setup-panel` styles (lines ~199-215)
- `.setup-section`, `.setup-heading`, `.setup-heading-sub` styles
- `.view-tabs`, `.view-tab` styles (lines ~621-655)
- `.result-tabs`, `.result-tab`, `.result-tab-count`, `.result-tab-content` styles (lines ~1088-1143)
- `.manage-pool` styles (lines ~2212+)
- `.pool-subtabs`, `.pool-subtab`, `.pool-subtab-count` styles (lines ~2218-2260)
- The desktop media query for `.setup-toggle`/`.setup-drawer` (lines ~2419-2420)

Keep all styles that are reused: `.expansion-check`, `.balance-options`, `.difficulty-pills`, `.player-btn`, `.advanced-toggle`, `.advanced-panel`, `.pool-item`, `.pool-grid`, `.pool-section`, `.hireling-pool-*`, etc.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add category-first CSS, remove old setup/view/result/pool tab styles"
```

---

## Task 9: Remove old components

Delete SetupPanel.jsx and ManagePool.jsx now that their contents have been distributed.

**Files:**
- Delete: `src/components/SetupPanel.jsx`
- Delete: `src/components/ManagePool.jsx`
- Delete: `src/components/ActionBar.jsx` (merged into PersistentBar)

- [ ] **Step 1: Delete old files**

```bash
git rm src/components/SetupPanel.jsx src/components/ManagePool.jsx src/components/ActionBar.jsx
```

- [ ] **Step 2: Verify no remaining imports**

Search for any remaining imports of the deleted components:

```bash
grep -r "SetupPanel\|ManagePool\|ActionBar" src/ --include="*.jsx" --include="*.js"
```

Expected: no matches. If any remain, update those files to remove the imports.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove SetupPanel, ManagePool, and ActionBar (replaced by category tabs)"
```

---

## Task 10: Test and fix

Verify the app works end-to-end in the browser.

- [ ] **Step 1: Start dev server and test**

```bash
npm run dev
```

Test these flows in the browser:
1. Page loads with Factions tab active, filters visible, Results sub-tab shown
2. Click Randomize — factions appear in Results, reach summary shows
3. Switch to Map & Cards tab — map/deck results show if randomized
4. Switch to Hirelings tab — greyed out if no packs checked. Check a pack, hit Randomize, hirelings appear
5. Switch to Landmarks tab — greyed out if no sources. Enable sources + set count, Randomize, landmarks appear
6. In each tab, switch to Pool sub-tab — exclusion list works
7. Factions Pool sub-tab shows vagabond characters section
8. Lock/re-roll/ban actions work on faction cards
9. Per-category re-roll buttons work (re-roll unlocked, re-roll all hirelings/landmarks)
10. Player count and bots selector work in persistent bar
11. Undo/Share/Reset work
12. Board modal works for factions, hirelings, landmarks, vagabond characters
13. Mobile layout: persistent bar stacks, filters collapse properly, category tabs are scrollable
14. Light/dark theme toggle works

- [ ] **Step 2: Fix any issues found during testing**

Address any bugs or visual issues discovered. Common things to watch for:
- Missing CSS class references from old styles that were removed
- Props not being passed correctly to tab components
- Vagabond character face images or card modals not working
- Bots animation not triggering when Clockwork is toggled

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: resolve issues from category-first navigation migration"
```

---

## Task 11: Push

- [ ] **Step 1: Push to remote**

```bash
git push
```
