import React, { useMemo } from 'react';
import type { GridState } from '../types/game';
import { getAllTiles } from '../utils/gameLogic';
import Tile from './Tile';
import './Board.css';

interface BoardProps {
  grid: GridState;
}

const Board: React.FC<BoardProps> = ({ grid }) => {
  const tiles = useMemo(() => getAllTiles(grid), [grid]);

  const gridCells = useMemo(() => {
    const cells = [];
    for (let y = 0; y < grid.size; y++) {
      for (let x = 0; x < grid.size; x++) {
        cells.push(
          <div
            key={`cell-${x}-${y}`}
            className="grid-cell"
            style={{
              width: `calc(${100 / grid.size}% - 12px)`,
              height: `calc(${100 / grid.size}% - 12px)`,
              left: `calc(${(x * 100) / grid.size}% + 6px)`,
              top: `calc(${(y * 100) / grid.size}% + 6px)`,
            }}
          />
        );
      }
    }
    return cells;
  }, [grid.size]);

  return (
    <div className="board-container">
      <div className="board">
        <div className="grid-container">
          {gridCells}
        </div>
        <div className="tile-container">
          {tiles.map((tile) => (
            <Tile key={tile.id} tile={tile} gridSize={grid.size} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Board);
