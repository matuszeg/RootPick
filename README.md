# RootPick

Faction randomizer for the Root board game. Generate balanced, compatible faction combinations for your session based on your expansions, player count, and difficulty preferences.

**Live at [rootpick.app](https://rootpick.app)**

> Fan-made tool. Not affiliated with or endorsed by Leder Games.

---

## Features

- **Randomizer** — generates valid faction combinations that meet Reach requirements
- **Browse Pool** — see all factions available with your current filters
- **Per-card controls** — lock factions you want to keep, re-roll individual slots, or ban factions for the session
- **Strict / Adventurous modes** — use official Reach minimums or Leder's flat threshold
- **Type balance** — optionally require at least one Militant and one Insurgent
- **Difficulty filter** — exclude Expert factions for sessions with newer players
- **Share** — encodes your full setup into a URL so you can share a specific combo with your group
- **Undo** — steps back through the last 5 combinations
- Settings persist between sessions via localStorage

## Expansions supported

- Base Game
- Riverfolk Expansion
- Underworld Expansion
- Marauder Expansion
- Homeland Expansion

## Running locally

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

Output goes to `dist/`. It's a fully static site — drop it anywhere.

## Contributing

Faction data lives in [`src/data/factions.js`](src/data/factions.js). If Homeland faction details get updated or corrected, that's the place to fix them. PRs welcome.
