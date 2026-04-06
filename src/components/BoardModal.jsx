import { useState, useEffect, useCallback } from 'react';
import { XIcon } from './Icons.jsx';

export default function BoardModal({ images, title, onClose, sideLabels = ['Front', 'Back'] }) {
  const [showingFront, setShowingFront] = useState(true);
  const hasBack = images?.back != null;
  const activeSrc = showingFront ? images?.front : images?.back;

  const handleKey = useCallback(e => {
    if (e.key === 'Escape') onClose();
    if (hasBack && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      setShowingFront(f => !f);
    }
  }, [onClose, hasBack]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!activeSrc) return null;

  return (
    <div className="board-modal-overlay" onClick={onClose}>
      <div className="board-modal" onClick={e => e.stopPropagation()}>
        <img
          src={activeSrc}
          alt={`${title} — ${showingFront ? sideLabels[0] : sideLabels[1]}`}
          className="board-modal-img"
          draggable={false}
        />
        <div className="board-modal-controls">
          {hasBack && (
            <div className="board-modal-side-toggle">
              <button
                className={`board-modal-side-btn ${showingFront ? 'active' : ''}`}
                onClick={() => setShowingFront(true)}
              >
                {sideLabels[0]}
              </button>
              <button
                className={`board-modal-side-btn ${!showingFront ? 'active' : ''}`}
                onClick={() => setShowingFront(false)}
              >
                {sideLabels[1]}
              </button>
            </div>
          )}
          <button className="board-modal-close" onClick={onClose} aria-label="Close">
            <XIcon width={16} height={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
