import { useState, useMemo } from 'react';
import { MAPS } from '../data/maps.js';

// Dev-only coordinate picker. Two modes:
// - "clearings": click each clearing on a map to capture % coordinates
// - "floods": click each Marsh flood-marker position; live preview shows the
//   actual flood image at adjustable scale so you can line them up perfectly.
// Output JSON pastes into src/data/maps.js. Gated to dev builds via
// import.meta.env.DEV in main.jsx.

const FLOOD_MARKERS = [
  { id: 'marsh_06', clearingId: 6,  label: 'Clearing 6 (dark green)',  img: '/icons/floods/marsh_06.png' },
  { id: 'marsh_08', clearingId: 8,  label: 'Clearing 8 (dark green)',  img: '/icons/floods/marsh_08.png' },
  { id: 'marsh_10', clearingId: 10, label: 'Clearing 10 (brown)',      img: '/icons/floods/marsh_10.png' },
  { id: 'marsh_11', clearingId: 11, label: 'Clearing 11 (brown)',      img: '/icons/floods/marsh_11.png' },
  { id: 'marsh_13', clearingId: 13, label: 'Clearing 13 (light green)', img: '/icons/floods/marsh_13.png' },
  { id: 'marsh_14', clearingId: 14, label: 'Clearing 14 (light green)', img: '/icons/floods/marsh_14.png' },
];

export default function CoordPicker() {
  const [mode, setMode] = useState('clearings');
  const [mapId, setMapId] = useState(MAPS[0].id);
  const map = useMemo(() => MAPS.find(m => m.id === mapId), [mapId]);
  const expectedCount = map?.clearingCount ?? 12;

  // Clearings mode state
  const [points, setPoints] = useState([]);

  // Floods mode state
  const [floodPositions, setFloodPositions] = useState({});
  const [activeFloodId, setActiveFloodId] = useState(FLOOD_MARKERS[0].id);
  const [floodScale, setFloodScale] = useState(15); // % of map width
  const [cursorPos, setCursorPos] = useState(null); // { x, y } in % of map

  function round(n) { return Math.round(n * 10) / 10; }

  function pickMap(id) {
    setMapId(id);
    setPoints([]);
  }

  function pickMode(m) {
    setMode(m);
    if (m === 'floods') setMapId('marsh');
  }

  function handleImgClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (mode === 'clearings') {
      if (points.length >= expectedCount) return;
      setPoints(prev => [...prev, { id: prev.length + 1, x: round(x), y: round(y) }]);
    } else {
      setFloodPositions(prev => ({ ...prev, [activeFloodId]: { x: round(x), y: round(y) } }));
      // Auto-advance to first unplaced marker
      const next = FLOOD_MARKERS.find(m => !{ ...floodPositions, [activeFloodId]: true }[m.id]);
      if (next && next.id !== activeFloodId) setActiveFloodId(next.id);
    }
  }

  function undo() {
    if (mode === 'clearings') setPoints(prev => prev.slice(0, -1));
    else setFloodPositions(prev => {
      const last = Object.keys(prev).pop();
      if (!last) return prev;
      const next = { ...prev };
      delete next[last];
      return next;
    });
  }

  function reset() {
    if (mode === 'clearings') setPoints([]);
    else { setFloodPositions({}); setActiveFloodId(FLOOD_MARKERS[0].id); }
  }

  const clearingsJson = useMemo(() => {
    const lines = points.map(p => `      { id: ${p.id}, x: ${p.x}, y: ${p.y} },`);
    return `clearings: [\n${lines.join('\n')}\n    ],`;
  }, [points]);

  const floodsJson = useMemo(() => {
    const lines = FLOOD_MARKERS.map(m => {
      const p = floodPositions[m.id];
      if (!p) return `  // ${m.label}: not placed`;
      return `  { clearingId: ${m.clearingId}, img: '${m.img}', x: ${p.x}, y: ${p.y} },`;
    });
    return `floodMarkerPlacements: [\n${lines.join('\n')}\n],\nfloodMarkerScale: ${floodScale},`;
  }, [floodPositions, floodScale]);

  function copyJson() {
    const txt = mode === 'clearings' ? clearingsJson : floodsJson;
    navigator.clipboard.writeText(txt).catch(() => {});
  }

  if (!map) return <div style={{ padding: 20 }}>No map.</div>;

  const placedCount = mode === 'clearings' ? points.length : Object.keys(floodPositions).length;
  const totalCount = mode === 'clearings' ? expectedCount : FLOOD_MARKERS.length;
  const remaining = totalCount - placedCount;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Coordinate Picker (dev)</h1>

        <div style={styles.toolbar}>
          <div style={styles.modeToggle}>
            <button
              onClick={() => pickMode('clearings')}
              style={{ ...styles.btn, ...(mode === 'clearings' ? styles.btnActive : {}) }}
            >
              Clearings
            </button>
            <button
              onClick={() => pickMode('floods')}
              style={{ ...styles.btn, ...(mode === 'floods' ? styles.btnActive : {}) }}
            >
              Marsh Floods
            </button>
          </div>

          {mode === 'clearings' && (
            <label style={styles.label}>
              Map:&nbsp;
              <select value={mapId} onChange={e => pickMap(e.target.value)}>
                {MAPS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.clearingCount ?? 12} clearings)
                  </option>
                ))}
              </select>
            </label>
          )}

          {mode === 'floods' && (
            <label style={styles.label}>
              Marker scale: {floodScale}%
              <input
                type="range"
                min="5" max="40" step="0.5"
                value={floodScale}
                onChange={e => setFloodScale(Number(e.target.value))}
                style={{ marginLeft: 8, width: 160, verticalAlign: 'middle' }}
              />
            </label>
          )}

          <span style={styles.counter}>
            {placedCount} / {totalCount} placed
            {remaining > 0 ? ` — ${remaining} remaining` : ' — done!'}
          </span>
          <button onClick={undo} disabled={!placedCount} style={styles.btn}>Undo</button>
          <button onClick={reset} disabled={!placedCount} style={styles.btn}>Reset</button>
          <button onClick={copyJson} disabled={!placedCount} style={styles.btn}>Copy JSON</button>
        </div>

        {mode === 'clearings' ? (
          <p style={styles.hint}>
            Click each clearing in order. Next click places clearing #{points.length + 1}.
          </p>
        ) : (
          <p style={styles.hint}>
            Click on the Marsh map to position the active flood marker (highlighted below).
            Adjust the marker scale slider until the placed flood images match the printed-board size.
            Click any flood in the list below to make it active for re-positioning.
          </p>
        )}

        {mode === 'floods' && (
          <div style={styles.floodList}>
            {FLOOD_MARKERS.map(m => {
              const placed = !!floodPositions[m.id];
              const active = m.id === activeFloodId;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveFloodId(m.id)}
                  style={{
                    ...styles.floodChip,
                    ...(active ? styles.floodChipActive : {}),
                    ...(placed ? {} : { opacity: 0.55 }),
                  }}
                  title={`Click to make ${m.label} active`}
                >
                  <img src={m.img} alt="" style={styles.floodChipImg} />
                  <span style={{ fontSize: 11 }}>
                    {m.label}{placed ? ` · ${floodPositions[m.id].x}, ${floodPositions[m.id].y}` : ' · unplaced'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      <div style={styles.canvasWrap}>
        <div
          style={styles.canvas}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            setCursorPos({
              x: ((e.clientX - rect.left) / rect.width) * 100,
              y: ((e.clientY - rect.top) / rect.height) * 100,
            });
          }}
          onMouseLeave={() => setCursorPos(null)}
        >
          <img
            src={map.img}
            alt={`${map.name} map`}
            draggable={false}
            onClick={handleImgClick}
            style={styles.img}
          />

          {/* Clearings markers */}
          {mode === 'clearings' && points.map(p => (
            <div
              key={p.id}
              style={{
                ...styles.marker,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              title={`Clearing ${p.id} (${p.x}%, ${p.y}%)`}
            >
              {p.id}
            </div>
          ))}

          {/* Flood marker overlays */}
          {mode === 'floods' && FLOOD_MARKERS.map(m => {
            const p = floodPositions[m.id];
            if (!p) return null;
            const active = m.id === activeFloodId;
            return (
              <img
                key={m.id}
                src={m.img}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: `${floodScale}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  outline: active ? '3px dashed yellow' : 'none',
                  outlineOffset: 2,
                }}
              />
            );
          })}

          {/* Cursor ghost: shows the active flood image translucently at the cursor */}
          {mode === 'floods' && cursorPos && (() => {
            const m = FLOOD_MARKERS.find(x => x.id === activeFloodId);
            if (!m) return null;
            return (
              <img
                src={m.img}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  left: `${cursorPos.x}%`,
                  top: `${cursorPos.y}%`,
                  width: `${floodScale}%`,
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.5,
                  pointerEvents: 'none',
                }}
              />
            );
          })()}
        </div>
      </div>

      <pre style={styles.json}>{mode === 'clearings' ? clearingsJson : floodsJson}</pre>
    </div>
  );
}

const styles = {
  app: { fontFamily: 'system-ui, -apple-system, sans-serif', padding: 16, maxWidth: 1400, margin: '0 auto' },
  header: { marginBottom: 12 },
  toolbar: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 },
  modeToggle: { display: 'flex', gap: 4, border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden' },
  label: { fontSize: 14 },
  counter: { fontSize: 13, color: '#444' },
  btn: { padding: '4px 10px', fontSize: 13, cursor: 'pointer', background: '#fff', border: '1px solid #bbb', borderRadius: 3 },
  btnActive: { background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' },
  hint: { fontSize: 12, color: '#666', marginTop: 8 },
  floodList: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 },
  floodChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '4px 8px', border: '1.5px solid #ccc', borderRadius: 4,
    background: '#fff', cursor: 'pointer', fontSize: 12,
  },
  floodChipActive: { borderColor: '#e0b04a', boxShadow: '0 0 0 2px rgba(224, 176, 74, 0.35)' },
  floodChipImg: { width: 28, height: 28, objectFit: 'contain' },
  canvasWrap: { background: '#222', padding: 8, borderRadius: 6 },
  canvas: { position: 'relative', display: 'inline-block' },
  img: { display: 'block', maxWidth: '100%', cursor: 'crosshair', userSelect: 'none' },
  marker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: 28, height: 28, borderRadius: '50%',
    background: 'rgba(245, 200, 80, 0.95)',
    border: '2px solid #1a1a1a',
    color: '#1a1a1a',
    fontWeight: 700,
    fontSize: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none',
    boxShadow: '0 0 8px rgba(0,0,0,0.5)',
  },
  json: {
    background: '#1a1a1a', color: '#d8d4c8',
    padding: 12, borderRadius: 6, marginTop: 12,
    fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
    fontSize: 12, overflowX: 'auto',
  },
};
