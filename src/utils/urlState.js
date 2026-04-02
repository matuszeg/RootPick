export function encodeToUrl(state) {
  const params = new URLSearchParams();
  params.set('expansions', [...state.ownedExpansions].join(','));
  params.set('players', String(state.playerCount));
  params.set('strict', String(state.strictMode));
  params.set('balance', String(state.requireBalance));
  params.set('difficulty', [...state.difficulties].sort().join(','));
  if (state.selectedFactions.length) {
    params.set('factions', state.selectedFactions.join(','));
  }
  if (state.lockedFactions.size) {
    params.set('locked', [...state.lockedFactions].join(','));
  }
  if (state.bannedFactions.size) {
    params.set('banned', [...state.bannedFactions].join(','));
  }
  return params.toString();
}

export function decodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const result = {};

  if (params.has('expansions')) {
    result.ownedExpansions = new Set(
      params.get('expansions').split(',').filter(Boolean)
    );
  }
  const players = parseInt(params.get('players'));
  if (players >= 2 && players <= 6) result.playerCount = players;

  if (params.has('strict')) result.strictMode = params.get('strict') === 'true';
  if (params.has('balance')) result.requireBalance = params.get('balance') === 'true';

  if (params.has('difficulty')) {
    result.difficulties = new Set(
      params.get('difficulty').split(',').map(Number).filter(n => n >= 1 && n <= 3)
    );
  }
  if (params.has('factions')) {
    result.selectedFactions = params.get('factions').split(',').filter(Boolean);
  }
  if (params.has('locked')) {
    result.lockedFactions = new Set(
      params.get('locked').split(',').filter(Boolean)
    );
  }
  if (params.has('banned')) {
    result.bannedFactions = new Set(
      params.get('banned').split(',').filter(Boolean)
    );
  }
  return result;
}
