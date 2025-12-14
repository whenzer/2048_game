import type { TileData, Position, GridState, Direction, GameState, GameHistory, GameMode, GameStats } from '../types/game';

// Generate unique IDs for tiles
let tileIdCounter = 0;
const generateTileId = (): string => {
  return `tile-${++tileIdCounter}`;
};

// Create an empty grid
export const createEmptyGrid = (size: number): GridState => {
  const cells: (TileData | null)[][] = [];
  for (let x = 0; x < size; x++) {
    cells[x] = [];
    for (let y = 0; y < size; y++) {
      cells[x][y] = null;
    }
  }
  return { size, cells };
};

// Clone the grid for history
export const cloneGrid = (grid: GridState): GridState => {
  const cells: (TileData | null)[][] = [];
  for (let x = 0; x < grid.size; x++) {
    cells[x] = [];
    for (let y = 0; y < grid.size; y++) {
      const tile = grid.cells[x][y];
      if (tile) {
        cells[x][y] = {
          ...tile,
          previousPosition: tile.previousPosition ? { ...tile.previousPosition } : undefined,
          mergedFrom: tile.mergedFrom ? [...tile.mergedFrom] : undefined,
        };
      } else {
        cells[x][y] = null;
      }
    }
  }
  return { size: grid.size, cells };
};

// Get all available cells
export const getAvailableCells = (grid: GridState): Position[] => {
  const cells: Position[] = [];
  for (let x = 0; x < grid.size; x++) {
    for (let y = 0; y < grid.size; y++) {
      if (!grid.cells[x][y]) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
};

// Get all tiles
export const getAllTiles = (grid: GridState): TileData[] => {
  const tiles: TileData[] = [];
  for (let x = 0; x < grid.size; x++) {
    for (let y = 0; y < grid.size; y++) {
      if (grid.cells[x][y]) {
        tiles.push(grid.cells[x][y]!);
      }
    }
  }
  return tiles;
};

// Add a random tile to the grid
export const addRandomTile = (grid: GridState): TileData | null => {
  const availableCells = getAvailableCells(grid);
  if (availableCells.length === 0) return null;

  const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  
  const tile: TileData = {
    id: generateTileId(),
    value,
    position: randomCell,
    isNew: true,
  };

  grid.cells[randomCell.x][randomCell.y] = tile;
  return tile;
};

// Get the direction vector
const getVector = (direction: Direction): Position => {
  const vectors: Record<Direction, Position> = {
    up: { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
  };
  return vectors[direction];
};

// Build traversal order based on direction
const buildTraversals = (size: number, vector: Position): { x: number[]; y: number[] } => {
  const traversals = {
    x: [] as number[],
    y: [] as number[],
  };

  for (let pos = 0; pos < size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  if (vector.x === 1) traversals.x.reverse();
  if (vector.y === 1) traversals.y.reverse();

  return traversals;
};

// Check if position is within bounds
const withinBounds = (position: Position, size: number): boolean => {
  return position.x >= 0 && position.x < size && position.y >= 0 && position.y < size;
};

// Find the farthest position a tile can move to
const findFarthestPosition = (
  grid: GridState,
  cell: Position,
  vector: Position
): { farthest: Position; next: Position | null } => {
  let previous: Position;
  let current = cell;

  do {
    previous = current;
    current = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (
    withinBounds(current, grid.size) &&
    !grid.cells[current.x][current.y]
  );

  return {
    farthest: previous,
    next: withinBounds(current, grid.size) ? current : null,
  };
};

// Move tiles in a direction
export const move = (
  grid: GridState,
  direction: Direction
): { grid: GridState; score: number; moved: boolean; mergeCount: number; maxMergeValue: number } => {
  const vector = getVector(direction);
  const traversals = buildTraversals(grid.size, vector);
  let score = 0;
  let moved = false;
  let mergeCount = 0;
  let maxMergeValue = 0;

  // Reset merged flags and save positions
  for (let x = 0; x < grid.size; x++) {
    for (let y = 0; y < grid.size; y++) {
      const tile = grid.cells[x][y];
      if (tile) {
        tile.mergedFrom = undefined;
        tile.isNew = false;
        tile.previousPosition = { ...tile.position };
      }
    }
  }

  // Traverse the grid and move tiles
  traversals.x.forEach((x) => {
    traversals.y.forEach((y) => {
      const cell = { x, y };
      const tile = grid.cells[x][y];

      if (tile) {
        const { farthest, next } = findFarthestPosition(grid, cell, vector);
        const nextTile = next ? grid.cells[next.x][next.y] : null;

        // Check for merge
        if (nextTile && nextTile.value === tile.value && !nextTile.mergedFrom) {
          // Merge tiles
          const mergedValue = tile.value * 2;
          const merged: TileData = {
            id: generateTileId(),
            value: mergedValue,
            position: next!,
            previousPosition: tile.position,
            mergedFrom: [tile, nextTile],
          };

          // Remove old tiles
          grid.cells[x][y] = null;
          grid.cells[next!.x][next!.y] = merged;

          // Update tile position for animation
          tile.position = next!;

          score += mergedValue;
          mergeCount++;
          maxMergeValue = Math.max(maxMergeValue, mergedValue);
          moved = true;
        } else if (farthest.x !== x || farthest.y !== y) {
          // Move tile to farthest position
          grid.cells[x][y] = null;
          grid.cells[farthest.x][farthest.y] = tile;
          tile.position = farthest;
          moved = true;
        }
      }
    });
  });

  return { grid, score, moved, mergeCount, maxMergeValue };
};

// Check if any moves are available
export const movesAvailable = (grid: GridState): boolean => {
  // Check for empty cells
  if (getAvailableCells(grid).length > 0) return true;

  // Check for adjacent matches
  for (let x = 0; x < grid.size; x++) {
    for (let y = 0; y < grid.size; y++) {
      const tile = grid.cells[x][y];
      if (tile) {
        // Check right and down neighbors
        const neighbors = [
          { x: x + 1, y },
          { x, y: y + 1 },
        ];

        for (const neighbor of neighbors) {
          if (withinBounds(neighbor, grid.size)) {
            const neighborTile = grid.cells[neighbor.x][neighbor.y];
            if (neighborTile && neighborTile.value === tile.value) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
};

// Check if the game is won (has 2048 tile)
export const hasWon = (grid: GridState): boolean => {
  for (let x = 0; x < grid.size; x++) {
    for (let y = 0; y < grid.size; y++) {
      const tile = grid.cells[x][y];
      if (tile && tile.value >= 2048) {
        return true;
      }
    }
  }
  return false;
};

// Get highest tile value
export const getHighestTile = (grid: GridState): number => {
  let highest = 0;
  for (let x = 0; x < grid.size; x++) {
    for (let y = 0; y < grid.size; y++) {
      const tile = grid.cells[x][y];
      if (tile && tile.value > highest) {
        highest = tile.value;
      }
    }
  }
  return highest;
};

// Initialize a new game
export const initializeGame = (size: number = 4, mode: GameMode = 'classic'): GameState => {
  const grid = createEmptyGrid(size);
  addRandomTile(grid);
  addRandomTile(grid);

  return {
    grid,
    score: 0,
    bestScore: loadBestScore(),
    gameOver: false,
    won: false,
    keepPlaying: false,
    moveCount: 0,
    startTime: Date.now(),
    timeRemaining: mode === 'timeAttack' ? 120 : null, // 2 minutes for time attack
    gameMode: mode,
    comboCount: 0,
    lastMergeValue: 0,
  };
};

// Power-up: Undo (restore from history)
export const undoMove = (history: GameHistory[], currentState: GameState): { state: GameState; history: GameHistory[] } | null => {
  if (history.length === 0) return null;

  const previousState = history[history.length - 1];
  const newHistory = history.slice(0, -1);

  return {
    state: {
      ...currentState,
      grid: cloneGrid(previousState.grid),
      score: previousState.score,
      moveCount: previousState.moveCount,
      gameOver: false,
    },
    history: newHistory,
  };
};

// Power-up: Shuffle tiles
export const shuffleTiles = (grid: GridState): GridState => {
  const tiles = getAllTiles(grid);
  const positions = tiles.map(t => ({ ...t.position }));
  
  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Create new grid
  const newGrid = createEmptyGrid(grid.size);
  tiles.forEach((tile, index) => {
    const newTile: TileData = {
      ...tile,
      position: positions[index],
      previousPosition: tile.position,
      isNew: false,
    };
    newGrid.cells[positions[index].x][positions[index].y] = newTile;
  });

  return newGrid;
};

// Power-up: Remove lowest tile
export const removeLowestTile = (grid: GridState): GridState => {
  const tiles = getAllTiles(grid);
  if (tiles.length === 0) return grid;

  // Find the lowest value
  const minValue = Math.min(...tiles.map(t => t.value));
  const lowestTiles = tiles.filter(t => t.value === minValue);
  
  // Remove one random lowest tile
  const tileToRemove = lowestTiles[Math.floor(Math.random() * lowestTiles.length)];
  grid.cells[tileToRemove.position.x][tileToRemove.position.y] = null;

  return grid;
};

// Power-up: Bomb (remove all tiles of a specific low value)
export const bombTiles = (grid: GridState): { grid: GridState; removedCount: number } => {
  const tiles = getAllTiles(grid);
  if (tiles.length === 0) return { grid, removedCount: 0 };

  // Find the two lowest unique values
  const uniqueValues = [...new Set(tiles.map(t => t.value))].sort((a, b) => a - b);
  const targetValue = uniqueValues[0]; // Remove all of the lowest value

  let removedCount = 0;
  tiles.forEach(tile => {
    if (tile.value === targetValue) {
      grid.cells[tile.position.x][tile.position.y] = null;
      removedCount++;
    }
  });

  return { grid, removedCount };
};

// Local storage helpers
const STORAGE_KEYS = {
  BEST_SCORE: '2048_best_score',
  GAME_STATE: '2048_game_state',
  GAME_STATS: '2048_game_stats',
  SETTINGS: '2048_settings',
};

export const loadBestScore = (): number => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.BEST_SCORE);
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
};

export const saveBestScore = (score: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BEST_SCORE, score.toString());
  } catch {
    // Storage not available
  }
};

export const loadGameStats = (): GameStats => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Storage not available
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    highestTile: 0,
    totalMoves: 0,
    totalMerges: 0,
    longestCombo: 0,
    fastestWin: null,
  };
};

export const saveGameStats = (stats: GameStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
  } catch {
    // Storage not available
  }
};

export const updateGameStats = (
  stats: GameStats,
  gameState: GameState,
  won: boolean,
  mergeCount: number
): GameStats => {
  const newStats = { ...stats };
  newStats.gamesPlayed++;
  newStats.totalScore += gameState.score;
  newStats.totalMoves += gameState.moveCount;
  newStats.totalMerges += mergeCount;
  
  const highestTile = getHighestTile(gameState.grid);
  if (highestTile > newStats.highestTile) {
    newStats.highestTile = highestTile;
  }

  if (won) {
    newStats.gamesWon++;
    if (gameState.startTime) {
      const gameTime = (Date.now() - gameState.startTime) / 1000;
      if (!newStats.fastestWin || gameTime < newStats.fastestWin) {
        newStats.fastestWin = gameTime;
      }
    }
  }

  return newStats;
};

// Combo system
export const calculateComboMultiplier = (comboCount: number): number => {
  if (comboCount <= 1) return 1;
  if (comboCount <= 3) return 1.5;
  if (comboCount <= 5) return 2;
  if (comboCount <= 10) return 3;
  return 4;
};
