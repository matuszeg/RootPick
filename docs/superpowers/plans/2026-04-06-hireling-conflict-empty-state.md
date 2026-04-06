# Hireling Conflict Empty State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When all hirelings in the active pool are conflict-excluded due to factions in play, show a specific explanation in the Results tab instead of the generic "no hirelings picked yet" message.

**Architecture:** Extract a `getHirelingConflicts` utility into `src/data/accessories.js` as the single source of truth for faction-conflict detection. Refactor the existing inline conflict logic in `pickRandomHirelings` to use it. Use it again in `HirelingsTab` to drive the new empty state branch.

**Tech Stack:** React 18, plain JS (no TypeScript), single-file CSS at `src/index.css`.

---

## File Map

| File | Change |
|------|--------|
| `src/data/accessories.js` | Add `import { FACTION_MAP }` at top; add exported `getHirelingConflicts` function at bottom |
| `src/hooks/useAppState.js` | Add `getHirelingConflicts` to accessories import; refactor conflict check in `pickRandomHirelings` |
| `src/components/HirelingsTab.jsx` | Add `getHirelingConflicts` import; compute conflict state at top of component; update Results empty state JSX |
| `src/index.css` | Add `.hireling-conflict-list` style |

---

## Task 1: Add `getHirelingConflicts` to `src/data/accessories.js`

**Files:**
- Modify: `src/data/accessories.js`

- [ ] **Step 1: Add the `FACTION_MAP` import at the top of the file**

`src/data/accessories.js` currently has no imports (line 1 begins with `// ─── Decks`). Add this as the very first line:

```js
import { FACTION_MAP } from './factions.js';
```

- [ ] **Step 2: Add `getHirelingConflicts` after the existing exports at the bottom of the file**

Append after the existing export on line 310 (`export const CHARACTER_MAP = ...`):

```js
// Returns [{ hireling, factionName }] for each hireling in availableHirelings
// that is excluded due to a faction conflict with the current game.
// Handles bot factions by expanding them to the human faction they automate.
// selectedFactionIds may be an Array or Set of faction ID strings.
export function getHirelingConflicts(availableHirelings, selectedFactionIds) {
  const expandedFactions = new Set(selectedFactionIds);
  for (const id of selectedFactionIds) {
    const automatesId = FACTION_MAP[id]?.automatesId;
    if (automatesId) expandedFactions.add(automatesId);
  }

  return availableHirelings
    .map(h => {
      const matchedId = h.associatedFactions.find(id => expandedFactions.has(id));
      if (!matchedId) return null;
      return { hireling: h, factionName: FACTION_MAP[matchedId]?.name ?? matchedId };
    })
    .filter(Boolean);
}
```

- [ ] **Step 3: Start the dev server and verify no import errors**

```bash
npm run dev
```

Open the browser console. Expected: no errors about `FACTION_MAP` or circular imports.

- [ ] **Step 4: Commit**

```bash
git add src/data/accessories.js
git commit -m "feat: add getHirelingConflicts utility to accessories"
```

---

## Task 2: Refactor `pickRandomHirelings` to use `getHirelingConflicts`

**Files:**
- Modify: `src/hooks/useAppState.js:6-8` (imports), `src/hooks/useAppState.js:26-45` (function body)

- [ ] **Step 1: Add `getHirelingConflicts` to the accessories import**

Find the existing import at the top of `useAppState.js`:

```js
import {
  DECKS, HIRELING_SETS, LANDMARKS, VAGABOND_CHARACTERS,
} from '../data/accessories.js';
```

Replace with:

```js
import {
  DECKS, HIRELING_SETS, LANDMARKS, VAGABOND_CHARACTERS, getHirelingConflicts,
} from '../data/accessories.js';
```

- [ ] **Step 2: Refactor the conflict check inside `pickRandomHirelings`**

Find the current `pickRandomHirelings` function body (lines 26–51). The section to replace is the bot-expansion block and the `h.associatedFactions.some(...)` check inside the filter:

```js
  // Build expanded faction set: direct IDs + human faction IDs automated by any selected bot
  const expandedFactions = new Set(selectedFactionIds);
  for (const id of selectedFactionIds) {
    const automatesId = FACTION_MAP[id]?.automatesId;
    if (automatesId) expandedFactions.add(automatesId);
  }

  const eligible = HIRELING_SETS.filter(h => {
    if (lockedSet.has(h.id)) return false;
    if (excludedHirelings.has(h.id)) return false;
    if (bannedHirelings.has(h.id)) return false;
    if (!ownedAccessories.has(h.source)) return false;
    // Exclude hirelings whose associated faction is in the current game
    if (h.associatedFactions.some(id => expandedFactions.has(id))) return false;
    return true;
  });
```

Replace with:

```js
  const availableForPicking = HIRELING_SETS.filter(h => ownedAccessories.has(h.source));
  const conflictedIds = new Set(
    getHirelingConflicts(availableForPicking, selectedFactionIds).map(c => c.hireling.id)
  );

  const eligible = HIRELING_SETS.filter(h => {
    if (lockedSet.has(h.id)) return false;
    if (excludedHirelings.has(h.id)) return false;
    if (bannedHirelings.has(h.id)) return false;
    if (!ownedAccessories.has(h.source)) return false;
    if (conflictedIds.has(h.id)) return false;
    return true;
  });
```

- [ ] **Step 3: Verify `FACTION_MAP` is no longer used directly in `pickRandomHirelings`**

After the replacement, `FACTION_MAP` is still imported in `useAppState.js` for other uses (e.g. bot expansion elsewhere in the file). Do not remove the `FACTION_MAP` import — just confirm the function no longer references it directly for conflict checking.

- [ ] **Step 4: Test randomization still works**

In the running dev server:
1. Enable any hireling pack.
2. Click Randomize. Confirm hirelings are picked as before.
3. Play a base game session with Marauder Expansion hirelings only. Confirm the randomizer still returns 0 hirelings (they should all conflict).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAppState.js
git commit -m "refactor: use getHirelingConflicts in pickRandomHirelings"
```

---

## Task 3: Update `HirelingsTab` Results empty state

**Files:**
- Modify: `src/components/HirelingsTab.jsx`
- Modify: `src/index.css`

- [ ] **Step 1: Add `getHirelingConflicts` to the import in `HirelingsTab.jsx`**

Find the existing import at line 1:

```js
import { ACCESSORIES, HIRELING_SETS } from '../data/accessories.js';
```

Replace with:

```js
import { ACCESSORIES, HIRELING_SETS, getHirelingConflicts } from '../data/accessories.js';
```

- [ ] **Step 2: Compute conflict state at the top of the component body**

In the `HirelingsTab` component function, after the existing derived values:

```js
const canUseHirelings = HIRELING_SETS.some(h => ownedAccessories.has(h.source));
const availableAccessories = ACCESSORIES.filter(a => a.category === 'hireling');
const availableHirelings = HIRELING_SETS.filter(h => ownedAccessories.has(h.source));
```

Add two more lines immediately after:

```js
const hirelingConflicts = getHirelingConflicts(availableHirelings, state.selectedFactions);
const allHirelingsConflicted = availableHirelings.length > 0 && hirelingConflicts.length === availableHirelings.length;
```

- [ ] **Step 3: Update the Results empty state JSX**

Find the current empty state block inside `{subTab === 'results' && ...}`:

```jsx
          {selectedHirelings.length > 0 ? (
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
          ) : (
            <div className="tab-empty-state">
              {canUseHirelings ? (
                <>
                  <p>No hirelings picked yet.</p>
                  <p className="tab-empty-sub">Hit Re-roll above or Randomize to get started.</p>
                </>
              ) : (
                <>
                  <p>No hireling packs enabled.</p>
                  <p className="tab-empty-sub">Check a pack above to include hirelings in your session.</p>
                </>
              )}
            </div>
          )}
```

Replace with:

```jsx
          {selectedHirelings.length > 0 ? (
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
          ) : (
            <div className="tab-empty-state">
              {canUseHirelings ? (
                allHirelingsConflicted ? (
                  <>
                    <p>All hirelings in your pool are associated with factions in this game.</p>
                    <ul className="hireling-conflict-list">
                      {hirelingConflicts.map(({ hireling, factionName }) => (
                        <li key={hireling.id}>{hireling.promoted} — {factionName} in play</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <p>No hirelings picked yet.</p>
                    <p className="tab-empty-sub">Hit Re-roll above or Randomize to get started.</p>
                  </>
                )
              ) : (
                <>
                  <p>No hireling packs enabled.</p>
                  <p className="tab-empty-sub">Check a pack above to include hirelings in your session.</p>
                </>
              )}
            </div>
          )}
```

- [ ] **Step 4: Add `.hireling-conflict-list` to `src/index.css`**

Find an appropriate place in `index.css` near other `.tab-empty-state` styles. Add:

```css
.hireling-conflict-list {
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
  opacity: 0.8;
  text-align: left;
}
.hireling-conflict-list li {
  padding: 0.15rem 0;
}
```

- [ ] **Step 5: Verify the conflict message in the browser**

1. Enable only "Marauder Expansion" hirelings.
2. Ensure only base game factions are active (Marquise, Eyrie, Woodland Alliance, Vagabond all in pool).
3. Click Randomize.
4. Open the Hirelings tab → Results sub-tab.
5. Expected: conflict message listing all 4 Marauder hirelings, each showing the faction in play.
6. Now also enable the Marauder Hirelings Pack (which includes Popular Band, which has no associated faction).
7. Click Randomize again.
8. Expected: "No hirelings picked yet" message (Popular Band is eligible, so the pool isn't fully exhausted, so the conflict message should NOT appear).

- [ ] **Step 6: Commit**

```bash
git add src/components/HirelingsTab.jsx src/index.css
git commit -m "feat: show hireling conflict explanation when pool is fully exhausted"
```
