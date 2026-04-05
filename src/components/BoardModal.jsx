import { useState, useEffect, useCallback } from 'react';

export default function BoardModal({ images, factionName, onClose }) {
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
          alt={`${factionName} board — ${showingFront ? 'front' : 'back'}`}
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
                Front
              </button>
              <button
                className={`board-modal-side-btn ${!showingFront ? 'active' : ''}`}
                onClick={() => setShowingFront(false)}
              >
                Back
              </button>
            </div>
          )}
          <button className="board-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
