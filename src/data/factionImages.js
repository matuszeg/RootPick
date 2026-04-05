// Maps faction IDs to board and head image paths.
// Human factions have front + back boards; clockwork bots have front only.
// vagabond1 and vagabond2 share the same board images.

const BOARD_BASE = '/icons/factions/boards/';
const HEAD_BASE  = '/icons/factions/heads/';

// Faction ID → board image slug
const BOARD_SLUGS = {
  marquise:         'marquise',
  eyrie:            'eyrie',
  alliance:         'alliance',
  vagabond1:        'vagabond',
  vagabond2:        'vagabond',
  riverfolk:        'riverfolk',
  lizard:           'lizard',
  duchy:            'duchy',
  corvid:           'corvid',
  hundreds:         'hundreds',
  keepers:          'keepers',
  lilypad:          'lilypad',
  twilight:         'twilight',
  knaves:           'knaves',
  mech_marquise:    'bot_marquise',
  elec_eyrie:       'bot_eyrie',
  auto_alliance:    'bot_alliance',
  vagabot:          'bot_vagabond',
  logical_lizards:  'bot_lizard',
  riverfolk_robots: 'bot_riverfolk',
  cogwheel_corvids: 'bot_corvid',
  drillbit_duchy:   'bot_duchy',
};

// Faction ID → head image slug
const HEAD_SLUGS = {
  marquise:         'marquise',
  eyrie:            'eyrie',
  alliance:         'alliance',
  vagabond1:        'vagabond',
  vagabond2:        'vagabond',
  riverfolk:        'riverfolk',
  lizard:           'lizard',
  duchy:            'duchy',
  corvid:           'corvid',
  hundreds:         'hundreds',
  keepers:          'keepers',
  lilypad:          'lilypad',
  twilight:         'twilight',
  knaves:           'knaves',
  mech_marquise:    'bot_marquise',
  elec_eyrie:       'bot_eyrie',
  auto_alliance:    'bot_alliance',
  vagabot:          'bot_vagabond',
  logical_lizards:  'bot_lizard',
  riverfolk_robots: 'bot_riverfolk',
  cogwheel_corvids: 'bot_corvid',
  drillbit_duchy:   'bot_duchy',
};

export function getBoardImages(factionId) {
  const slug = BOARD_SLUGS[factionId];
  if (!slug) return null;
  const isBot = slug.startsWith('bot_');
  return {
    front: `${BOARD_BASE}${slug}-front.webp`,
    back:  isBot ? null : `${BOARD_BASE}${slug}-back.webp`,
  };
}

export function getHeadImage(factionId) {
  const slug = HEAD_SLUGS[factionId];
  if (!slug) return null;
  return `${HEAD_BASE}${slug}.png`;
}
