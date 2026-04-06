# Hireling Conflict Empty State

**Date:** 2026-04-06
**Status:** Approved

## Problem

When a user enables only the Marauder Expansion hirelings and plays a Base Game session, all four Marauder hirelings are excluded because their associated factions (Marquise, Eyrie, Woodland Alliance, Vagabond) are all in play. The randomizer picks 0 hirelings, but the Results tab shows the generic "No hirelings picked yet — Hit Re-roll above or Randomize to get started" message, which is misleading. The user has no idea why hirelings are missing.

This same situation can occur with any single hireling pack if the current faction pool happens to cover all of that pack's associated factions.

## Goal

When the hireling pool is completely exhausted due to faction conflicts, replace the generic empty state message in the Results tab with a specific explanation listing each conflicted hireling and the faction causing the conflict.

## Design

### 1. New utility: `getHirelingConflicts` in `src/data/accessories.js`

```js
// Returns [{ hireling, factionName }] for each hireling excluded due to faction conflict.
export function getHirelingConflicts(availableHirelings, selectedFactionIds) { ... }
```

- **Input:** `availableHirelings` — hirelings from enabled packs (already filtered by `ownedAccessories`); `selectedFactionIds` — array or Set of faction IDs currently in the game.
- **Bot expansion:** Before checking conflicts, expand the faction set to include the human faction that each selected bot automates (same logic as `pickRandomHirelings`). This ensures bot factions correctly trigger their associated hireling conflicts.
- **Output:** Array of `{ hireling, factionName }` — one entry per hireling whose `associatedFactions` overlaps the expanded faction set. When a hireling lists multiple associated factions (e.g. The Exile associates with both `vagabond1` and `vagabond2`), `factionName` is the name of the first matching faction that is actually in play.
- **Exported** so both `useAppState.js` and `HirelingsTab.jsx` can import it without duplication.

### 2. Refactor `pickRandomHirelings` in `src/hooks/useAppState.js`

Replace the inline `h.associatedFactions.some(...)` conflict check with a call to `getHirelingConflicts`. Behaviour is identical; logic now lives in one place.

### 3. Updated empty state in `src/components/HirelingsTab.jsx`

**Condition to show conflict message:**
`canUseHirelings && selectedHirelings.length === 0 && availableHirelings.length > 0 && conflicts.length === availableHirelings.length`

That is: packs are enabled, no hirelings were picked, hirelings exist in the pool, and *all* of them are conflict-excluded.

**Message:**
```
All hirelings in your pool are associated with factions in this game.

• Forest Patrol — Marquise de Cat in play
• Last Dynasty — Eyrie Dynasties in play
• Spring Uprising — Woodland Alliance in play
• The Exile — Vagabond in play
```

**When the condition is NOT met** (partial conflict or pool is fine), the existing "No hirelings picked yet" message is shown unchanged. The conflict message only surfaces when the pool is completely exhausted — partial conflicts don't prevent randomization.

## Files Changed

| File | Change |
|------|--------|
| `src/data/accessories.js` | Add exported `getHirelingConflicts` utility |
| `src/hooks/useAppState.js` | Refactor `pickRandomHirelings` to use `getHirelingConflicts` |
| `src/components/HirelingsTab.jsx` | Add conflict-exhausted empty state branch in Results sub-tab |

## Out of Scope

- Pool tab changes (showing conflict badges on individual hireling cards)
- Any change to how hirelings are randomized
- Any change to the filter/exclude UI
