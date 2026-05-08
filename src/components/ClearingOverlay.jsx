import { LANDMARK_MAP } from '../data/accessories.js';

const SUIT_BG = {
  fox:    '#C4621A',
  rabbit: '#D9B23A',
  mouse:  '#D8845A',
};

const SUIT_GLOW = {
  fox:    'rgba(196, 98, 26, 0.65)',
  rabbit: 'rgba(217, 178, 58, 0.7)',
  mouse:  'rgba(216, 132, 90, 0.65)',
};

const SUIT_ICON = {
  fox:    '/icons/clearings/fox.png',
  rabbit: '/icons/clearings/rabbit.png',
  mouse:  '/icons/clearings/mouse.png',
};

// Renders suit/flood/native badges absolutely positioned over a map image.
// `map` must have a `clearings` array with `{id, x, y}` (percentages of image).
// `onToggleLock` (optional) — when provided, clicking a suited badge toggles
// its lock state; locked badges are rendered with a lock indicator.
export default function ClearingOverlay({ map, mapSetup, onToggleLock }) {
  if (!map || !mapSetup) return null;
  const clearings = (map.clearings ?? []).filter(c => typeof c.x === 'number' && typeof c.y === 'number');
  if (!clearings.length) return null;

  const suits = mapSetup.clearingSuits ?? {};
  const floods = mapSetup.floodMarkers ?? {};
  const placements = mapSetup.nativeLandmarkPlacements ?? {};
  const locked = mapSetup.lockedClearingSuits ?? {};
  const floodByClearing = invertMap(floods);
  const nativeByClearing = invertMap(placements);

  // Marsh-only: per-clearing flood marker images and their custom positions.
  const floodPlacements = map.floodMarkerPlacements ?? [];
  const floodScale = map.floodMarkerScale ?? 15;
  const placementByClearing = Object.fromEntries(floodPlacements.map(p => [p.clearingId, p]));

  return (
    <div className="clearing-overlay" aria-hidden="true">
      {/* Flood marker images (Marsh): drawn first so suit/native badges sit on top. */}
      {Object.entries(floods).map(([markerId, clearingId]) => {
        const placement = placementByClearing[clearingId];
        if (!placement) return null;
        return (
          <img
            key={`flood-img-${markerId}`}
            className="clearing-flood-img"
            src={placement.img}
            alt=""
            draggable={false}
            style={{
              left: `${placement.x}%`,
              top: `${placement.y}%`,
              width: `${floodScale}%`,
            }}
          />
        );
      })}

      {/* Native landmark token images (Marsh 5+p): rendered like flood images
         using the same per-clearing placement positions. Falls back to clearing
         center if no placement data exists. */}
      {Object.entries(placements).map(([landmarkId, clearingId]) => {
        const lm = LANDMARK_MAP[landmarkId];
        if (!lm || !lm.tokenImg) return null;
        const placement = placementByClearing[clearingId];
        const clearing = map.clearings.find(c => c.id === clearingId);
        const x = placement?.x ?? clearing?.x;
        const y = placement?.y ?? clearing?.y;
        if (x == null || y == null) return null;
        return (
          <img
            key={`native-img-${landmarkId}`}
            className="clearing-native-img"
            src={lm.tokenImg}
            alt=""
            draggable={false}
            title={`${lm.name} — Clearing ${clearingId}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${floodScale}%`,
            }}
          />
        );
      })}

      {clearings.map(c => {
        const suit = suits[c.id];
        const floodId = floodByClearing[c.id];
        const nativeId = nativeByClearing[c.id];
        const flood = floodId ? (map.floodMarkers ?? []).find(f => f.id === floodId) : null;
        const native = nativeId ? LANDMARK_MAP[nativeId] : null;
        const isLocked = c.id in locked;

        return (
          <ClearingBadge
            key={c.id}
            clearing={c}
            suit={suit}
            flood={flood}
            native={native}
            locked={isLocked}
            onToggleLock={onToggleLock}
          />
        );
      })}
    </div>
  );
}

function ClearingBadge({ clearing, suit, flood, native, locked, onToggleLock }) {
  const style = { left: `${clearing.x}%`, top: `${clearing.y}%` };

  // Flooded clearings are shown via a per-clearing image overlay (drawn
  // separately by ClearingOverlay), so we don't draw the badge here.
  if (flood) return null;

  if (native) {
    // When the native landmark has a token image, ClearingOverlay draws the
    // full image separately — no badge needed here.
    if (native.tokenImg) return null;
    return (
      <div className="clearing-badge clearing-badge--native" style={style} title={`${native.name} — Clearing ${clearing.id}`}>
        <img className="clearing-badge-thumb" src={native.frontImg} alt="" draggable={false} />
        <span className="clearing-badge-id">{clearing.id}</span>
      </div>
    );
  }

  if (suit) {
    const interactive = !!onToggleLock;
    const handleClick = e => {
      if (!interactive) return;
      e.stopPropagation();
      onToggleLock(clearing.id);
    };
    const title = interactive
      ? `Clearing ${clearing.id} — ${suit}${locked ? ' (locked — click to unlock)' : ' (click to lock)'}`
      : `Clearing ${clearing.id} — ${suit}`;
    return (
      <div
        className={`clearing-badge clearing-badge--suit clearing-badge--${suit}${locked ? ' is-locked' : ''}${interactive ? ' is-clickable' : ''}`}
        style={{ ...style, '--badge-bg': SUIT_BG[suit], '--badge-glow': SUIT_GLOW[suit] }}
        title={title}
        onClick={handleClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onToggleLock(clearing.id);
          }
        } : undefined}
      >
        <img className="clearing-badge-icon" src={SUIT_ICON[suit]} alt="" draggable={false} />
        <span className="clearing-badge-id">{clearing.id}</span>
        {locked && <span className="clearing-badge-lock" aria-label="locked">🔒</span>}
      </div>
    );
  }

  return (
    <div className="clearing-badge clearing-badge--empty" style={style} title={`Clearing ${clearing.id} (unsuited)`}>
      <span className="clearing-badge-id">{clearing.id}</span>
    </div>
  );
}

function invertMap(obj) {
  if (!obj) return {};
  const out = {};
  for (const [k, v] of Object.entries(obj)) out[v] = k;
  return out;
}
