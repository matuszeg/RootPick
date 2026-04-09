import { DECK_MAP } from '../data/accessories.js';
import { SwapIcon } from './Icons.jsx';

const DECK_COLORS = {
  standard: { primary: '#5A7A3A', secondary: '#2A4A1A' },
  exiles:   { primary: '#8A4A8A', secondary: '#4A1A5A' },
  squires:  { primary: '#8A6A2A', secondary: '#4A3A0A' },
};

export default function DeckCard({ deckId, onReroll, canReroll, onBoardClick }) {
  const deck = DECK_MAP[deckId];
  if (!deck) return null;

  const colors = DECK_COLORS[deckId] ?? DECK_COLORS.standard;

  return (
    <div className="deck-card" style={{ '--deck-color': colors.primary, '--deck-color-dark': colors.secondary }}>
      {deck.img && (
        <div
          className="deck-card-img-wrap"
          onClick={() => onBoardClick?.({ front: deck.img, back: null }, deck.name)}
        >
          <img src={deck.img} alt={deck.name} className="deck-card-img" draggable={false} />
        </div>
      )}
      <div className="deck-card-bar">
        <div className="deck-card-bar-left">
          <span className="deck-card-label">Deck</span>
          <span className="deck-card-name">{deck.name}</span>
          <span className="deck-card-desc">{deck.description}</span>
        </div>
        {canReroll && (
          <button className="deck-reroll-btn" onClick={onReroll} title="Re-roll deck">
            <SwapIcon width={13} height={13} /> Re-roll
          </button>
        )}
      </div>
    </div>
  );
}
