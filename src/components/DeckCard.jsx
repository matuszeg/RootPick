import { DECK_MAP } from '../data/accessories.js';

const DECK_COLORS = {
  standard: { primary: '#5A7A3A', secondary: '#2A4A1A' },
  exiles:   { primary: '#8A4A8A', secondary: '#4A1A5A' },
  squires:  { primary: '#8A6A2A', secondary: '#4A3A0A' },
};

const DECK_ICONS = {
  standard: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="26" height="34" rx="3" fill="currentColor" opacity="0.3"/>
      <rect x="12" y="6" width="26" height="34" rx="3" fill="currentColor" opacity="0.6"/>
      <rect x="16" y="2" width="26" height="34" rx="3" fill="currentColor"/>
      <line x1="22" y1="12" x2="36" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <line x1="22" y1="18" x2="36" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <line x1="22" y1="24" x2="30" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),
  exiles: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="2" width="26" height="34" rx="3" fill="currentColor"/>
      {/* Crossed swords motif */}
      <line x1="20" y1="8" x2="38" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
      <line x1="38" y1="8" x2="20" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
      <circle cx="29" cy="17" r="4" fill="white" opacity="0.2"/>
      <line x1="22" y1="30" x2="36" y2="30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  ),
  squires: (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="2" width="26" height="34" rx="3" fill="currentColor"/>
      {/* Shield + star */}
      <path d="M29 8 L37 11 L37 19 C37 24 29 28 29 28 C29 28 21 24 21 19 L21 11 Z" fill="white" opacity="0.25"/>
      <polygon points="29,12 30.5,17 35.5,17 31.5,20 33,25 29,22 25,25 26.5,20 22.5,17 27.5,17" fill="white" opacity="0.5"/>
    </svg>
  ),
};

export default function DeckCard({ deckId, onReroll, canReroll }) {
  const deck = DECK_MAP[deckId];
  if (!deck) return null;

  const colors = DECK_COLORS[deckId] ?? DECK_COLORS.standard;

  return (
    <div className="deck-card" style={{ '--deck-color': colors.primary, '--deck-color-dark': colors.secondary }}>
      <div className="deck-card-header">
        <div className="deck-card-icon">{DECK_ICONS[deckId]}</div>
        <div className="deck-card-title-block">
          <div className="deck-card-label">Deck</div>
          <h2 className="deck-card-name">{deck.name}</h2>
        </div>
        {canReroll && (
          <button className="deck-reroll-btn" onClick={onReroll} title="Re-roll deck">
            🔄 Re-roll
          </button>
        )}
      </div>
      <div className="deck-card-body">
        <p className="deck-description">{deck.description}</p>
      </div>
    </div>
  );
}
