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
export default function ClearingOverlay({ map, mapSetup, floodColors }) {
  if (!map || !mapSetup) return null;
  const clearings = (map.clearings ?? []).filter(c => typeof c.x === 'number' && typeof c.y === 'number');
  if (!clearings.length) return null;

  const suits = mapSetup.clearingSuits ?? {};
  const floods = mapSetup.floodMarkers ?? {};
  const placements = mapSetup.nativeLandmarkPlacements ?? {};
  // Reverse the flood/native placement maps so we can look up by clearing id.
  const floodByClearing = invertMap(floods);            // { clearingId: floodMarkerId }
  const nativeByClearing = invertMap(placements);       // { clearingId: landmarkId }

  return (
    <div className="clearing-overlay" aria-hidden="true">
      {clearings.map(c => {
        const suit = suits[c.id];
        const floodId = floodByClearing[c.id];
        const nativeId = nativeByClearing[c.id];
        const flood = floodId ? (map.floodMarkers ?? []).find(f => f.id === floodId) : null;
        const native = nativeId ? LANDMARK_MAP[nativeId] : null;

        return (
          <ClearingBadge
            key={c.id}
            clearing={c}
            suit={suit}
            flood={flood}
            native={native}
            floodColors={floodColors}
          />
        );
      })}
    </div>
  );
}

function ClearingBadge({ clearing, suit, flood, native }) {
  // Priority: flood > native > suit > unsuited (no data).
  // Native landmarks get their own colored badge with an inset thumbnail.
  // Floods get a colored swatch.
  // Suits get a colored circle with the suit token icon.
  // Unsuited clearings (Marsh leftover with no flood/native) get a hollow dashed circle.
  const style = { left: `${clearing.x}%`, top: `${clearing.y}%` };

  if (flood) {
    return (
      <div className="clearing-badge clearing-badge--flood" style={{ ...style, '--badge-bg': flood.color }}>
        <span className="clearing-badge-id">{clearing.id}</span>
      </div>
    );
  }

  if (native) {
    return (
      <div className="clearing-badge clearing-badge--native" style={style} title={`${native.name} — ${clearing.id}`}>
        <img className="clearing-badge-thumb" src={native.frontImg} alt="" draggable={false} />
        <span className="clearing-badge-id">{clearing.id}</span>
      </div>
    );
  }

  if (suit) {
    return (
      <div
        className={`clearing-badge clearing-badge--suit clearing-badge--${suit}`}
        style={{ ...style, '--badge-bg': SUIT_BG[suit], '--badge-glow': SUIT_GLOW[suit] }}
        title={`Clearing ${clearing.id} — ${suit}`}
      >
        <img className="clearing-badge-icon" src={SUIT_ICON[suit]} alt="" draggable={false} />
        <span className="clearing-badge-id">{clearing.id}</span>
      </div>
    );
  }

  // Unsuited / pending
  return (
    <div className="clearing-badge clearing-badge--empty" style={style} title={`Clearing ${clearing.id}`}>
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
