// ─── Decks ────────────────────────────────────────────────────────────────────
export const DECKS = [
  {
    id: 'standard',
    name: 'Standard Deck',
    accessory: 'standard_deck',
    description: 'The classic Root deck. Familiar crafting paths and persistent effects.',
  },
  {
    id: 'exiles',
    name: 'Exiles & Partisans',
    accessory: 'exiles_deck',
    description: '20 new abilities, many thematically tied to specific factions. Shakes up crafting strategies significantly.',
  },
  {
    id: 'squires',
    name: 'Squires & Disciples',
    accessory: 'squires_deck',
    description: 'Hand-composition abilities inspired by Marauder and Homeland factions. New game-ending condition interactions.',
  },
];

// ─── Vagabond Characters ───────────────────────────────────────────────────────
// source: expansion ID or accessory ID that unlocks this character.
// Note: base game characters are sourced from 'base'.
// Riverfolk expansion characters are sourced from 'riverfolk'.
// Verify exact character availability against your rulebook if needed.
export const VAGABOND_CHARACTERS = [
  { id: 'ranger',     name: 'Ranger',     source: 'base' },
  { id: 'scoundrel',  name: 'Scoundrel',  source: 'base' },
  { id: 'tinker',     name: 'Tinker',     source: 'riverfolk' },
  { id: 'thief',      name: 'Thief',      source: 'riverfolk' },
  { id: 'vagrant',    name: 'Vagrant',    source: 'riverfolk' },
  { id: 'ronin',      name: 'Ronin',      source: 'vagabond_pack' },
  { id: 'adventurer', name: 'Adventurer', source: 'vagabond_pack' },
  { id: 'harrier',    name: 'Harrier',    source: 'vagabond_pack' },
];

// ─── Landmarks ────────────────────────────────────────────────────────────────
// source: expansion or accessory ID that provides this landmark.
export const LANDMARKS = [
  {
    id: 'tower',
    name: 'The Tower',
    source: 'underworld',
    description: 'Placed in the central clearing (the Pass). Whoever rules it scores 1 VP each round.',
  },
  {
    id: 'market',
    name: 'Black Market',
    source: 'landmarks_pack',
    description: 'Players in this clearing may swap a card from their hand with a card from the discard.',
  },
  {
    id: 'treetop',
    name: 'Elder Treetop',
    source: 'landmarks_pack',
    description: 'This clearing has one extra building slot.',
  },
  {
    id: 'forge',
    name: 'Legendary Forge',
    source: 'landmarks_pack',
    description: 'Players crafting here score 1 bonus VP.',
  },
  {
    id: 'city',
    name: 'Lost City',
    source: 'landmarks_pack',
    description: 'This clearing is a wild suit — it counts as any suit for all purposes.',
  },
];

// ─── Hireling Sets ────────────────────────────────────────────────────────────
// source: expansion or accessory ID that provides this hireling set.
// Each set has a promoted side (more powerful) and a demoted side (passive).
// 3 sets are randomly selected per session when hirelings are enabled.
// Note: The Marauder expansion itself includes 4 hireling sets.
export const HIRELING_SETS = [
  // Marauder Expansion (core) — 4 sets, unlocked by owning marauder
  { id: 'bandit_gangs',  name: 'Bandit Gangs',  promoted: 'Bandit Gangs',   demoted: 'Outcast Bandits',  source: 'marauder', description: 'Roam clearings and force battles. Demoted: occasionally disrupt passing warriors.' },
  { id: 'flame_bearers', name: 'Flame Bearers', promoted: 'Flame Bearers',  demoted: 'Spark Bearers',    source: 'marauder', description: 'Set clearings ablaze, forcing warrior removal. Demoted: grant a passive movement bonus.' },
  { id: 'last_dynasty',  name: 'Last Dynasty',  promoted: 'Last Dynasty',   demoted: 'Lost Nobility',    source: 'marauder', description: 'Hold territory and score VP for their controller. Demoted: minor territory bonus.' },
  { id: 'protector',     name: 'Protector',     promoted: 'Protector',      demoted: 'Sentinel',         source: 'marauder', description: 'Defend clearings from attack. Demoted: reduce incoming damage for controller.' },

  // Marauder Hirelings Pack — 3 additional sets
  { id: 'vault_keepers', name: 'Vault Keepers',  promoted: 'Vault Keepers',   demoted: 'Badger Bodyguards', source: 'marauder_hirelings', description: 'Battle in clearings with vaults. Demoted: controller ignores the first hit in battle.' },
  { id: 'popular_band',  name: 'Popular Band',   promoted: 'Popular Band',    demoted: 'Local Favorites',   source: 'marauder_hirelings', description: 'Control enemy movement and block passage. Demoted: boost controller\'s card draw.' },
  { id: 'rat_smugglers', name: 'Rat Smugglers',  promoted: 'Rat Smugglers',   demoted: 'Petty Traders',     source: 'marauder_hirelings', description: 'Battle and move by discarding items. Demoted: grant occasional card discounts.' },

  // Riverfolk Hirelings Pack — 3 sets
  { id: 'flotilla',       name: 'Riverfolk Flotilla',  promoted: 'Riverfolk Flotilla', demoted: 'River Scouts',      source: 'riverfolk_hirelings', description: 'Bombard river clearings from the water. Demoted: grant movement along rivers.' },
  { id: 'highway_bandits',name: 'Highway Bandits',     promoted: 'Highway Bandits',    demoted: 'Road Watchers',     source: 'riverfolk_hirelings', description: 'Attack players moving between clearings. Demoted: tax movement through key paths.' },
  { id: 'sun_prophets',   name: 'Warm Sun Prophets',   promoted: 'Warm Sun Prophets',  demoted: 'Sun Disciples',     source: 'riverfolk_hirelings', description: 'Drive warriors to attack each other unprompted. Demoted: boost controller\'s crafting.' },

  // Underworld Hirelings Pack — 3 sets
  { id: 'sunward_exp',    name: 'Sunward Expedition',  promoted: 'Sunward Expedition', demoted: 'Mole Artisans',     source: 'underworld_hirelings', description: 'Move and battle without footholds. Demoted: reveal crafted cards instead of discarding.' },
  { id: 'corvid_spies',   name: 'Corvid Spies',        promoted: 'Corvid Spies',       demoted: 'Raven Sentinels',   source: 'underworld_hirelings', description: 'Steal cards and allies from opponents. Demoted: defend against card theft.' },
  { id: 'furious_prot',   name: 'Furious Protector',   promoted: 'Furious Protector',  demoted: 'Stoic Protector',   source: 'underworld_hirelings', description: 'Aggressive combat utility. Demoted: defensive bulk for controller.' },

  // Homeland Hirelings Pack — 3 sets (names provisional, verify on release)
  { id: 'frog_tinkers',    name: 'Frog Tinkers',       promoted: 'Frog Tinkers',       demoted: 'River Traders',     source: 'homeland_hirelings', description: 'Provide crafting support along waterways.' },
  { id: 'bat_messengers',  name: 'Bat Messengers',     promoted: 'Bat Messengers',     demoted: 'Night Couriers',    source: 'homeland_hirelings', description: 'Carry messages and items across the board rapidly.' },
  { id: 'sun_advocates',   name: 'Sunny Advocates',    promoted: 'Sunny Advocates',    demoted: 'Struggling Farmers',source: 'homeland_hirelings', description: 'Rally support from struggling woodland denizens.' },
];

// ─── Accessories (owned toggles shown in settings) ────────────────────────────
export const ACCESSORIES = [
  { id: 'standard_deck',        name: 'Standard Deck',           category: 'deck',     requiresExpansion: null },
  { id: 'exiles_deck',          name: 'Exiles & Partisans Deck', category: 'deck',     requiresExpansion: null },
  { id: 'squires_deck',         name: 'Squires & Disciples Deck', category: 'deck',    requiresExpansion: 'homeland' },
  { id: 'vagabond_pack',        name: 'Vagabond Pack',            category: 'vagabond', requiresExpansion: null },
  { id: 'landmarks_pack',       name: 'Landmarks Pack',           category: 'landmark', requiresExpansion: null },
  { id: 'marauder_hirelings',   name: 'Marauder Hirelings Pack',  category: 'hireling', requiresExpansion: null },
  { id: 'riverfolk_hirelings',  name: 'Riverfolk Hirelings Pack', category: 'hireling', requiresExpansion: null },
  { id: 'underworld_hirelings', name: 'Underworld Hirelings Pack',category: 'hireling', requiresExpansion: null },
  { id: 'homeland_hirelings',   name: 'Homeland Hirelings Pack',  category: 'hireling', requiresExpansion: 'homeland' },
];

export const DECK_MAP      = Object.fromEntries(DECKS.map(d => [d.id, d]));
export const HIRELING_MAP  = Object.fromEntries(HIRELING_SETS.map(h => [h.id, h]));
export const LANDMARK_MAP  = Object.fromEntries(LANDMARKS.map(l => [l.id, l]));
export const CHARACTER_MAP = Object.fromEntries(VAGABOND_CHARACTERS.map(c => [c.id, c]));
