import { useState, useMemo } from 'react';
import { MAPS } from '../data/maps.js';

// Dev-only coordinate picker. Click on a map image to capture clearing
// positions as percentages of image width/height. Output JSON can be pasted
// into src/data/maps.js. Gated to dev builds only via import.meta.env.DEV
// in main.jsx.

export default function CoordPicker() {
  const [mapId, setMapId] = useState(MAPS[0].id);
  const map = useMemo(() => MAPS.find(m => m.id === mapId), [mapId]);
  const expectedCount = map?.clearingCount ?? 12;
  const [points, setPoints] = useState([]); // [{ id, x, y }]

  function handleImgClick(e) {
    if (points.length >= expectedCount) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints(prev => [...prev, { id: prev.length + 1, x: round(x), y: round(y) }]);
  }

  function round(n) { return Math.round(n * 10) / 10; }

  function reset() { setPoints([]); }
  function undo() { setPoints(prev => prev.slice(0, -1)); }

  function pickMap(id) {
    setMapId(id);
    setPoints([]);
  }

  const json = useMemo(() => {
    const lines = points.map(p => `      { id: ${p.id}, x: ${p.x}, y: ${p.y} },`);
    return `clearings: [\n${lines.join('\n')}\n    ],`;
  }, [points]);

  function copyJson() {
    navigator.clipboard.writeText(json).catch(() => {});
  }

  if (!map) return <div style={{ padding: 20 }}>No map.</div>;

  const remaining = expectedCount - points.length;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Clearing Coordinate Picker (dev)</h1>
        <div style={styles.toolbar}>
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
          <span style={styles.counter}>
            {points.length} / {expectedCount} placed
            {remaining > 0 ? ` — ${remaining} remaining` : ' — done!'}
          </span>
          <button onClick={undo} disabled={!points.length} style={styles.btn}>Undo</button>
          <button onClick={reset} disabled={!points.length} style={styles.btn}>Reset</button>
          <button onClick={copyJson} disabled={!points.length} style={styles.btn}>Copy JSON</button>
        </div>
        <p style={styles.hint}>
          Click each clearing in order, starting with clearing 1. The next click will place clearing #{points.length + 1}.
          Numbering is your choice — pick a consistent convention (e.g., reading order top-to-bottom, left-to-right).
        </p>
      </header>

      <div style={styles.canvasWrap}>
        <div style={styles.canvas}>
          <img
            src={map.img}
            alt={`${map.name} map`}
            draggable={false}
            onClick={handleImgClick}
            style={styles.img}
          />
          {points.map(p => (
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
        </div>
      </div>

      <pre style={styles.json}>{json}</pre>
    </div>
  );
}

const styles = {
  app: { fontFamily: 'system-ui, -apple-system, sans-serif', padding: 16, maxWidth: 1400, margin: '0 auto' },
  header: { marginBottom: 12 },
  toolbar: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 },
  label: { fontSize: 14 },
  counter: { fontSize: 13, color: '#444' },
  btn: { padding: '4px 10px', fontSize: 13, cursor: 'pointer' },
  hint: { fontSize: 12, color: '#666', marginTop: 8 },
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
