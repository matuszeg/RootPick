import { useState, useEffect, useRef } from 'react';
import { getReachThreshold } from '../utils/randomizer.js';
import DieIcon from './DieIcon.jsx';
import { UndoIcon, ShareIcon, CheckIcon, TrashIcon, BotIcon } from './Icons.jsx';

function InfoIcon({ tip }) {
  return (
    <span className="info-icon" title={tip} aria-label={tip}>?</span>
  );
}

export default function PersistentBar({ state, actions, copied, hasSelection, hasHistory }) {
  const {
    playerCount, botCount, balanceMode, ownedExpansions,
  } = state;

  const canUseBots = ownedExpansions.has('clockwork') || ownedExpansions.has('clockwork2');
  const maxBots = 6 - playerCount;
  const threshold = getReachThreshold(balanceMode, playerCount + botCount);

  const [botsOpen, setBotsOpen] = useState(false);
  const [botAnim, setBotAnim] = useState('idle');
  const prevCanUseBots = useRef(canUseBots);

  useEffect(() => {
    if (prevCanUseBots.current === canUseBots) return;
    prevCanUseBots.current = canUseBots;
    setBotAnim(canUseBots ? 'activating' : 'deactivating');
    setBotsOpen(canUseBots);
    const t = setTimeout(() => setBotAnim('idle'), 900);
    return () => clearTimeout(t);
  }, [canUseBots]);

  return (
    <div className="persistent-bar">
      <div className="pbar-settings">
        <div className="pbar-players">
          <span className="pbar-label">Players</span>
          <div className="pbar-count-row">
            {[2, 3, 4, 5, 6].map(n => (
              <button
                key={n}
                className={`player-btn ${playerCount === n ? 'active' : ''}`}
                onClick={() => actions.setPlayerCount(n)}
                aria-pressed={playerCount === n}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="pbar-reach">
            Reach goal: <strong>{threshold === 0 ? 'None' : threshold}</strong>
            <InfoIcon tip="Reach measures how well a faction can establish itself in the early game. A higher total means factions can compete more fairly from the start. Low-reach factions struggle if there aren't enough high-reach factions to balance them out." />
          </span>
        </div>

        {canUseBots && (
          <div className={`pbar-bots ${botAnim !== 'idle' ? `bots-${botAnim}` : ''}`}>
            <span className="pbar-label">
              <BotIcon width={14} height={14} /> Bots
            </span>
            <div className="pbar-count-row">
              {Array.from({ length: maxBots + 1 }, (_, i) => i).map(n => (
                <button
                  key={n}
                  className={`player-btn ${botCount === n ? 'active' : ''}`}
                  onClick={() => actions.setBotCount(n)}
                  aria-pressed={botCount === n}
                >
                  {n}
                </button>
              ))}
            </div>
            {botCount > 0 && (
              <span className="pbar-reach">
                Total factions: <strong>{playerCount + botCount}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pbar-actions" role="toolbar" aria-label="Session actions">
        <button
          className="action-btn primary randomize-btn"
          onClick={() => actions.randomize(false)}
        >
          <span className="btn-icon"><DieIcon width={16} height={16} /></span>
          <span>Randomize</span>
        </button>

        <div className="action-bar-secondary">
          <button
            className="action-btn secondary"
            onClick={actions.undo}
            disabled={!hasHistory}
            title="Undo last randomize"
          >
            <span className="btn-icon"><UndoIcon /></span>
            <span>Undo</span>
          </button>
          <button
            className={`action-btn secondary share-btn ${copied ? 'copied' : ''}`}
            onClick={actions.share}
            disabled={!hasSelection}
            title="Copy shareable link to clipboard"
          >
            <span className="btn-icon">{copied ? <CheckIcon /> : <ShareIcon />}</span>
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
          <button
            className="action-btn secondary reset-btn"
            onClick={actions.resetAll}
            title="Clear all settings and return to defaults"
          >
            <span className="btn-icon"><TrashIcon /></span>
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
}
