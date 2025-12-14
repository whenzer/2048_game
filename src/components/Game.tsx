import React, { useState, useCallback } from 'react';
import type { GameMode } from '../types/game';
import { useGame } from '../hooks/useGame';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useTouchControls } from '../hooks/useTouchControls';
import { useSound } from '../hooks/useSound';
import Board from './Board';
import ScoreBoard from './ScoreBoard';
import PowerUps from './PowerUps';
import GameModeSelector from './GameModeSelector';
import GameOverlay from './GameOverlay';
import StatsPanel from './StatsPanel';
import './Game.css';

const Game: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameMode>('classic');

  const { playMove, playMerge, playWin, playGameOver, playPowerUp } = useSound({ enabled: soundEnabled });

  const {
    gameState,
    powerUps,
    stats,
    highestTile,
    handleMove,
    usePowerUp,
    newGame,
    keepPlaying,
  } = useGame({
    gridSize: 4,
    gameMode: currentMode,
    onMove: playMove,
    onMerge: playMerge,
    onWin: playWin,
    onGameOver: playGameOver,
  });

  // Keyboard controls
  useKeyboardControls({
    onMove: handleMove,
    enabled: !gameState.gameOver || currentMode === 'zen',
  });

  // Touch controls
  useTouchControls({
    onMove: handleMove,
    enabled: !gameState.gameOver || currentMode === 'zen',
  });

  const handleModeChange = useCallback((mode: GameMode) => {
    setCurrentMode(mode);
    newGame(mode);
  }, [newGame]);

  const handlePowerUp = useCallback((id: string) => {
    const success = usePowerUp(id);
    if (success) {
      playPowerUp();
    }
  }, [usePowerUp, playPowerUp]);

  const handleNewGame = useCallback(() => {
    newGame(currentMode);
  }, [newGame, currentMode]);

  const showWinOverlay = gameState.won && !gameState.keepPlaying && currentMode !== 'zen';
  const showGameOverOverlay = gameState.gameOver && !gameState.won;

  return (
    <div className="game-container">
      {/* Background effects */}
      <div className="background-effects">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="game-header">
        <h1 className="game-title">
          <span className="title-2">2</span>
          <span className="title-0">0</span>
          <span className="title-4">4</span>
          <span className="title-8">8</span>
        </h1>
        <p className="game-subtitle">NEON EDITION</p>
        
        <div className="header-buttons">
          <button 
            className="header-btn" 
            onClick={() => setShowStats(true)}
            title="View Statistics"
          >
            📊
          </button>
          <button 
            className={`header-btn ${soundEnabled ? 'active' : ''}`}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button 
            className="header-btn new-game-btn"
            onClick={handleNewGame}
            title="New Game"
          >
            🔄 New
          </button>
        </div>
      </header>

      {/* Game Mode Selector */}
      <GameModeSelector currentMode={currentMode} onModeChange={handleModeChange} />

      {/* Score Board */}
      <ScoreBoard
        score={gameState.score}
        bestScore={gameState.bestScore}
        moveCount={gameState.moveCount}
        comboCount={gameState.comboCount}
        timeRemaining={gameState.timeRemaining}
        highestTile={highestTile}
      />

      {/* Game Board */}
      <div className="board-wrapper">
        <Board grid={gameState.grid} />
        <GameOverlay
          show={showWinOverlay}
          type="won"
          score={gameState.score}
          onNewGame={handleNewGame}
          onKeepPlaying={keepPlaying}
        />
        <GameOverlay
          show={showGameOverOverlay}
          type="gameover"
          score={gameState.score}
          onNewGame={handleNewGame}
        />
      </div>

      {/* Power-ups */}
      <PowerUps
        powerUps={powerUps}
        onUsePowerUp={handlePowerUp}
        disabled={gameState.gameOver && currentMode !== 'zen'}
      />

      {/* Instructions */}
      <div className="instructions">
        <p>Use <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> or <kbd>WASD</kbd> to move</p>
        <p>Swipe on mobile devices</p>
      </div>

      {/* Stats Panel */}
      <StatsPanel
        stats={stats}
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />
    </div>
  );
};

export default Game;
