import { useState } from 'react';
import { FACTION_MAP } from '../data/factions.js';

export default function BannedPanel({ bannedFactions, onUnban }) {
  const [open, setOpen] = useState(true);

  if (bannedFactions.size === 0) return null;

  return (
    <div className="banned-panel">
      <button
        className="banned-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>Banned Factions ({bannedFactions.size})</span>
        <span className={`chevron ${open ? 'up' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="banned-chips">
          {[...bannedFactions].map(id => {
            const f = FACTION_MAP[id];
            if (!f) return null;
            return (
              <button
                key={id}
                className="banned-chip"
                onClick={() => onUnban(id)}
                title={`Unban ${f.name}`}
              >
                {f.name}
                <span className="unban-x">×</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
