import React from 'react';
import './ScoreBoard.css';

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  moveCount: number;
  comboCount: number;
  timeRemaining: number | null;
  highestTile: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  bestScore,
  moveCount,
  comboCount,
  timeRemaining,
  highestTile,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="score-board">
      <div className="score-row">
        <div className="score-item score-main">
          <span className="score-label">SCORE</span>
          <span className="score-value">{score.toLocaleString()}</span>
        </div>
        <div className="score-item score-best">
          <span className="score-label">BEST</span>
          <span className="score-value">{bestScore.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="score-row secondary">
        <div className="score-item small">
          <span className="score-label">MOVES</span>
          <span className="score-value">{moveCount}</span>
        </div>
        <div className="score-item small">
          <span className="score-label">HIGHEST</span>
          <span className="score-value highest-tile">{highestTile}</span>
        </div>
        {comboCount > 1 && (
          <div className="score-item small combo">
            <span className="score-label">COMBO</span>
            <span className="score-value combo-value">x{comboCount}</span>
          </div>
        )}
        {timeRemaining !== null && (
          <div className={`score-item small timer ${timeRemaining < 30 ? 'warning' : ''} ${timeRemaining < 10 ? 'critical' : ''}`}>
            <span className="score-label">TIME</span>
            <span className="score-value">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ScoreBoard);
