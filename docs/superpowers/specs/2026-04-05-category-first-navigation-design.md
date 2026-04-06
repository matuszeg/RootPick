# Category-First Navigation Restructure

**Date:** 2026-04-05
**Status:** Approved design, pending implementation

## Problem

The current UI splits configuration (SetupPanel) from results (result tabs) and puts pool management in a separate top-level tab. Users must mentally map between three disconnected areas that all deal with the same categories (Factions, Maps, Hirelings, Landmarks). The restructure unifies each category into a single tab that owns its filters, results, and pool management.

## Design

### Page Layout (top to bottom)

1. **Header** — wordmark, tagline, theme toggle (unchanged)
2. **Persistent bar** — player count, bots, Randomize, Undo, Share, Reset
3. **Error banner** — shown when randomization fails (unchanged)
4. **Category tabs** — Factions | Map & Cards | Hirelings | Landmarks
5. **Active tab content** — filters + sub-tabs (Results | Pool)
6. **Footer** (unchanged)

### Persistent Bar

Contains settings and actions that are cross-cutting (not specific to one category):

- **Player count** — buttons for 2-6, with reach goal label and info tooltip
- **Bots** — count selector (0 to 6-players). Only visible when a Clockwork expansion is enabled. Includes the activation/deactivation animation.
- **Randomize** button — generates all categories at once, same behavior as today
- **Undo** button — reverts last randomization
- **Share** button — copies share link
- **Reset** button — resets all settings

Layout: player count on the left, Randomize prominent in the center or spanning full width, Undo/Share/Reset as secondary buttons. Bots selector appears between player count and the action buttons when Clockwork is enabled.

### Category Tabs

Four top-level tabs: **Factions | Map & Cards | Hirelings | Landmarks**

- All four tabs are always rendered (never hidden)
- Tabs are greyed out / visually muted when their category has no active sources (e.g., Hirelings when no packs are checked, Landmarks when no sources are checked)
- Clicking a greyed-out tab still navigates to it — the filters within the tab let users enable sources
- Active tab has the existing gold underline treatment

### Tab Content Structure

Each category tab has the same two-part structure:

#### Filters Section

Always visible at the top of the tab. Contains category-specific configuration. Uses collapsible accordions for sections with many options.

**Factions filters:**
- Expansion checkboxes (Base, Riverfolk, Underworld, Marauder, Homeland, Clockwork, Clockwork 2)
- Game Balance radio (Balanced / Standard / Chaos Mode)
- Type Balance toggle (ensure militant + insurgent mix)
- Win Rate Filter toggle (avoid underdogs below 20% WR)
- Faction Difficulty pills (Beginner / Intermediate / Expert)
- Advanced (collapsible): custom min/max reach, allowed exclusion pairs

**Map & Cards filters:**
- Map boards checkboxes (Autumn/Winter always checked, Mountain/Lake, Marsh/Gorge)
- Map complexity pills (Beginner / Moderate / Complex)
- Deck accessory checkboxes (Exiles & Partisans deck, etc.)

**Hirelings filters:**
- Hireling pack checkboxes (Marauder Hirelings, Riverfolk Hirelings, Underworld Hirelings, Homeland Hirelings)
- Description text about hireling rules

**Landmarks filters:**
- Landmark source checkboxes (Landmarks Pack, Underworld Landmarks, Homeland Landmarks)
- Landmarks in play count (Off / 1 / 2)

#### Sub-tabs: Results | Pool

A secondary tab row below the filters, toggling between two views:

**Results sub-tab:**
- Shows the randomized picks for this category
- Per-card actions (lock, re-roll, ban) unchanged
- Category-specific re-roll-all button where applicable ("Re-roll unlocked" for factions, "Re-roll all hirelings", "Re-roll all landmarks")
- Empty state when nothing has been randomized yet
- **Factions Results** includes the Reach Summary banner at the top
- **Factions Results** shows vagabond character assignment on faction cards (unchanged)

**Pool sub-tab:**
- The exclusion list for this category — same UI as current ManagePool sub-tabs
- Click items to include/exclude from the randomization pool
- **Factions Pool** includes both the faction exclusion list (Militants / Insurgents / Bots sections) AND a Vagabond Characters section below it for character exclusions

### Greyed-Out Tab Behavior

When a category tab is greyed out:
- The tab label is visually muted (reduced opacity or desaturated)
- Clicking it navigates to the tab normally
- The filters section shows the relevant checkboxes so users can enable sources
- The Results sub-tab shows a contextual empty state (e.g., "No hireling packs enabled. Check one above to include hirelings in your session.")
- The Pool sub-tab shows a similar message

A tab becomes active (un-greyed) when at least one source is enabled:
- **Hirelings**: any hireling pack checked in ownedAccessories
- **Landmarks**: any landmark source checked in ownedAccessories AND useLandmarks is true (landmark count > 0)
- **Map & Cards**: always active (base maps are always available)
- **Factions**: always active (base game is always enabled)

### Mobile Layout

- The persistent bar stacks vertically: player count row, then Randomize button, then Undo/Share/Reset row
- Category tabs scroll horizontally if needed
- Filters section is collapsible on mobile (tap to expand/collapse), collapsed by default after first randomization
- Sub-tabs (Results | Pool) remain as tabs

### Components Affected

**Removed/replaced:**
- `SetupPanel.jsx` — contents distribute into category tab filter sections and the persistent bar
- `ManagePool.jsx` as a standalone component — its sub-tab contents move into each category's Pool sub-tab

**New components:**
- `PersistentBar.jsx` — player count, bots, action buttons
- `CategoryTabs.jsx` — top-level tab navigation
- `FactionsTab.jsx` — factions filters + Results/Pool sub-tabs
- `MapCardsTab.jsx` — map & cards filters + Results/Pool sub-tabs
- `HirelingsTab.jsx` — hirelings filters + Results/Pool sub-tabs
- `LandmarksTab.jsx` — landmarks filters + Results/Pool sub-tabs

**Unchanged:**
- `FactionCard.jsx`, `MapCard.jsx`, `DeckCard.jsx`, `HirelingCard.jsx`, `LandmarkCard.jsx`
- `BoardModal.jsx`
- `ReachSummary.jsx` (moves into Factions Results)
- `useAppState.js` — no state model changes needed
- All data files (`factions.js`, `maps.js`, `accessories.js`, `winRates.js`)
- `Icons.jsx`, `DieIcon.jsx`, `LockIcon.jsx`, `FactionIcon.jsx`

### What Goes Away

- The SetupPanel sidebar layout
- The "Game Setup | Manage Pool" top-level tab switcher
- The "Factions | Map & Deck | Hirelings | Landmarks" result sub-tabs
- The mobile "Settings" collapsible drawer (replaced by per-tab filters)
- References in ManagePool to "use Settings to configure" (filters are now in the same tab)

### State Changes

No changes to the useAppState data model. The only new UI state:
- `activeCategory` — which top-level tab is selected (`'factions' | 'map' | 'hirelings' | 'landmarks'`)
- `activeSubTab` — per-category sub-tab state (`'results' | 'pool'`). Each category remembers its own sub-tab independently, so switching from Factions Pool to Hirelings shows Hirelings Results (not Hirelings Pool)
- Remove `viewMode` ('pick' | 'manage') — no longer needed
- Remove `resultTab` — replaced by `activeCategory`
