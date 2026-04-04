# RootPick — Claude Context

RootPick is a faction randomizer for the Root board game by Leder Games. It helps players pick a balanced set of factions for a session. React + Vite SPA, deployed to GitHub Pages, no backend, all state is client-side.

## Tech Stack

- React 18 + Vite
- Single-file CSS (`src/index.css`) — no CSS modules or Tailwind
- State managed in `src/hooks/useAppState.js` with `useState` + `useCallback`, persisted to localStorage
- Deployed to GitHub Pages via `npm run deploy`
- `refs/` folder contains rulebook PDFs (readable with the Read tool + pages param)

## Root Game Domain Knowledge

Root is an asymmetric board game. Each player controls a different faction with unique rules.

**Expansions** unlock new factions, maps, and accessories. The expansions are:
- `base` — always required
- `riverfolk` — adds Riverfolk Company, Lizard Cult, Vagabond (2nd)
- `underworld` — adds Underground Duchy, Corvid Conspiracy
- `marauder` — adds Lord of the Hundreds, Keepers in Iron, hireling rules
- `homeland` — adds Lilypad Diaspora, Twilight Council, Knaves of the Deepwood
- `clockwork` — adds 4 bot factions (automated versions of base game factions)
- `clockwork2` — adds more bot factions (require their source expansion too)

**Reach** is a balance metric. Higher reach = faction can compete from turn 1. The game has minimum total reach requirements per player count to ensure fair games.

**Faction types**: `militant` (territorial, starts strong) and `insurgent` (disruptive, grows over time). A good game mix has at least one of each.

**Bots** (`isBot: true`) are automated factions from the Clockwork expansions. They fill a seat without a human player. Bot factions each `exclude` their human equivalent (can't have Marquise + Mechanical Marquise).

**Vagabond** (`vagabondVariant: true`) is a special faction. Multiple vagabond variants can coexist. Each vagabond gets a randomly assigned character card (Ranger, Tinker, etc.). `vagabond2` requires the Riverfolk expansion.

**Hirelings** are neutral helper factions that rotate between players during the game. The hireling rules come from the Marauder expansion, but hireling card packs are sold separately. You can use any hireling pack without owning the Marauder expansion — the Marauder expansion is only required to add the Marauder hireling set specifically.

**Landmarks** are special board tiles. The rules and cards are in the standalone Landmarks Pack accessory — NOT in the Underworld expansion. Don't gate landmark functionality on Underworld being checked.

## The Intent/Not-Inventory Rule ⚠️

**This is the most important design principle in the codebase.**

The expansion checkboxes in SetupPanel mean **"include this content in my current session"**, not **"I own this expansion"**. A user might own Marauder but not want Marauder factions in this game — they'd leave it unchecked.

Consequences:
- Don't gate standalone accessories (hireling packs, landmarks pack) on an expansion being checked unless that accessory physically requires that expansion to function
- `canUseHirelings` is true if ANY hireling source is active (any pack checked or Marauder checked), not just when Marauder is checked
- `canUseLandmarks` is true only when `landmarks_pack` is in `ownedAccessories`, NOT when Underworld is checked
- `marauder_hirelings` accessory has `requiresExpansion: null` — it appears in the list always, not just when Marauder is checked
- When in doubt: ask whether the feature physically requires the expansion, or just happens to be themed around it

## Data Model

### `src/data/factions.js`
- `FACTIONS` — array of all faction objects
- `FACTION_MAP` — `{ id: faction }` lookup
- `EXPANSIONS` — array of expansion definitions (base is `required: true`)
- `REACH_MINIMUMS` — `{ playerCount: minReach }` for balanced mode

Faction object shape:
```js
{
  id, name, reach, type,         // 'militant' | 'insurgent'
  expansion,                      // which expansion unlocks it
  requiresExpansion,              // some clockwork2 bots need their source expansion too
  difficulty,                     // 1 | 2 | 3
  vagabondVariant,                // true for vagabond factions
  excludes,                       // array of faction IDs that can't play alongside this one
  color,                          // hex, used for card headers and accents
  isBot,                          // true for Clockwork bots
  automatesId,                    // which human faction this bot replaces
  flavor,                         // description text
}
```

### `src/data/maps.js`
- `MAPS` — array of map objects (`id`, `name`, `expansion`, `difficulty` 1-3, `factionNotes`)
- `MAP_MAP` — `{ id: map }` lookup
- `MAP_COLORS` — `{ mapId: { primary, secondary } }` hex colors for UI accents

### `src/data/accessories.js`
- `ACCESSORIES` — decks, vagabond pack, landmarks pack, hireling packs
  - `requiresExpansion` means the accessory only shows in the UI when that expansion is checked
  - `marauder_hirelings` has `requiresExpansion: null` — always visible
- `HIRELING_SETS` — individual hireling cards with `source` (the accessory or expansion that provides them)
- `CHARACTER_MAP` — vagabond character cards

### `src/data/winRates.js`
- Community win rate data from Woodland Warriors Discord spreadsheet
- Only 3p/4p/5p data exists — **no 2p data**
- `getWinRate(factionId, playerCount)` returns `{ wr, n, playerCountSpecific } | null`
- Returns `null` if fewer than 50 recorded games (not statistically reliable)

## Component Overview

| Component | Purpose |
|-----------|---------|
| `App.jsx` | Root component, tab switching (Game Setup / Manage Pool), renders result sections |
| `SetupPanel.jsx` | Left sidebar with all settings — expansions, players, balance, difficulty, bots, maps, add-ons, advanced |
| `FactionCard.jsx` | Individual faction result card with lock/reroll/ban actions |
| `ManagePool.jsx` | "Manage Pool" tab — 5 sub-tabs (Factions, Maps, Hirelings, Characters, Landmarks) for excluding individual items |
| `ReachSummary.jsx` | Shows total reach, balance signal, and whether the combination meets the threshold |
| `ActionBar.jsx` | Randomize / Undo / Share buttons |
| `MapCard.jsx`, `DeckCard.jsx`, `HirelingCard.jsx`, `LandmarkCard.jsx` | Result cards for non-faction items |

## State Shape (useAppState.js)

Key state fields:
- `ownedExpansions` — Set of expansion IDs checked as active for this session
- `ownedAccessories` — Set of accessory IDs (decks, packs) checked as active
- `bannedFactions` — Set of faction IDs excluded from the pool (via Manage Pool)
- `excludedMaps/Hirelings/Characters/Landmarks` — Sets of excluded item IDs
- `lockedFactions` — Set of faction IDs that won't be replaced on re-roll
- `selectedFactions` — ordered array of currently selected faction IDs
- `vagabondCharacters` — `{ factionId: characterId }` map
- `playerCount`, `botCount` — human and bot player counts
- `balanceMode` — `'balanced' | 'standard' | 'chaos'`
- `difficulties` — Set of difficulty levels (1/2/3) included in the pool
- `mapDifficulties` — Set of map complexity levels included
- `avoidUnderdogs` — boolean, excludes factions with WR < 20% (requires ≥50 games)
- `useHirelings`, `useLandmarks`, `landmarkCount` — hireling/landmark session toggles

## Key Behaviours to Know

**Re-roll single faction**: Replaces one faction slot with a randomly drawn replacement. The current faction is excluded from being its own replacement (fixed bug). If no replacement exists, shows an error — the Re-roll button is disabled when the pool has no eligible replacements.

**Bots**: Bot slots are filled separately from human slots. A bot faction excludes its human equivalent. Clockwork2 bots also require their source expansion to be checked.

**Vagabond exclusions**: Knaves of the Deepwood cannot play alongside any Vagabond. `allowedExclusions` in Advanced settings can override this.

**Balance mode**: Balanced uses official reach minimums per player count. Standard uses a flat 17. Chaos uses 0. Custom min/max reach can override in Advanced.

**Win rates**: Used for display only and the "avoid underdogs" filter. Sourced from community data, not official. Bots have no win rate data.

## Refs Folder

`refs/` contains rulebook PDFs for all expansions. Use `Read` tool with `pages` parameter. Key files:
- `Root_Base_Learn_to_Play_web_Oct_15_2020.pdf`
- `Root_Marauder_Expansion_Learn_to_Play-compressed.pdf` — hireling rules are here
- `Root_Riverfolk_Learn_to_Play_web_Oct_15_2020.pdf`
- `Root_Underworld_Learn_to_Play_web_Oct_15_2020.pdf`
- `Root_Homeland_Learn_to_Play.pdf`
- `Root_Clockwork_Law_of_Rootbotics_July_11_2023_1.pdf`
- `refs/data/Root Community Data.xlsx` — win rate source data
