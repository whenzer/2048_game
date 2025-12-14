import React from 'react';
import './GameOverlay.css';

interface GameOverlayProps {
  show: boolean;
  type: 'won' | 'gameover';
  score: number;
  onNewGame: () => void;
  onKeepPlaying?: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({
  show,
  type,
  score,
  onNewGame,
  onKeepPlaying,
}) => {
  if (!show) return null;

  const isWin = type === 'won';

  return (
    <div className={`game-overlay ${isWin ? 'win' : 'lose'}`}>
      <div className="overlay-content">
        <div className="overlay-icon">{isWin ? '🏆' : '💀'}</div>
        <h2 className="overlay-title">
          {isWin ? 'YOU WIN!' : 'GAME OVER'}
        </h2>
        <p className="overlay-score">
          Final Score: <span>{score.toLocaleString()}</span>
        </p>
        <div className="overlay-buttons">
          {isWin && onKeepPlaying && (
            <button className="overlay-button continue" onClick={onKeepPlaying}>
              Keep Playing
            </button>
          )}
          <button className="overlay-button new-game" onClick={onNewGame}>
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(GameOverlay);
