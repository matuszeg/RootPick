import { getHeadImage } from '../data/factionImages.js';
import { FACTION_MAP } from '../data/factions.js';

export default function FactionIcon({ factionId, className }) {
  const src = getHeadImage(factionId);
  const name = FACTION_MAP[factionId]?.name ?? '';
  return (
    <span className={`faction-icon ${className ?? ''}`} aria-hidden="true">
      {src
        ? <img src={src} alt={name} draggable={false} />
        : <span className="faction-icon-fallback">?</span>}
    </span>
  );
}
