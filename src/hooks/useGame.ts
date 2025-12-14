import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Direction, GameMode, GameHistory, GameStats, PowerUp } from '../types/game';
import {
  initializeGame,
  move,
  addRandomTile,
  movesAvailable,
  hasWon,
  cloneGrid,
  undoMove,
  shuffleTiles,
  removeLowestTile,
  bombTiles,
  saveBestScore,
  loadGameStats,
  saveGameStats,
  updateGameStats,
  calculateComboMultiplier,
  getHighestTile,
} from '../utils/gameLogic';

const INITIAL_POWER_UPS: PowerUp[] = [
  { id: 'undo', name: 'Undo', icon: '↩️', description: 'Undo last move', uses: 3, maxUses: 3, cooldown: 0, currentCooldown: 0 },
  { id: 'shuffle', name: 'Shuffle', icon: '🔀', description: 'Shuffle all tiles', uses: 2, maxUses: 2, cooldown: 5, currentCooldown: 0 },
  { id: 'remove', name: 'Remove', icon: '🗑️', description: 'Remove lowest tile', uses: 3, maxUses: 3, cooldown: 3, currentCooldown: 0 },
  { id: 'bomb', name: 'Bomb', icon: '💣', description: 'Remove all lowest value tiles', uses: 1, maxUses: 1, cooldown: 10, currentCooldown: 0 },
];

interface UseGameOptions {
  gridSize?: number;
  gameMode?: GameMode;
  onMove?: () => void;
  onMerge?: (value: number) => void;
  onWin?: () => void;
  onGameOver?: () => void;
}

export const useGame = (options: UseGameOptions = {}) => {
  const { gridSize = 4, gameMode = 'classic', onMove, onMerge, onWin, onGameOver } = options;

  const [gameState, setGameState] = useState<GameState>(() => initializeGame(gridSize, gameMode));
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>(INITIAL_POWER_UPS);
  const [stats, setStats] = useState<GameStats>(() => loadGameStats());
  const [isAnimating, setIsAnimating] = useState(false);
  const [comboTimer, setComboTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Time attack mode timer
  useEffect(() => {
    if (gameMode !== 'timeAttack' || !gameState.startTime || gameState.gameOver || gameState.won) {
      return;
    }

    const interval = setInterval(() => {
      setGameState(prev => {
        const elapsed = (Date.now() - (prev.startTime || Date.now())) / 1000;
        const remaining = Math.max(0, 120 - elapsed);
        
        if (remaining <= 0 && !prev.gameOver) {
          onGameOver?.();
          return { ...prev, timeRemaining: 0, gameOver: true };
        }
        
        return { ...prev, timeRemaining: remaining };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameMode, gameState.startTime, gameState.gameOver, gameState.won, onGameOver]);

  // Save best score when it changes
  useEffect(() => {
    if (gameState.score > gameState.bestScore) {
      setGameState(prev => ({ ...prev, bestScore: prev.score }));
      saveBestScore(gameState.score);
    }
  }, [gameState.score, gameState.bestScore]);

  // Handle move
  const handleMove = useCallback((direction: Direction) => {
    if (isAnimating) return;
    if (gameState.gameOver && gameMode !== 'zen') return;
    if (gameState.won && !gameState.keepPlaying) return;

    setIsAnimating(true);

    // Save current state to history (for undo)
    const historyEntry: GameHistory = {
      grid: cloneGrid(gameState.grid),
      score: gameState.score,
      moveCount: gameState.moveCount,
    };

    const { grid: newGrid, score: moveScore, moved, mergeCount, maxMergeValue } = move(
      cloneGrid(gameState.grid),
      direction
    );

    if (moved) {
      // Add to history (limit to 10 entries)
      setHistory(prev => [...prev.slice(-9), historyEntry]);

      // Reduce power-up cooldowns
      setPowerUps(prev => prev.map(p => ({
        ...p,
        currentCooldown: Math.max(0, p.currentCooldown - 1),
      })));

      // Handle combo
      let newComboCount = gameState.comboCount;
      if (mergeCount > 0) {
        // Clear existing combo timer
        if (comboTimer) {
          clearTimeout(comboTimer);
        }

        newComboCount = gameState.comboCount + mergeCount;
        
        // Set new combo timer (combo resets after 2 seconds of no merges)
        const timer = setTimeout(() => {
          setGameState(prev => ({ ...prev, comboCount: 0 }));
        }, 2000);
        setComboTimer(timer);

        onMerge?.(maxMergeValue);
      }

      // Calculate score with combo multiplier
      const multiplier = calculateComboMultiplier(newComboCount);
      const bonusScore = Math.floor(moveScore * multiplier);

      // Add a new random tile
      addRandomTile(newGrid);

      const won = hasWon(newGrid);
      const gameOver = gameMode !== 'zen' && !movesAvailable(newGrid);

      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        score: prev.score + bonusScore,
        moveCount: prev.moveCount + 1,
        won: won || prev.won,
        gameOver,
        comboCount: newComboCount,
        lastMergeValue: maxMergeValue || prev.lastMergeValue,
      }));

      if (won && !gameState.won) {
        onWin?.();
      }

      if (gameOver) {
        // Update stats
        const newStats = updateGameStats(stats, gameStateRef.current, won, mergeCount);
        setStats(newStats);
        saveGameStats(newStats);
        onGameOver?.();
      }

      onMove?.();
    }

    setTimeout(() => setIsAnimating(false), 150);
  }, [gameState, gameMode, isAnimating, comboTimer, stats, onMove, onMerge, onWin, onGameOver]);

  // Use power-up
  const usePowerUp = useCallback((powerUpId: string) => {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp || powerUp.uses <= 0 || powerUp.currentCooldown > 0) return false;

    let success = false;

    switch (powerUpId) {
      case 'undo': {
        const result = undoMove(history, gameState);
        if (result) {
          setGameState(result.state);
          setHistory(result.history);
          success = true;
        }
        break;
      }
      case 'shuffle': {
        const newGrid = shuffleTiles(cloneGrid(gameState.grid));
        setGameState(prev => ({ ...prev, grid: newGrid }));
        success = true;
        break;
      }
      case 'remove': {
        const newGrid = removeLowestTile(cloneGrid(gameState.grid));
        setGameState(prev => ({ ...prev, grid: newGrid }));
        success = true;
        break;
      }
      case 'bomb': {
        const { grid: newGrid, removedCount } = bombTiles(cloneGrid(gameState.grid));
        if (removedCount > 0) {
          setGameState(prev => ({ ...prev, grid: newGrid }));
          success = true;
        }
        break;
      }
    }

    if (success) {
      setPowerUps(prev => prev.map(p => 
        p.id === powerUpId 
          ? { ...p, uses: p.uses - 1, currentCooldown: p.cooldown }
          : p
      ));
    }

    return success;
  }, [powerUps, history, gameState]);

  // Start new game
  const newGame = useCallback((mode?: GameMode) => {
    // Update stats before starting new game
    if (gameState.moveCount > 0) {
      const won = hasWon(gameState.grid);
      const newStats = updateGameStats(stats, gameState, won, 0);
      setStats(newStats);
      saveGameStats(newStats);
    }

    setGameState(initializeGame(gridSize, mode || gameMode));
    setHistory([]);
    setPowerUps(INITIAL_POWER_UPS);
    if (comboTimer) {
      clearTimeout(comboTimer);
    }
    setComboTimer(null);
  }, [gridSize, gameMode, gameState, stats, comboTimer]);

  // Continue playing after winning
  const keepPlaying = useCallback(() => {
    setGameState(prev => ({ ...prev, keepPlaying: true, won: false }));
  }, []);

  // Get highest tile value
  const highestTile = getHighestTile(gameState.grid);

  return {
    gameState,
    powerUps,
    stats,
    highestTile,
    isAnimating,
    handleMove,
    usePowerUp,
    newGame,
    keepPlaying,
  };
};
