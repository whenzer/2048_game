import React from 'react';
import type { GameMode } from '../types/game';
import './GameModeSelector.css';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const modes: { id: GameMode; name: string; icon: string; description: string }[] = [
  { id: 'classic', name: 'Classic', icon: '🎮', description: 'Original 2048 experience' },
  { id: 'timeAttack', name: 'Time Attack', icon: '⏱️', description: '2 minutes to get highest score' },
  { id: 'zen', name: 'Zen', icon: '🧘', description: 'No game over, just relax' },
];

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="game-mode-selector">
      <div className="mode-title">GAME MODE</div>
      <div className="mode-buttons">
        {modes.map((mode) => (
          <button
            key={mode.id}
            className={`mode-button ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => onModeChange(mode.id)}
            title={mode.description}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-name">{mode.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(GameModeSelector);
