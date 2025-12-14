export interface Position {
  x: number;
  y: number;
}

export interface TileData {
  id: string;
  value: number;
  position: Position;
  previousPosition?: Position;
  mergedFrom?: TileData[];
  isNew?: boolean;
  isMoving?: boolean;
}

export interface GridState {
  size: number;
  cells: (TileData | null)[][];
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameMode = 'classic' | 'timeAttack' | 'zen';

export interface GameState {
  grid: GridState;
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
  keepPlaying: boolean;
  moveCount: number;
  startTime: number | null;
  timeRemaining: number | null;
  gameMode: GameMode;
  comboCount: number;
  lastMergeValue: number;
}

export interface PowerUp {
  id: string;
  name: string;
  icon: string;
  description: string;
  uses: number;
  maxUses: number;
  cooldown: number;
  currentCooldown: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  highestTile: number;
  totalMoves: number;
  totalMerges: number;
  longestCombo: number;
  fastestWin: number | null;
}

export interface GameHistory {
  grid: GridState;
  score: number;
  moveCount: number;
}
