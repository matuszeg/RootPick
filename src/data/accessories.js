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
  // ── Base Game — 3 characters ────────────────────────────────────────────
  { id: 'ranger',     name: 'Ranger',     source: 'base',          cardImg: '/icons/vagabond/cards/ranger.webp',     faceImg: '/icons/vagabond/faces/ranger.webp' },
  { id: 'thief',      name: 'Thief',      source: 'base',          cardImg: '/icons/vagabond/cards/thief.webp',      faceImg: '/icons/vagabond/faces/thief.webp' },
  { id: 'tinker',     name: 'Tinker',     source: 'base',          cardImg: '/icons/vagabond/cards/tinker.webp',     faceImg: '/icons/vagabond/faces/tinker.webp' },
  // ── Riverfolk Expansion — 3 characters ──────────────────────────────────
  { id: 'vagrant',    name: 'Vagrant',    source: 'riverfolk_characters',  cardImg: '/icons/vagabond/cards/vagrant.webp',    faceImg: '/icons/vagabond/faces/vagrant.webp' },
  { id: 'arbiter',    name: 'Arbiter',    source: 'riverfolk_characters',  cardImg: '/icons/vagabond/cards/arbiter.webp',    faceImg: '/icons/vagabond/faces/arbiter.webp' },
  { id: 'scoundrel',  name: 'Scoundrel',  source: 'riverfolk_characters',  cardImg: '/icons/vagabond/cards/scoundrel.webp',  faceImg: '/icons/vagabond/faces/scoundrel.webp' },
  // ── Vagabond Pack — 3 characters ────────────────────────────────────────
  { id: 'ronin',      name: 'Ronin',      source: 'vagabond_pack', cardImg: '/icons/vagabond/cards/ronin.webp',      faceImg: '/icons/vagabond/faces/ronin.webp' },
  { id: 'adventurer', name: 'Adventurer', source: 'vagabond_pack', cardImg: '/icons/vagabond/cards/adventurer.webp', faceImg: '/icons/vagabond/faces/adventurer.webp' },
  { id: 'harrier',    name: 'Harrier',    source: 'vagabond_pack', cardImg: '/icons/vagabond/cards/harrier.webp',    faceImg: '/icons/vagabond/faces/harrier.webp' },
  // ── Homeland Expansion — 3 characters ───────────────────────────────────
  { id: 'cheat',      name: 'Cheat',      source: 'homeland_characters',   cardImg: '/icons/vagabond/cards/cheat.webp',      faceImg: '/icons/vagabond/faces/cheat.webp' },
  { id: 'gladiator',  name: 'Gladiator',  source: 'homeland_characters',   cardImg: '/icons/vagabond/cards/gladiator.webp',  faceImg: '/icons/vagabond/faces/gladiator.webp' },
  { id: 'jailor',     name: 'Jailor',     source: 'homeland_characters',   cardImg: '/icons/vagabond/cards/jailor.webp',     faceImg: '/icons/vagabond/faces/jailor.webp' },
];

// ─── Landmarks ────────────────────────────────────────────────────────────────
// source: expansion or accessory ID that provides this landmark.
export const LANDMARKS = [
  // ── Underworld Expansion ────────────────────────────────────────────────────
  {
    id: 'tower',
    name: 'The Tower',
    source: 'underworld_landmarks',
    description: 'Whoever rules this clearing scores 1 VP at the start of their Birdsong.',
    frontImg: '/icons/landmarks/cards/tower-front.webp',
    backImg:  '/icons/landmarks/cards/tower-back.webp',
  },
  {
    id: 'ferry',
    name: 'The Ferry',
    source: 'underworld_landmarks',
    description: 'A piece in this clearing may move to any clearing on the map during its move.',
    frontImg: '/icons/landmarks/cards/ferry-front.webp',
    backImg:  '/icons/landmarks/cards/ferry-back.webp',
  },
  // ── Landmarks Pack ──────────────────────────────────────────────────────────
  {
    id: 'market',
    name: 'Black Market',
    source: 'landmarks_pack',
    description: 'Players in this clearing may swap a card from their hand with a card from the discard.',
    frontImg: '/icons/landmarks/cards/market-front.webp',
    backImg:  '/icons/landmarks/cards/market-back.webp',
  },
  {
    id: 'treetop',
    name: 'Elder Treetop',
    source: 'landmarks_pack',
    description: 'This clearing has one extra building slot.',
    frontImg: '/icons/landmarks/cards/treetop-front.webp',
    backImg:  '/icons/landmarks/cards/treetop-back.webp',
  },
  {
    id: 'forge',
    name: 'Legendary Forge',
    source: 'landmarks_pack',
    description: 'Players crafting in this clearing score 1 bonus VP.',
    frontImg: '/icons/landmarks/cards/forge-front.webp',
    backImg:  '/icons/landmarks/cards/forge-back.webp',
  },
  {
    id: 'city',
    name: 'Lost City',
    source: 'landmarks_pack',
    description: 'This clearing is a wild suit — it counts as any suit for all purposes.',
    frontImg: '/icons/landmarks/cards/city-front.webp',
    backImg:  '/icons/landmarks/cards/city-back.webp',
  },
  // ── Homeland Expansion ──────────────────────────────────────────────────────
  {
    id: 'mousehold',
    name: 'Mousehold',
    source: 'homeland_landmarks',
    description: 'This mouse clearing has one extra building slot.',
    frontImg: '/icons/landmarks/cards/mousehold-front.webp',
    backImg:  '/icons/landmarks/cards/mousehold-back.webp',
  },
  {
    id: 'foxburrow',
    name: 'Foxburrow',
    source: 'homeland_landmarks',
    description: 'This fox clearing has one extra building slot.',
    frontImg: '/icons/landmarks/cards/foxburrow-front.webp',
    backImg:  '/icons/landmarks/cards/foxburrow-back.webp',
  },
  {
    id: 'rabbittown',
    name: 'Rabbittown',
    source: 'homeland_landmarks',
    description: 'This rabbit clearing has one extra building slot.',
    frontImg: '/icons/landmarks/cards/rabbittown-front.webp',
    backImg:  '/icons/landmarks/cards/rabbittown-back.webp',
  },
];

// ─── Hireling Sets ────────────────────────────────────────────────────────────
// source: expansion or accessory ID that provides this hireling card.
// Each card has a promoted side (more powerful) and a demoted side (passive).
// 3 cards are randomly selected per session.
// promotedImg / demotedImg: paths to local card face images (landscape orientation).
// Note: The Marauder expansion itself includes 4 hireling cards.
export const HIRELING_SETS = [
  // ── Marauder Expansion — 4 cards ──────────────────────────────────────────
  {
    id: 'forest_patrol',
    promoted: 'Forest Patrol',
    demoted:  'Feline Physicians',
    source:   'marauder_hirelings_base',
    associatedFactions: ['marquise'],
    promotedImg: '/icons/hirelings/cards/forest-patrol-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/feline-physicians-demoted.webp',
  },
  {
    id: 'last_dynasty',
    promoted: 'Last Dynasty',
    demoted:  'Bluebird Nobles',
    source:   'marauder_hirelings_base',
    associatedFactions: ['eyrie'],
    promotedImg: '/icons/hirelings/cards/last-dynasty-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/bluebird-nobles-demoted.webp',
  },
  {
    id: 'spring_uprising',
    promoted: 'Spring Uprising',
    demoted:  'Rabbit Scouts',
    source:   'marauder_hirelings_base',
    associatedFactions: ['alliance'],
    promotedImg: '/icons/hirelings/cards/spring-uprising-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/rabbit-scouts-demoted.webp',
  },
  {
    id: 'the_exile',
    promoted: 'The Exile',
    demoted:  'The Brigand',
    source:   'marauder_hirelings_base',
    associatedFactions: ['vagabond1', 'vagabond2'], // excluded whenever any Vagabond variant is played
    promotedImg: '/icons/hirelings/cards/the-exile-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/the-brigand-demoted.webp',
  },

  // ── Marauder Hirelings Pack — 3 cards ─────────────────────────────────────
  {
    id: 'vault_keepers',
    promoted: 'Vault Keepers',
    demoted:  'Badger Bodyguards',
    source:   'marauder_hirelings',
    associatedFactions: ['keepers'],
    promotedImg: '/icons/hirelings/cards/vault-keepers-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/badger-bodyguards-demoted.webp',
  },
  {
    id: 'popular_band',
    promoted: 'Popular Band',
    demoted:  'Street Band',
    source:   'marauder_hirelings',
    associatedFactions: [],
    promotedImg: '/icons/hirelings/cards/popular-band-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/street-band-demoted.webp',
  },
  {
    id: 'flame_bearers',
    promoted: 'Flame Bearers',
    demoted:  'Rat Smugglers',
    source:   'marauder_hirelings',
    associatedFactions: ['hundreds'],
    promotedImg: '/icons/hirelings/cards/flame-bearers-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/rat-smugglers-demoted.webp',
  },

  // ── Riverfolk Hirelings Pack — 3 cards ────────────────────────────────────
  {
    id: 'flotilla',
    promoted: 'Riverfolk Flotilla',
    demoted:  'Otter Divers',
    source:   'riverfolk_hirelings',
    associatedFactions: ['riverfolk'],
    promotedImg: '/icons/hirelings/cards/riverfolk-flotilla-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/otter-divers-demoted.webp',
  },
  {
    id: 'highway_bandits',
    promoted: 'Highway Bandits',
    demoted:  'Bandit Gangs',
    source:   'riverfolk_hirelings',
    associatedFactions: [],
    promotedImg: '/icons/hirelings/cards/highway-bandits-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/bandit-gangs-demoted.webp',
  },
  {
    id: 'sun_prophets',
    promoted: 'Warm Sun Prophets',
    demoted:  'Lizard Envoys',
    source:   'riverfolk_hirelings',
    associatedFactions: ['lizard'],
    promotedImg: '/icons/hirelings/cards/warm-sun-prophets-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/lizard-envoys-demoted.webp',
  },

  // ── Underworld Hirelings Pack — 3 cards ───────────────────────────────────
  {
    id: 'sunward_exp',
    promoted: 'Sunward Expedition',
    demoted:  'Mole Artisans',
    source:   'underworld_hirelings',
    associatedFactions: ['duchy'],
    promotedImg: '/icons/hirelings/cards/sunward-expedition-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/mole-artisans-demoted.webp',
  },
  {
    id: 'corvid_spies',
    promoted: 'Corvid Spies',
    demoted:  'Raven Sentries',
    source:   'underworld_hirelings',
    associatedFactions: ['corvid'],
    promotedImg: '/icons/hirelings/cards/corvid-spies-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/raven-sentries-demoted.webp',
  },
  {
    id: 'furious_prot',
    promoted: 'Furious Protector',
    demoted:  'Stoic Protector',
    source:   'underworld_hirelings',
    associatedFactions: [],
    promotedImg: '/icons/hirelings/cards/furious-protector-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/stoic-protector-demoted.webp',
  },

  // ── Homeland Hirelings Pack — 3 cards ─────────────────────────────────────
  {
    id: 'river_roamers',
    promoted: 'River Roamers',
    demoted:  'Frog Tinkers',
    source:   'homeland_hirelings',
    associatedFactions: ['lilypad'],
    promotedImg: '/icons/hirelings/cards/river-roamers-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/frog-tinkers-demoted.webp',
  },
  {
    id: 'sunny_advocates',
    promoted: 'Sunny Advocates',
    demoted:  'Bat Messengers',
    source:   'homeland_hirelings',
    associatedFactions: ['twilight'],
    promotedImg: '/icons/hirelings/cards/sunny-advocates-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/bat-messengers-demoted.webp',
  },
  {
    id: 'prosperous_farmers',
    promoted: 'Prosperous Farmers',
    demoted:  'Struggling Farmers',
    source:   'homeland_hirelings',
    associatedFactions: ['knaves'],
    promotedImg: '/icons/hirelings/cards/prosperous-farmers-promoted.webp',
    demotedImg:  '/icons/hirelings/cards/struggling-farmers-demoted.webp',
  },
];

// ─── Accessories (owned toggles shown in settings) ────────────────────────────
export const ACCESSORIES = [
  { id: 'standard_deck',        name: 'Standard Deck',           category: 'deck',     requiresExpansion: null },
  { id: 'exiles_deck',          name: 'Exiles & Partisans Deck', category: 'deck',     requiresExpansion: null },
  { id: 'squires_deck',         name: 'Squires & Disciples Deck', category: 'deck',    requiresExpansion: null },
  { id: 'riverfolk_characters',  name: 'Riverfolk Characters',     category: 'vagabond', requiresExpansion: null },
  { id: 'homeland_characters',   name: 'Homeland Characters',      category: 'vagabond', requiresExpansion: null },
  { id: 'vagabond_pack',         name: 'Vagabond Pack',            category: 'vagabond', requiresExpansion: null },
  { id: 'underworld_landmarks',  name: 'Underworld Landmarks',     category: 'landmark', requiresExpansion: null },
  { id: 'homeland_landmarks',   name: 'Homeland Landmarks',       category: 'landmark', requiresExpansion: null },
  { id: 'landmarks_pack',       name: 'Landmarks Pack',           category: 'landmark', requiresExpansion: null },
  { id: 'marauder_hirelings_base', name: 'Marauder Expansion',      category: 'hireling', requiresExpansion: null },
  { id: 'marauder_hirelings',   name: 'Marauder Hirelings Pack',  category: 'hireling', requiresExpansion: null },
  { id: 'riverfolk_hirelings',  name: 'Riverfolk Hirelings Pack', category: 'hireling', requiresExpansion: null },
  { id: 'underworld_hirelings', name: 'Underworld Hirelings Pack',category: 'hireling', requiresExpansion: null },
  { id: 'homeland_hirelings',   name: 'Homeland Hirelings Pack',  category: 'hireling', requiresExpansion: null },
];

export const DECK_MAP      = Object.fromEntries(DECKS.map(d => [d.id, d]));
export const HIRELING_MAP  = Object.fromEntries(HIRELING_SETS.map(h => [h.id, h]));
export const LANDMARK_MAP  = Object.fromEntries(LANDMARKS.map(l => [l.id, l]));
export const CHARACTER_MAP = Object.fromEntries(VAGABOND_CHARACTERS.map(c => [c.id, c]));
