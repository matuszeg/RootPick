import { DECKS, ACCESSORIES } from '../data/accessories.js';
import DeckCard from './DeckCard.jsx';

export default function CardsTab({ state, actions, onBoardClick }) {
  const { selectedDeck, ownedAccessories } = state;

  const canRerollDeck = DECKS.filter(d => d.accessory === null || ownedAccessories.has(d.accessory)).length > 1;
  const availableDeckAccessories = ACCESSORIES.filter(a => a.category === 'deck');

  return (
    <div className="tab-panel">
      <div className="tab-filters">
        <div className="filter-group">
          <h3 className="filter-heading">Card Decks</h3>
          {availableDeckAccessories.map(a => (
            <label key={a.id} className={`expansion-check ${ownedAccessories.has(a.id) ? 'checked' : ''}`}>
              <input type="checkbox" checked={ownedAccessories.has(a.id)} onChange={() => actions.toggleAccessory(a.id)} />
              <span className="checkbox-box" />
              <span className="expansion-name">{a.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="sub-tab-content">
        {selectedDeck ? (
          <div className="session-row">
            <DeckCard deckId={selectedDeck} onReroll={actions.rerollDeck} canReroll={canRerollDeck} onBoardClick={onBoardClick} />
          </div>
        ) : (
          <div className="tab-empty-state">
            <p>No deck picked yet.</p>
            <p className="tab-empty-sub">Hit Randomize above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
