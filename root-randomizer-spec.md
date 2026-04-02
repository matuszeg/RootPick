# Root Faction Randomizer — Claude Code Spec

## Project Overview

A web app that helps Root board game players pick compatible faction combinations for their session. Inspired by dominionrandomizer.com but purpose-built for Root's unique compatibility system (Reach values, faction type balance, mutual exclusions, and expansion ownership).

**Name:** RootPick
**URL:** rootpick.app

**Tech stack:** React + Vite, single-page app deployable to GitHub Pages or Netlify. No backend needed — all logic is client-side.

---

## Core Data Layer

All data should be hardcoded as a JS/TS constant. Here is the complete faction dataset:

```js
const FACTIONS = [
  // BASE GAME
  { id: "marquise",   name: "Marquise de Cat",       reach: 10, type: "militant",  expansion: "base",       difficulty: 1, vagabondVariant: false, excludes: [] },
  { id: "eyrie",      name: "Eyrie Dynasties",        reach: 7,  type: "militant",  expansion: "base",       difficulty: 2, vagabondVariant: false, excludes: [] },
  { id: "alliance",   name: "Woodland Alliance",      reach: 3,  type: "insurgent", expansion: "base",       difficulty: 2, vagabondVariant: false, excludes: [] },
  { id: "vagabond1",  name: "Vagabond",               reach: 5,  type: "insurgent", expansion: "base",       difficulty: 2, vagabondVariant: true,  excludes: ["knaves"] },

  // RIVERFOLK EXPANSION
  { id: "riverfolk",  name: "Riverfolk Company",      reach: 5,  type: "insurgent", expansion: "riverfolk",  difficulty: 3, vagabondVariant: false, excludes: [] },
  { id: "lizard",     name: "Lizard Cult",            reach: 2,  type: "insurgent", expansion: "riverfolk",  difficulty: 3, vagabondVariant: false, excludes: [] },
  { id: "vagabond2",  name: "Vagabond (2nd)",         reach: 2,  type: "insurgent", expansion: "riverfolk",  difficulty: 2, vagabondVariant: true,  excludes: ["knaves"] },

  // UNDERWORLD EXPANSION
  { id: "duchy",      name: "Underground Duchy",      reach: 8,  type: "militant",  expansion: "underworld", difficulty: 2, vagabondVariant: false, excludes: [] },
  { id: "corvid",     name: "Corvid Conspiracy",      reach: 3,  type: "insurgent", expansion: "underworld", difficulty: 3, vagabondVariant: false, excludes: [] },

  // MARAUDER EXPANSION
  { id: "hundreds",   name: "Lord of the Hundreds",   reach: 9,  type: "militant",  expansion: "marauder",   difficulty: 1, vagabondVariant: false, excludes: [] },
  { id: "keepers",    name: "Keepers in Iron",        reach: 8,  type: "militant",  expansion: "marauder",   difficulty: 3, vagabondVariant: false, excludes: [] },

  // HOMELAND EXPANSION
  { id: "lilypad",    name: "Lilypad Diaspora",       reach: 7,  type: "militant",  expansion: "homeland",   difficulty: 2, vagabondVariant: false, excludes: [] },
  { id: "twilight",   name: "Twilight Council",       reach: 5,  type: "insurgent", expansion: "homeland",   difficulty: 2, vagabondVariant: false, excludes: [] },
  { id: "knaves",     name: "Knaves of the Deepwood", reach: 4,  type: "insurgent", expansion: "homeland",   difficulty: 2, vagabondVariant: false, excludes: ["vagabond1","vagabond2"] },
];

const EXPANSIONS = [
  { id: "base",        name: "Base Game",            required: true },
  { id: "riverfolk",   name: "Riverfolk Expansion",  required: false },
  { id: "underworld",  name: "Underworld Expansion", required: false },
  { id: "marauder",    name: "Marauder Expansion",   required: false },
  { id: "homeland",    name: "Homeland Expansion",   required: false },
];

// Minimum total Reach required per player count (from Law of Root)
const REACH_MINIMUMS = { 2: 17, 3: 18, 4: 21, 5: 25, 6: 28 };
```

**Difficulty key:** 1 = beginner-friendly, 2 = intermediate, 3 = complex/expert

**Vagabond rule:** Only one vagabond-variant faction can be in a game. A second Vagabond (vagabond2) can only appear if the Riverfolk expansion is owned AND both players want the double-vagabond variant. Knaves of the Deepwood mutually excludes all vagabond variants.

**Faction flavor/strategy notes (hardcode these onto each card):**
- Marquise de Cat: "Builds an industrial engine across the forest. Great for new players."
- Eyrie Dynasties: "Follows a growing Decree. Powerful but risks turmoil if overextended."
- Woodland Alliance: "Starts slow, then explodes. Punishes players who ignore them."
- Vagabond: "A lone adventurer who plays all sides. Flexible and relationship-driven."
- Riverfolk Company: "Sells services to other players. Thrives on other factions' activity."
- Lizard Cult: "Converts discarded cards into followers. Strange, slow, and sneaky."
- Underground Duchy: "Tunnels everywhere. Builds a powerful minister engine over time."
- Corvid Conspiracy: "Places hidden plot tokens. High risk, high chaos."
- Lord of the Hundreds: "Pure aggression. Loots, burns, and dominates. Easy to learn."
- Keepers in Iron: "Recovers ancient relics. The most complex faction in the game."
- Lilypad Diaspora: "Spreads across water. Militant but elusive." *(confirm details when Homeland releases fully)*
- Twilight Council: "Diplomatic and flexible. Gains power through deals." *(confirm details)*
- Knaves of the Deepwood: "Opportunistic rogues. Cannot play alongside the Vagabond." *(confirm details)*

---

## UI Layout & Features

### Section 1 — Setup Panel

**Expansions You Own**
- Checkbox row for each expansion
- Base Game is always checked and disabled (can't uncheck it)
- Checking an expansion makes its factions available in the pool
- Persist these selections to localStorage so they're remembered between sessions

**Player Count**
- Segmented button or large toggle: 2 / 3 / 4 / 5 / 6
- Show a dynamic label: "Minimum Reach needed: 21" that updates live
- Persist to localStorage

**Compatibility Strictness**
- A two-mode toggle (not a continuous slider — simpler and clearer):
  - **Strict** — uses the official reach minimums from the table above
  - **Adventurous** — uses a flat minimum of 17 for any player count (Leder's official "anything goes" threshold)
- Show a one-line description under the toggle explaining what each mode means
- Default to Strict

**Faction Type Balance**
- Checkbox: "Require at least one Militant and one Insurgent"
- Default: ON
- Show a tooltip or info icon explaining: "Militants control territory from the start. Insurgents disrupt and explode late. A mix makes for a more dynamic game."

**Difficulty Filter**
- Three pill/chip toggles: ⭐ Beginner / ⭐⭐ Intermediate / ⭐⭐⭐ Expert
- Multi-select, default all ON
- Turning off Expert removes Lizard Cult, Riverfolk Company, Corvid Conspiracy, and Keepers in Iron from the pool
- Useful for sessions with newer players

---

### Section 2 — Faction Result Cards (main content area)

After randomizing, display N cards (one per player) in a responsive grid.

Each card displays:
- Faction name (large)
- Expansion source (small badge, e.g. "Marauder")
- Type badge: **MILITANT** (warm red/orange) or **INSURGENT** (cool green/teal)
- Reach value (prominent number)
- Difficulty: shown as 1–3 stars
- 1-sentence strategy flavor note (from the list above)

**Per-card action buttons:**
- 🔒 **Lock** — this faction stays when re-rolling; button toggles to show locked state visually
- 🔄 **Re-roll** — replace just this one faction with a new valid pick from the remaining pool
- 🚫 **Ban** — permanently remove this faction from the pool for this session (moves it to the Banned panel)

**Reach summary bar (above or below the cards):**
- Shows: "Total Reach: 23 / 21 needed ✅" or "Total Reach: 14 / 21 needed ❌"
- Green when valid, red when below threshold
- Also show: "Militants: 2 / Insurgents: 2" type breakdown

---

### Section 3 — Action Bar

- **🎲 Randomize** — primary CTA button, generates a completely new valid combination respecting all current settings
- **🔁 Re-roll Unlocked** — re-rolls only the factions not currently locked
- **↩️ Undo** — reverts to the previous combination (store last 5 states in memory)
- **🔗 Share** — encodes the current combination + all settings into URL query params, copies to clipboard, shows a brief "Copied!" confirmation

---

### Section 4 — Banned Factions Panel

- Collapsible section below the main cards
- Shows banned factions as dismissible chips/tags
- Click X on a chip to unban and return it to the pool
- If empty, hide the panel entirely

---

## Randomizer Logic (implement in this order)

```
function generateCombination(settings):
  1. Build pool: factions where expansion is owned AND not banned AND difficulty matches filter
  2. Start with locked factions as already-selected
  3. Check mutual exclusions: if a locked faction excludes others, remove those from pool
  4. Randomly fill remaining slots from pool (playerCount - lockedCount slots to fill)
  5. Check reach: sum of all selected factions >= threshold for current mode + player count
  6. Check type balance (if enabled): at least 1 militant and 1 insurgent in final set
  7. If checks fail, retry up to 100 times with different random picks
  8. If still no valid combo after 100 tries, return an error state
```

**Error message when no valid combo exists:**
> "No valid combination found with your current settings. Try owning more expansions, relaxing the strictness, or turning off the type balance requirement."

---

## URL Sharing Format

Encode the following into URL query params:
- `expansions` — comma-separated owned expansion IDs (e.g. `base,riverfolk,marauder`)
- `players` — player count (e.g. `4`)
- `strict` — `true` or `false`
- `balance` — `true` or `false`
- `difficulty` — comma-separated enabled levels (e.g. `1,2,3`)
- `factions` — comma-separated faction IDs in the current result (e.g. `marquise,eyrie,alliance,vagabond1`)
- `locked` — comma-separated locked faction IDs
- `banned` — comma-separated banned faction IDs

On page load, read these params and restore state from them. This allows sharing a specific combo with your group.

---

## Stretch Goals (implement after core is working)

- **Session History** — remember last 5 combinations in localStorage, show as a collapsible log
- **Map Selector** — dropdown for Autumn / Winter / Lake / Mountain; show a note if a faction is known to be weak/strong on that map
- **Hireling Randomizer** — if Marauder is owned, optional toggle to randomly add 1–2 hirelings to the session (separate randomization pool)
- **"2-Player Mode" advisory** — when player count = 2, show a note recommending hirelings and explaining that high-reach factions are especially important
- **Dark mode** — toggle in the header

---

## Visual Design Direction

- **Color palette:** Earthy, woodland tones. Deep forest green, warm brown, amber/gold accents. Avoid generic tech blues.
- **Faction type colors:** Militant = warm red/terracotta. Insurgent = deep teal/forest green.
- **Typography:** Something slightly rustic but readable. A serif or semi-serif for headers, clean sans for body.
- **Cards:** Rounded corners, subtle shadow, compact but readable. Not a flat list — actual cards.
- **Mobile-first:** This will primarily be used at a table on a phone. Design for small screen first, desktop second.
- **Vibe:** Whimsical but not childish. Think the Kyle Ferrin illustration style — cute animals waging serious war.

---

## What NOT to Build

- No user accounts or authentication
- No backend or database of any kind
- No Clockwork bot factions (separate play mode, not faction selection)
- No real-time multiplayer (URL sharing is sufficient)
- No ads or tracking

---

## Kickoff Prompt for Claude Code

Paste this at the start of your Claude Code session along with this file:

> "Read `root-randomizer-spec.md` and build the web app described in it. Use React + Vite. Use the complete faction data from the spec. Make it mobile-friendly. Start by scaffolding the project, then implement the data layer and randomizer logic, then build the UI. The app is called RootPick and the URL is rootpick.app — use that name and URL throughout."
