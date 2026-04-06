import { useState } from 'react';
import { FACTIONS, FACTION_MAP } from '../data/factions.js';
import { MAPS, MAP_COLORS } from '../data/maps.js';
import { HIRELING_SETS, VAGABOND_CHARACTERS, LANDMARKS } from '../data/accessories.js';
import FactionIcon from './FactionIcon.jsx';
import { MapIcon, LandmarkIcon, XIcon, CheckIcon, StarIcon } from './Icons.jsx';

function StarsInline({ count }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <StarIcon key={i} width={10} height={10} filled />
      ))}
    </>
  );
}

const HIRELING_SOURCE_COLORS = {
  marauder_hirelings_base: '#C83228',
  marauder_hirelings:      '#C83228',
  riverfolk_hirelings:  '#3AACA8',
  underworld_hirelings: '#7B4FA3',
  homeland_hirelings:   '#3A9CB0',
};
const CHARACTER_COLOR = '#8C7B6A';
const LANDMARK_COLOR  = '#5A7A3A';

function EmptyPoolMessage({ message }) {
  return (
    <div className="pool-empty">
      <p>{message}</p>
    </div>
  );
}

// ── Reusable toggle row ────────────────────────────────────────────────────

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

// ── Sub-tabs ───────────────────────────────────────────────────────────────

function FactionsTab({ state, actions }) {
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
    return <EmptyPoolMessage message="No factions available. Enable expansions in Settings." />;
  }

  const militants  = available.filter(f => f.type === 'militant').sort((a, b) => b.reach - a.reach);
  const insurgents = available.filter(f => f.type === 'insurgent').sort((a, b) => b.reach - a.reach);

  return (
    <div className="pool-tab-content">
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
    </div>
  );
}

function MapsTab({ state, actions }) {
  const { activeMapExpansions, excludedMaps } = state;

  const COMPLEXITY = {
    1: <><StarsInline count={1} /> Beginner</>,
    2: <><StarsInline count={2} /> Moderate</>,
    3: <><StarsInline count={3} /> Complex</>,
  };

  const available = MAPS.filter(m => activeMapExpansions.has(m.expansion));

  if (available.length === 0) {
    return <EmptyPoolMessage message="No maps available. Enable expansions in Settings." />;
  }

  return (
    <div className="pool-tab-content">
      <p className="pool-tab-hint">Click a map to exclude or include it. Use Settings → Maps to filter by complexity.</p>
      <div className="pool-grid">
        {available.map(m => (
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
    </div>
  );
}

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

function HirelingsTab({ state, actions }) {
  const { ownedAccessories, excludedHirelings, bannedHirelings } = state;

  const available = HIRELING_SETS.filter(h => ownedAccessories.has(h.source));

  if (available.length === 0) {
    return <EmptyPoolMessage message="No hirelings available. Enable the Marauder Expansion or hireling packs in Settings." />;
  }

  return (
    <div className="pool-tab-content">
      <p className="pool-tab-hint">Click a hireling card to exclude or include it from the draw.</p>
      {HIRELING_GROUPS.map(group => {
        const groupHirelings = available.filter(h => h.source === group.source);
        if (groupHirelings.length === 0) return null;
        return (
          <div key={group.source} className="pool-section">
            <h4
              className="pool-section-heading"
              style={{ borderColor: HIRELING_SOURCE_COLORS[group.source] ?? '#7A5A2A' }}
            >
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
    </div>
  );
}

function CharactersTab({ state, actions }) {
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

  if (available.length === 0) {
    return <EmptyPoolMessage message="No vagabond characters available." />;
  }

  return (
    <div className="pool-tab-content">
      <p className="pool-tab-hint">Click a character to exclude or include it from vagabond assignment.</p>
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

function LandmarksTab({ state, actions }) {
  const { ownedAccessories, excludedLandmarks } = state;

  const SOURCE_LABEL = {
    underworld_landmarks: 'Underworld Expansion',
    homeland_landmarks: 'Homeland Expansion',
    landmarks_pack: 'Landmarks Pack',
  };

  const available = LANDMARKS.filter(l => ownedAccessories.has(l.source));

  if (available.length === 0) {
    return <EmptyPoolMessage message="No landmarks available. Enable the Underworld Expansion or Landmarks Pack in Settings." />;
  }

  return (
    <div className="pool-tab-content">
      <p className="pool-tab-hint">Click a landmark to exclude or include it.</p>
      <div className="pool-grid">
        {available.map(l => (
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
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ManagePool({ state, actions }) {
  const [subTab, setSubTab] = useState('factions');

  const {
    bannedFactions, excludedMaps, excludedHirelings, bannedHirelings, excludedCharacters, excludedLandmarks,
  } = state;

  const subTabs = [
    { id: 'factions',   label: 'Factions',   count: bannedFactions.size },
    { id: 'maps',       label: 'Maps',        count: excludedMaps.size },
    { id: 'hirelings',  label: 'Hirelings',   count: excludedHirelings.size + bannedHirelings.size },
    { id: 'characters', label: 'Characters',  count: excludedCharacters.size },
    { id: 'landmarks',  label: 'Landmarks',   count: excludedLandmarks.size },
  ];

  return (
    <div className="manage-pool">
      <nav className="pool-subtabs" role="tablist" aria-label="Pool categories">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            className={`pool-subtab ${subTab === tab.id ? 'active' : ''}`}
            role="tab"
            aria-selected={subTab === tab.id}
            onClick={() => setSubTab(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && <span className="pool-subtab-count">{tab.count}</span>}
          </button>
        ))}
      </nav>

      {subTab === 'factions'   && <FactionsTab   state={state} actions={actions} />}
      {subTab === 'maps'       && <MapsTab        state={state} actions={actions} />}
      {subTab === 'hirelings'  && <HirelingsTab   state={state} actions={actions} />}
      {subTab === 'characters' && <CharactersTab  state={state} actions={actions} />}
      {subTab === 'landmarks'  && <LandmarksTab   state={state} actions={actions} />}
    </div>
  );
}
