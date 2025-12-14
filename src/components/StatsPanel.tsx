import React from 'react';
import type { GameStats } from '../types/game';
import './StatsPanel.css';

interface StatsPanelProps {
  stats: GameStats;
  isOpen: boolean;
  onClose: () => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, isOpen, onClose }) => {
  if (!isOpen) return null;

  const winRate = stats.gamesPlayed > 0 
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1) 
    : '0.0';

  const avgScore = stats.gamesPlayed > 0 
    ? Math.round(stats.totalScore / stats.gamesPlayed) 
    : 0;

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-panel" onClick={(e) => e.stopPropagation()}>
        <button className="stats-close" onClick={onClose}>×</button>
        <h2 className="stats-title">📊 Statistics</h2>
        
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.gamesPlayed}</span>
            <span className="stat-label">Games Played</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.gamesWon}</span>
            <span className="stat-label">Games Won</span>
          </div>
          <div className="stat-item highlight">
            <span className="stat-value">{winRate}%</span>
            <span className="stat-label">Win Rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{avgScore.toLocaleString()}</span>
            <span className="stat-label">Avg Score</span>
          </div>
          <div className="stat-item highlight">
            <span className="stat-value">{stats.highestTile}</span>
            <span className="stat-label">Highest Tile</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.totalMoves.toLocaleString()}</span>
            <span className="stat-label">Total Moves</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.totalMerges.toLocaleString()}</span>
            <span className="stat-label">Total Merges</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatTime(stats.fastestWin)}</span>
            <span className="stat-label">Fastest Win</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatsPanel);
