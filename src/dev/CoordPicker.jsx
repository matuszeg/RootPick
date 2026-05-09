import { useState, useMemo, useEffect } from 'react';
import { MAPS } from '../data/maps.js';
import { nearestClearingId } from '../utils/mapRandomizer.js';

// Dev-only coordinate picker. Six modes:
// - "clearings":  click each clearing on a map to capture % coordinates
// - "floods":     click each Marsh flood-marker position; live preview shows the
//                 actual flood image at adjustable scale
// - "ruins":      click ruin positions; each ruin is auto-assigned to its
//                 nearest clearing
// - "slots":      same as ruins but for building slots
// - "landmarks":  click landmark slot positions; each is assigned to its
//                 nearest clearing — eligibility for coastal / river
//                 placement is derived from the owning clearing's flags
// - "adjacency":  click two clearings in sequence to toggle a path edge
//                 between them; outputs the adjacency edge list
// - "reshape":    Marsh-only — for each flood-eligible clearing, click two
//                 of its neighbors to pair them as a through-path; remaining
//                 unpaired neighbors become flooded paths. Outputs the
//                 floodReshape map.
// - "flags":      click a clearing badge to select, then toggle isCoastal /
//                 onRiver / isCorner; outputs the clearings array with flags
//
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

const FLAG_KEYS = ['isCoastal', 'onRiver', 'isCorner'];

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

  // Ruins / slots mode state — array of { x, y }
  const [ruins, setRuins] = useState([]);
  const [slots, setSlots] = useState([]);
  const [ruinScale, setRuinScale] = useState(7); // % of map width
  const [ruinLabel, setRuinLabel] = useState(''); // optional label applied to next placed ruin

  // Landmark slot mode state — array of { x, y }
  const [landmarkSlots, setLandmarkSlots] = useState([]);
  const [landmarkScale, setLandmarkScale] = useState(10); // % of map width — preview scale

  // Adjacency mode state — list of [a, b] pairs (a < b for canonical form)
  const [edges, setEdges] = useState([]);
  const [pendingEdgeFrom, setPendingEdgeFrom] = useState(null);

  // Reshape mode state. `reshape[clearingId]` is { through: [[a, b], ...] }.
  // `reshapeActive` is which flood-eligible clearing is currently being edited.
  // `reshapePending` is the first neighbor click of a pair-in-progress.
  const [reshape, setReshape] = useState({});
  const [reshapeActive, setReshapeActive] = useState(6);
  const [reshapePending, setReshapePending] = useState(null);

  // Flags mode state — { [clearingId]: { isCoastal, onRiver, isCenter } }
  const [flags, setFlags] = useState({});
  const [activeClearingId, setActiveClearingId] = useState(null);

  // Cursor tracking (used by floods preview + ruins/slots nearest-clearing hint)
  const [cursorPos, setCursorPos] = useState(null);

  function round(n) { return Math.round(n * 10) / 10; }

  // Reset per-mode/per-map state when the map changes; pre-fill flags + ruins/slots
  // from the current map data so the user can iterate on existing values.
  useEffect(() => {
    if (!map) return;
    setPoints([]);
    setRuins((map.ruins ?? []).map(r => {
      const out = { x: r.x, y: r.y };
      if (r.label) out.label = r.label;
      return out;
    }));
    setRuinLabel('');
    setLandmarkSlots((map.landmarkSlots ?? []).map(s => ({ x: s.x, y: s.y })));
    setEdges((map.adjacency ?? []).map(([a, b]) => a < b ? [a, b] : [b, a]));
    setPendingEdgeFrom(null);
    // Pre-fill reshape from authored map data (Marsh only); deep-copy so
    // edits don't mutate the source.
    const fr = {};
    for (const [cid, val] of Object.entries(map.floodReshape ?? {})) {
      fr[cid] = { through: (val.through ?? []).map(p => [...p]) };
    }
    setReshape(fr);
    // Default active to the first flood-eligible clearing on this map.
    const floodIds = (map.floodMarkers ?? []).flatMap(m => m.clearingPair ?? []);
    setReshapeActive(floodIds[0] ?? null);
    setReshapePending(null);
    setSlots((map.buildingSlots ?? []).map(s => ({ x: s.x, y: s.y })));
    const initFlags = {};
    for (const c of map.clearings) {
      const f = {};
      for (const k of FLAG_KEYS) if (c[k]) f[k] = true;
      if (Object.keys(f).length) initFlags[c.id] = f;
    }
    setFlags(initFlags);
    setActiveClearingId(map.clearings[0]?.id ?? null);
  }, [mapId, map]);

  function pickMap(id) { setMapId(id); }

  function pickMode(m) {
    setMode(m);
    if (m === 'floods' || m === 'reshape') setMapId('marsh');
  }

  function handleImgClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = round(((e.clientX - rect.left) / rect.width) * 100);
    const y = round(((e.clientY - rect.top) / rect.height) * 100);

    if (mode === 'clearings') {
      if (points.length >= expectedCount) return;
      setPoints(prev => [...prev, { id: prev.length + 1, x, y }]);
    } else if (mode === 'floods') {
      setFloodPositions(prev => ({ ...prev, [activeFloodId]: { x, y } }));
      const next = FLOOD_MARKERS.find(m => !{ ...floodPositions, [activeFloodId]: true }[m.id]);
      if (next && next.id !== activeFloodId) setActiveFloodId(next.id);
    } else if (mode === 'ruins') {
      const entry = { x, y };
      const label = ruinLabel.trim();
      if (label) entry.label = label;
      setRuins(prev => [...prev, entry]);
    } else if (mode === 'slots') {
      setSlots(prev => [...prev, { x, y }]);
    } else if (mode === 'landmarks') {
      setLandmarkSlots(prev => [...prev, { x, y }]);
    }
    // flags / adjacency modes don't act on background-canvas clicks; their
    // interactions go through clearing-badge clicks below.
  }

  function clickClearing(cid) {
    if (mode === 'flags') {
      setActiveClearingId(cid);
      return;
    }
    if (mode === 'adjacency') {
      if (pendingEdgeFrom == null) {
        setPendingEdgeFrom(cid);
        return;
      }
      if (pendingEdgeFrom === cid) {
        setPendingEdgeFrom(null); // cancel
        return;
      }
      const a = Math.min(pendingEdgeFrom, cid);
      const b = Math.max(pendingEdgeFrom, cid);
      setEdges(prev => {
        const i = prev.findIndex(([x, y]) => x === a && y === b);
        if (i !== -1) {
          const next = [...prev];
          next.splice(i, 1);
          return next;
        }
        return [...prev, [a, b]];
      });
      setPendingEdgeFrom(null);
      return;
    }
    if (mode === 'reshape') {
      if (reshapeActive == null) return;
      if (cid === reshapeActive) {
        // Clicking the flooded clearing cancels any pending pair.
        setReshapePending(null);
        return;
      }
      // Only neighbors of the active clearing are valid pair candidates.
      const neighbors = new Set(
        (map.adjacency ?? []).flatMap(([a, b]) =>
          a === reshapeActive ? [b] : b === reshapeActive ? [a] : []
        )
      );
      if (!neighbors.has(cid)) return;
      // A neighbor may participate in MULTIPLE through-pairs (e.g. a
      // 3-neighbor flooded clearing can produce pairs [a,b], [a,c], [b,c]).
      // To remove a specific pair, use the pair list's X button — clicking
      // a neighbor never auto-removes pairs.
      if (reshapePending == null) {
        setReshapePending(cid);
        return;
      }
      if (reshapePending === cid) {
        setReshapePending(null);
        return;
      }
      const a = Math.min(reshapePending, cid);
      const b = Math.max(reshapePending, cid);
      setReshape(prev => {
        const cur = prev[reshapeActive] ?? { through: [] };
        const through = (cur.through ?? []).map(p => [...p]);
        // De-dupe identical pair if it already exists.
        if (!through.some(([x, y]) => x === a && y === b)) through.push([a, b]);
        return { ...prev, [reshapeActive]: { through } };
      });
      setReshapePending(null);
      return;
    }
  }

  function removeReshapePair(cid, pairIdx) {
    setReshape(prev => {
      const cur = prev[cid] ?? { through: [] };
      const through = (cur.through ?? []).filter((_, i) => i !== pairIdx);
      return { ...prev, [cid]: { through } };
    });
  }

  function undo() {
    if (mode === 'clearings') setPoints(prev => prev.slice(0, -1));
    else if (mode === 'floods') setFloodPositions(prev => {
      const last = Object.keys(prev).pop();
      if (!last) return prev;
      const next = { ...prev };
      delete next[last];
      return next;
    });
    else if (mode === 'ruins') setRuins(prev => prev.slice(0, -1));
    else if (mode === 'slots') setSlots(prev => prev.slice(0, -1));
    else if (mode === 'landmarks') setLandmarkSlots(prev => prev.slice(0, -1));
    else if (mode === 'adjacency') {
      if (pendingEdgeFrom != null) setPendingEdgeFrom(null);
      else setEdges(prev => prev.slice(0, -1));
    }
    else if (mode === 'reshape') {
      if (reshapePending != null) {
        setReshapePending(null);
      } else if (reshapeActive != null) {
        setReshape(prev => {
          const cur = prev[reshapeActive] ?? { through: [] };
          const through = (cur.through ?? []).slice(0, -1);
          return { ...prev, [reshapeActive]: { through } };
        });
      }
    }
  }

  function reset() {
    if (mode === 'clearings') setPoints([]);
    else if (mode === 'floods') { setFloodPositions({}); setActiveFloodId(FLOOD_MARKERS[0].id); }
    else if (mode === 'ruins') setRuins([]);
    else if (mode === 'slots') setSlots([]);
    else if (mode === 'landmarks') setLandmarkSlots([]);
    else if (mode === 'flags') setFlags({});
    else if (mode === 'adjacency') { setEdges([]); setPendingEdgeFrom(null); }
    else if (mode === 'reshape') {
      if (reshapeActive != null) {
        setReshape(prev => ({ ...prev, [reshapeActive]: { through: [] } }));
        setReshapePending(null);
      }
    }
  }

  function toggleFlag(key) {
    if (activeClearingId == null) return;
    setFlags(prev => {
      const cur = { ...(prev[activeClearingId] ?? {}) };
      if (cur[key]) delete cur[key]; else cur[key] = true;
      const next = { ...prev };
      if (Object.keys(cur).length) next[activeClearingId] = cur;
      else delete next[activeClearingId];
      return next;
    });
  }

  // ---- JSON outputs ----

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

  const ruinsJson = useMemo(() => {
    if (!ruins.length) return 'ruins: [],';
    const lines = ruins.map(r => {
      const cid = nearestClearingId(map, r.x, r.y);
      const labelPart = r.label ? `, label: '${r.label}'` : '';
      return `  { x: ${r.x}, y: ${r.y}${labelPart} }, // -> clearing ${cid}`;
    });
    return `ruins: [\n${lines.join('\n')}\n],`;
  }, [ruins, map]);

  const landmarkSlotsJson = useMemo(() => {
    const header = `// suggested scale for the matching nativeLandmarks entry: ${landmarkScale}`;
    if (!landmarkSlots.length) return `${header}\nlandmarkSlots: [],`;
    const lines = landmarkSlots.map(s => {
      const cid = nearestClearingId(map, s.x, s.y);
      return `  { x: ${s.x}, y: ${s.y} }, // -> clearing ${cid}`;
    });
    return `${header}\nlandmarkSlots: [\n${lines.join('\n')}\n],`;
  }, [landmarkSlots, map, landmarkScale]);

  const slotsJson = useMemo(() => {
    if (!slots.length) return 'buildingSlots: [],';
    const lines = slots.map(s => {
      const cid = nearestClearingId(map, s.x, s.y);
      return `  { x: ${s.x}, y: ${s.y} }, // -> clearing ${cid}`;
    });
    return `buildingSlots: [\n${lines.join('\n')}\n],`;
  }, [slots, map]);

  const reshapeJson = useMemo(() => {
    const cids = Object.keys(reshape).map(Number).sort((a, b) => a - b);
    if (!cids.length) return 'floodReshape: {},';
    const lines = cids.map(cid => {
      const through = (reshape[cid]?.through ?? []).map(([a, b]) => `[${a}, ${b}]`).join(', ');
      return `  ${cid}: { through: [${through}] },`;
    });
    return `floodReshape: {\n${lines.join('\n')}\n},`;
  }, [reshape]);

  const adjacencyJson = useMemo(() => {
    if (!edges.length) return 'adjacency: [],';
    const sorted = [...edges].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const lines = sorted.map(([a, b]) => `  [${a}, ${b}],`);
    return `adjacency: [\n${lines.join('\n')}\n],`;
  }, [edges]);

  const flagsJson = useMemo(() => {
    if (!map) return '';
    const lines = map.clearings.map(c => {
      const f = flags[c.id];
      const flagPart = f
        ? ', ' + FLAG_KEYS.filter(k => f[k]).map(k => `${k}: true`).join(', ')
        : '';
      return `      { id: ${c.id}, x: ${c.x}, y: ${c.y}${flagPart} },`;
    });
    return `clearings: [\n${lines.join('\n')}\n    ],`;
  }, [flags, map]);

  function copyJson() {
    const txt = (
      mode === 'clearings' ? clearingsJson :
      mode === 'floods'    ? floodsJson    :
      mode === 'ruins'     ? ruinsJson     :
      mode === 'slots'     ? slotsJson     :
      mode === 'landmarks' ? landmarkSlotsJson :
      mode === 'adjacency' ? adjacencyJson    :
      mode === 'reshape'   ? reshapeJson      :
                             flagsJson
    );
    navigator.clipboard.writeText(txt).catch(() => {});
  }

  if (!map) return <div style={{ padding: 20 }}>No map.</div>;

  // ---- Counts for the toolbar ----
  let placedCount, totalCount;
  if (mode === 'clearings')   { placedCount = points.length; totalCount = expectedCount; }
  else if (mode === 'floods') { placedCount = Object.keys(floodPositions).length; totalCount = FLOOD_MARKERS.length; }
  else if (mode === 'ruins')  { placedCount = ruins.length; totalCount = null; }
  else if (mode === 'slots')  { placedCount = slots.length; totalCount = null; }
  else if (mode === 'landmarks') { placedCount = landmarkSlots.length; totalCount = null; }
  else if (mode === 'adjacency') { placedCount = edges.length; totalCount = null; }
  else if (mode === 'reshape') {
    placedCount = (reshape[reshapeActive]?.through ?? []).length;
    totalCount = null;
  }
  else                        { placedCount = Object.keys(flags).length; totalCount = map.clearings.length; }

  // For ruins/slots, color-code by owning clearing (simple hash)
  function clearingColor(id) {
    if (id == null) return '#aaa';
    const palette = ['#e0b04a', '#6BBF59', '#5BB0E0', '#E07A6B', '#B86BE0', '#E0C36B', '#6BE0C3', '#E06B9B'];
    return palette[(id - 1) % palette.length];
  }

  const cursorOwnerId = (mode === 'ruins' || mode === 'slots' || mode === 'landmarks') && cursorPos
    ? nearestClearingId(map, cursorPos.x, cursorPos.y)
    : null;

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Coordinate Picker (dev)</h1>

        <div style={styles.toolbar}>
          <div style={styles.modeToggle}>
            {[
              ['clearings', 'Clearings'],
              ['floods',    'Marsh Floods'],
              ['ruins',     'Ruins'],
              ['slots',     'Building Slots'],
              ['landmarks', 'Landmark Slots'],
              ['adjacency', 'Adjacency'],
              ['reshape',   'Flood Reshape'],
              ['flags',     'Clearing Flags'],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => pickMode(id)}
                style={{ ...styles.btn, ...(mode === id ? styles.btnActive : {}) }}
              >
                {label}
              </button>
            ))}
          </div>

          {mode !== 'floods' && (
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

          {mode === 'ruins' && (
            <>
              <label style={styles.label}>
                Ruin scale: {ruinScale}%
                <input
                  type="range"
                  min="3" max="20" step="0.5"
                  value={ruinScale}
                  onChange={e => setRuinScale(Number(e.target.value))}
                  style={{ marginLeft: 8, width: 160, verticalAlign: 'middle' }}
                />
              </label>
              <label style={styles.label}>
                Label (optional):&nbsp;
                <input
                  type="text"
                  value={ruinLabel}
                  onChange={e => setRuinLabel(e.target.value)}
                  placeholder="e.g. R1 — leave blank for unlabeled"
                  style={{ width: 200, padding: '2px 6px', fontSize: 13 }}
                />
              </label>
            </>
          )}

          {mode === 'landmarks' && (
            <label style={styles.label}>
              Preview scale: {landmarkScale}%
              <input
                type="range"
                min="3" max="25" step="0.5"
                value={landmarkScale}
                onChange={e => setLandmarkScale(Number(e.target.value))}
                style={{ marginLeft: 8, width: 160, verticalAlign: 'middle' }}
              />
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
            {placedCount}{totalCount != null ? ` / ${totalCount}` : ''} placed
            {totalCount != null && (totalCount - placedCount) > 0 ? ` — ${totalCount - placedCount} remaining` : ''}
          </span>
          <button onClick={undo} disabled={!placedCount || mode === 'flags'} style={styles.btn}>Undo</button>
          <button onClick={reset} disabled={!placedCount} style={styles.btn}>Reset</button>
          <button onClick={copyJson} style={styles.btn}>Copy JSON</button>
        </div>

        {/* Mode-specific hints */}
        {mode === 'clearings' && (
          <p style={styles.hint}>Click each clearing in order. Next click places clearing #{points.length + 1}.</p>
        )}
        {mode === 'floods' && (
          <p style={styles.hint}>
            Click on the Marsh map to position the active flood marker (highlighted below).
            Adjust the marker scale slider until the placed flood images match the printed-board size.
          </p>
        )}
        {mode === 'ruins' && (
          <p style={styles.hint}>
            Click each ruin on the map. Each ruin is auto-assigned to its nearest clearing
            (shown by its dot color). Cursor preview shows the owning clearing.
          </p>
        )}
        {mode === 'slots' && (
          <p style={styles.hint}>
            Click each building slot on the map. Slots are auto-assigned to their nearest clearing.
            Place every slot you can see; per-clearing slot counts come from the totals.
          </p>
        )}
        {mode === 'landmarks' && (
          <p style={styles.hint}>
            Click landmark slot positions for the selected type. Each is auto-assigned to its
            nearest clearing. Use the scale slider to size the preview circle to match the
            printed-board landmark footprint.
          </p>
        )}
        {mode === 'adjacency' && (
          <p style={styles.hint}>
            Click a clearing badge, then click another to toggle a path between them. Click the
            same clearing twice to cancel a pending edge. Each path is drawn as a line on the map.
            {pendingEdgeFrom != null && <strong> Pending: clearing {pendingEdgeFrom} → ?</strong>}
          </p>
        )}
        {mode === 'reshape' && (
          <>
            <p style={styles.hint}>
              Pick a flood-eligible clearing below (red badge) — it gets removed from the
              map when its flood marker lands there. Click any two of its{' '}
              <strong>gray</strong> neighbors to pair them as a through-path (solid colored
              line = new adjacency). A neighbor can be in multiple pairs. Anything you{' '}
              <em>don't</em> pair stays as a flooded path automatically (blue dashed line,
              no adjacency). To remove a specific pair, use the X next to it below.
              {reshapePending != null && <strong> Pending: clearing {reshapePending} → click another neighbor (or click {reshapePending} again to cancel)</strong>}
            </p>
            <div style={styles.floodList}>
              {(map?.floodMarkers ?? [])
                .flatMap(fm => (fm.clearingPair ?? []).map(cid => ({ cid, color: fm.color })))
                .map(({ cid, color }) => {
                  const active = cid === reshapeActive;
                  const count = (reshape[cid]?.through ?? []).length;
                  return (
                    <button
                      key={cid}
                      onClick={() => { setReshapeActive(cid); setReshapePending(null); }}
                      style={{
                        ...styles.floodChip,
                        ...(active ? styles.floodChipActive : {}),
                        borderLeft: `6px solid ${color || '#888'}`,
                      }}
                      title={`Edit reshape for clearing ${cid}`}
                    >
                      <span style={{ fontWeight: 700 }}>C{cid}</span>
                      <span style={{ fontSize: 11, color: '#444' }}>{count} pair{count === 1 ? '' : 's'}</span>
                    </button>
                  );
                })}
            </div>
            {reshapeActive != null && (
              <div style={{ ...styles.floodList, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: '#444', marginRight: 6 }}>
                  C{reshapeActive} through-pairs:
                </span>
                {(reshape[reshapeActive]?.through ?? []).length === 0 ? (
                  <span style={{ fontSize: 12, color: '#888' }}>none — all neighbors are flooded paths</span>
                ) : (
                  (reshape[reshapeActive]?.through ?? []).map(([a, b], i) => {
                    const PAIR_COLORS = ['#6BBF59', '#5BB0E0', '#E07A6B', '#B86BE0', '#E0C36B', '#6BE0C3'];
                    const color = PAIR_COLORS[i % PAIR_COLORS.length];
                    return (
                      <span
                        key={`${a}-${b}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '3px 8px', borderRadius: 4,
                          background: color, color: '#1a1a1a', fontSize: 12, fontWeight: 600,
                        }}
                      >
                        C{a} ↔ C{b}
                        <button
                          onClick={() => removeReshapePair(reshapeActive, i)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: 14, fontWeight: 700, color: '#1a1a1a', padding: 0,
                          }}
                          title="Remove this pair"
                        >×</button>
                      </span>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
        {mode === 'flags' && (
          <p style={styles.hint}>
            Click a clearing badge below or on the map, then toggle flags. Flags persist as you switch clearings.
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

        {mode === 'flags' && (
          <div style={styles.flagsBar}>
            <div style={styles.clearingChips}>
              {map.clearings.map(c => {
                const has = !!flags[c.id];
                const active = c.id === activeClearingId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveClearingId(c.id)}
                    style={{
                      ...styles.clearingChip,
                      ...(active ? styles.clearingChipActive : {}),
                      ...(has ? styles.clearingChipHasFlags : {}),
                    }}
                    title={has ? Object.keys(flags[c.id]).join(', ') : 'no flags'}
                  >
                    {c.id}
                  </button>
                );
              })}
            </div>
            <div style={styles.flagToggles}>
              {FLAG_KEYS.map(k => {
                const on = !!flags[activeClearingId]?.[k];
                return (
                  <label key={k} style={styles.flagToggle}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleFlag(k)}
                      disabled={activeClearingId == null}
                    />
                    {k}
                  </label>
                );
              })}
            </div>
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
            style={{ ...styles.img, cursor: mode === 'flags' ? 'default' : 'crosshair' }}
          />

          {/* Clearings mode: numbered placements */}
          {mode === 'clearings' && points.map(p => (
            <div
              key={p.id}
              style={{ ...styles.marker, left: `${p.x}%`, top: `${p.y}%` }}
              title={`Clearing ${p.id} (${p.x}%, ${p.y}%)`}
            >
              {p.id}
            </div>
          ))}

          {/* Ruins / Slots / Landmarks / Flags / Adjacency / Reshape: render clearings as badges */}
          {(mode === 'ruins' || mode === 'slots' || mode === 'landmarks' || mode === 'flags' || mode === 'adjacency' || mode === 'reshape') && map.clearings.map(c => {
            // Reshape mode: classify badge state.
            const isReshapeActive = mode === 'reshape' && c.id === reshapeActive;
            const isReshapePending = mode === 'reshape' && c.id === reshapePending;
            const reshapePairs = mode === 'reshape' ? (reshape[reshapeActive]?.through ?? []) : [];
            const isInAnyPair = reshapePairs.some(([a, b]) => a === c.id || b === c.id);
            const isReshapeNeighbor = mode === 'reshape' && reshapeActive != null
              ? new Set((map.adjacency ?? []).flatMap(([a, b]) =>
                  a === reshapeActive ? [b] : b === reshapeActive ? [a] : []
                )).has(c.id)
              : false;

            const isActive = (mode === 'flags' && c.id === activeClearingId) || isReshapeActive;
            const isPending = (mode === 'adjacency' && c.id === pendingEdgeFrom) || isReshapePending;
            const hasFlags = !!flags[c.id];
            const interactive = mode === 'flags' || mode === 'adjacency' || mode === 'reshape';
            // Reshape badge coloring — neighbors-in-any-pair share a single
            // green hue (the SVG layer below color-codes each pair distinctly).
            let bg;
            if (mode === 'reshape') {
              if (isReshapeActive) bg = 'rgba(232, 70, 70, 0.95)';
              else if (isReshapePending) bg = 'rgba(255, 215, 0, 0.95)';
              else if (isInAnyPair) bg = 'rgba(110, 200, 110, 0.95)';
              else if (isReshapeNeighbor) bg = 'rgba(180, 180, 180, 0.85)'; // unpaired neighbor → flooded
              else bg = 'rgba(245, 200, 80, 0.35)'; // unrelated clearing
            } else {
              bg = isPending
                ? 'rgba(232, 70, 70, 0.9)'
                : hasFlags && mode === 'flags'
                  ? 'rgba(110, 200, 110, 0.9)'
                  : 'rgba(245, 200, 80, 0.55)';
            }
            return (
              <div
                key={c.id}
                onClick={interactive ? (e) => { e.stopPropagation(); clickClearing(c.id); } : undefined}
                style={{
                  ...styles.clearingMarker,
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  background: bg,
                  outline: (isActive || isPending) ? '3px solid #1a1a1a' : 'none',
                  pointerEvents: interactive ? 'auto' : 'none',
                  cursor: interactive ? 'pointer' : 'default',
                }}
                title={`Clearing ${c.id}`}
              >
                {c.id}
              </div>
            );
          })}

          {/* Reshape edges — show the modified adjacency for the active
             flood-eligible clearing. Original edges incident to the active
             clearing are drawn faded gray (they'd be removed when flooded).
             Through-pairs are colored solid lines (matching their badge color).
             Flooded paths (neighbors not in any pair) are wavy dashed blue
             lines from the active clearing to the unpaired neighbor. */}
          {mode === 'reshape' && reshapeActive != null && (() => {
            const PAIR_COLORS = ['#6BBF59', '#5BB0E0', '#E07A6B', '#B86BE0', '#E0C36B', '#6BE0C3'];
            const cById = Object.fromEntries(map.clearings.map(c => [c.id, c]));
            const active = cById[reshapeActive];
            if (!active) return null;
            const neighbors = (map.adjacency ?? []).flatMap(([a, b]) =>
              a === reshapeActive ? [b] : b === reshapeActive ? [a] : []
            );
            const pairs = reshape[reshapeActive]?.through ?? [];
            const pairedSet = new Set(pairs.flat());
            const unpairedNeighbors = neighbors.filter(n => !pairedSet.has(n));
            return (
              <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                viewBox="0 0 100 100" preserveAspectRatio="none"
              >
                {/* Removed original edges (faint gray) */}
                {neighbors.map(n => {
                  const cn = cById[n]; if (!cn) return null;
                  return (
                    <line key={`rm-${n}`}
                      x1={active.x} y1={active.y} x2={cn.x} y2={cn.y}
                      stroke="rgba(150,150,150,0.4)" strokeWidth="2"
                      strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                  );
                })}
                {/* Flooded paths (blue wavy/dashed) */}
                {unpairedNeighbors.map(n => {
                  const cn = cById[n]; if (!cn) return null;
                  return (
                    <line key={`fp-${n}`}
                      x1={active.x} y1={active.y} x2={cn.x} y2={cn.y}
                      stroke="#1a8fd6" strokeWidth="6"
                      strokeDasharray="4 3" strokeLinecap="round"
                      vectorEffect="non-scaling-stroke" />
                  );
                })}
                {/* Through-pair edges (colored solid) */}
                {pairs.map(([a, b], i) => {
                  const ca = cById[a], cb = cById[b]; if (!ca || !cb) return null;
                  const color = PAIR_COLORS[i % PAIR_COLORS.length];
                  return (
                    <g key={`th-${i}`}>
                      <line x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                        stroke="#000" strokeWidth="8"
                        strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                      <line x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                        stroke={color} strokeWidth="5"
                        strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    </g>
                  );
                })}
              </svg>
            );
          })()}

          {/* Adjacency edges — drawn as SVG lines under the badges. Each edge
             is a black solid line with a white dashed overlay so it reads
             clearly against any map color (cartographic barber-pole look). */}
          {mode === 'adjacency' && (
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {edges.map(([a, b], i) => {
                const ca = map.clearings.find(c => c.id === a);
                const cb = map.clearings.find(c => c.id === b);
                if (!ca || !cb) return null;
                return (
                  <g key={i}>
                    <line
                      x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                      stroke="#000" strokeWidth="6"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    <line
                      x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                      stroke="#fff" strokeWidth="6"
                      strokeLinecap="butt"
                      strokeDasharray="6 6"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Ruins markers — actual ruin token, ringed in owning clearing color, labeled if set */}
          {mode === 'ruins' && ruins.map((r, i) => {
            const cid = nearestClearingId(map, r.x, r.y);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${r.x}%`,
                  top: `${r.y}%`,
                  width: `${ruinScale}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
                title={r.label ? `${r.label} -> clearing ${cid}` : `Ruin -> clearing ${cid}`}
              >
                <img
                  src="/icons/ruins/ruin.png"
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    display: 'block',
                    borderRadius: '50%',
                    boxShadow: `0 0 0 3px ${clearingColor(cid)}, 0 0 8px rgba(0,0,0,0.5)`,
                  }}
                />
                {r.label && (
                  <span style={styles.ruinLabel}>{r.label}</span>
                )}
              </div>
            );
          })}

          {/* Slots markers — color by owning clearing, square shape */}
          {mode === 'slots' && slots.map((s, i) => {
            const cid = nearestClearingId(map, s.x, s.y);
            return (
              <div
                key={i}
                style={{
                  ...styles.dotMarker,
                  borderRadius: 2,
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  background: clearingColor(cid),
                }}
                title={`Slot -> clearing ${cid}`}
              />
            );
          })}

          {/* Landmark slots — circular preview at authored scale, ringed by owning clearing */}
          {mode === 'landmarks' && landmarkSlots.map((s, i) => {
            const cid = nearestClearingId(map, s.x, s.y);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: `${landmarkScale}%`,
                  aspectRatio: '1 / 1',
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  background: clearingColor(cid),
                  opacity: 0.6,
                  border: '2px solid #1a1a1a',
                  boxShadow: '0 0 6px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#1a1a1a',
                }}
                title={`landmark slot -> clearing ${cid}`}
              />
            );
          })}

          {/* Cursor ghost for landmarks — shows scale + nearest-clearing color */}
          {mode === 'landmarks' && cursorPos && cursorOwnerId != null && (
            <div
              style={{
                position: 'absolute',
                left: `${cursorPos.x}%`,
                top: `${cursorPos.y}%`,
                width: `${landmarkScale}%`,
                aspectRatio: '1 / 1',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: clearingColor(cursorOwnerId),
                opacity: 0.35,
                border: '2px dashed #1a1a1a',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Cursor hint for slots: shows which clearing the click would assign to */}
          {mode === 'slots' && cursorPos && cursorOwnerId != null && (
            <div
              style={{
                ...styles.dotMarker,
                left: `${cursorPos.x}%`,
                top: `${cursorPos.y}%`,
                background: clearingColor(cursorOwnerId),
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Cursor ghost for ruins: live ruin image preview at cursor */}
          {mode === 'ruins' && cursorPos && cursorOwnerId != null && (
            <img
              src="/icons/ruins/ruin.png"
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                left: `${cursorPos.x}%`,
                top: `${cursorPos.y}%`,
                width: `${ruinScale}%`,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                boxShadow: `0 0 0 3px ${clearingColor(cursorOwnerId)}`,
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            />
          )}

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

          {/* Cursor ghost for floods */}
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

      <pre style={styles.json}>{
        mode === 'clearings' ? clearingsJson :
        mode === 'floods'    ? floodsJson    :
        mode === 'ruins'     ? ruinsJson     :
        mode === 'slots'     ? slotsJson     :
        mode === 'landmarks' ? landmarkSlotsJson :
        mode === 'adjacency' ? adjacencyJson :
        mode === 'reshape'   ? reshapeJson   :
                               flagsJson
      }</pre>
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
  flagsBar: { display: 'flex', gap: 16, alignItems: 'flex-start', marginTop: 8, flexWrap: 'wrap' },
  clearingChips: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  clearingChip: {
    width: 28, height: 28, borderRadius: '50%',
    border: '1.5px solid #bbb', background: '#fff',
    cursor: 'pointer', fontSize: 12, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  clearingChipActive: { borderColor: '#1a1a1a', borderWidth: 2 },
  clearingChipHasFlags: { background: 'rgba(110, 200, 110, 0.4)' },
  flagToggles: { display: 'flex', gap: 12, alignItems: 'center' },
  flagToggle: { fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' },
  canvasWrap: { background: '#222', padding: 8, borderRadius: 6 },
  canvas: { position: 'relative', display: 'inline-block' },
  img: { display: 'block', maxWidth: '100%', userSelect: 'none' },
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
  clearingMarker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: 24, height: 24, borderRadius: '50%',
    border: '2px solid #1a1a1a',
    color: '#1a1a1a',
    fontWeight: 700,
    fontSize: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 6px rgba(0,0,0,0.5)',
  },
  dotMarker: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    width: 16, height: 16, borderRadius: '50%',
    border: '2px solid #1a1a1a',
    boxShadow: '0 0 6px rgba(0,0,0,0.6)',
  },
  ruinLabel: {
    position: 'absolute',
    top: -6, right: -6,
    minWidth: 22, height: 22, borderRadius: '50%',
    padding: '0 5px',
    background: '#1a1a1a', color: '#fff',
    fontSize: 11, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid #fff',
    boxShadow: '0 0 4px rgba(0,0,0,0.6)',
  },
  json: {
    background: '#1a1a1a', color: '#d8d4c8',
    padding: 12, borderRadius: 6, marginTop: 12,
    fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
    fontSize: 12, overflowX: 'auto',
  },
};
