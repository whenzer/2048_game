import React, { useMemo } from 'react';
import type { TileData } from '../types/game';
import './Tile.css';

interface TileProps {
  tile: TileData;
  gridSize: number;
}

// Color scheme for different tile values - Cyberpunk/Neon theme
const getTileColors = (value: number): { background: string; color: string; glow: string } => {
  const colors: Record<number, { background: string; color: string; glow: string }> = {
    2: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#00fff5', glow: '0 0 20px rgba(0, 255, 245, 0.5)' },
    4: { background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)', color: '#00d4ff', glow: '0 0 20px rgba(0, 212, 255, 0.5)' },
    8: { background: 'linear-gradient(135deg, #0f3460 0%, #533483 100%)', color: '#ffffff', glow: '0 0 25px rgba(83, 52, 131, 0.7)' },
    16: { background: 'linear-gradient(135deg, #533483 0%, #e94560 100%)', color: '#ffffff', glow: '0 0 25px rgba(233, 69, 96, 0.7)' },
    32: { background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)', color: '#ffffff', glow: '0 0 30px rgba(233, 69, 96, 0.8)' },
    64: { background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', color: '#1a1a2e', glow: '0 0 30px rgba(254, 202, 87, 0.8)' },
    128: { background: 'linear-gradient(135deg, #feca57 0%, #48dbfb 100%)', color: '#1a1a2e', glow: '0 0 35px rgba(72, 219, 251, 0.8)' },
    256: { background: 'linear-gradient(135deg, #48dbfb 0%, #0abde3 100%)', color: '#1a1a2e', glow: '0 0 35px rgba(10, 189, 227, 0.9)' },
    512: { background: 'linear-gradient(135deg, #0abde3 0%, #10ac84 100%)', color: '#ffffff', glow: '0 0 40px rgba(16, 172, 132, 0.9)' },
    1024: { background: 'linear-gradient(135deg, #10ac84 0%, #00d9ff 100%)', color: '#ffffff', glow: '0 0 45px rgba(0, 217, 255, 1)' },
    2048: { background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 50%, #ff00ff 100%)', color: '#ffffff', glow: '0 0 50px rgba(255, 0, 255, 1), 0 0 100px rgba(0, 255, 255, 0.5)' },
    4096: { background: 'linear-gradient(135deg, #ff0080 0%, #7928ca 50%, #ff0080 100%)', color: '#ffffff', glow: '0 0 60px rgba(255, 0, 128, 1), 0 0 120px rgba(121, 40, 202, 0.6)' },
    8192: { background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)', color: '#ffffff', glow: '0 0 70px rgba(241, 39, 17, 1)' },
  };

  // For values beyond 8192, use a special rainbow effect
  if (!colors[value]) {
    const hue = (Math.log2(value) * 30) % 360;
    return {
      background: `linear-gradient(135deg, hsl(${hue}, 100%, 50%) 0%, hsl(${(hue + 60) % 360}, 100%, 50%) 100%)`,
      color: '#ffffff',
      glow: `0 0 80px hsla(${hue}, 100%, 50%, 1)`,
    };
  }

  return colors[value];
};

const Tile: React.FC<TileProps> = ({ tile, gridSize }) => {
  const { value, position, previousPosition, mergedFrom, isNew } = tile;

  const tileSize = useMemo(() => {
    const baseSize = 100 / gridSize;
    return `calc(${baseSize}% - 12px)`;
  }, [gridSize]);

  const tilePosition = useMemo(() => {
    const baseSize = 100 / gridSize;
    return {
      left: `calc(${position.x * baseSize}% + 6px)`,
      top: `calc(${position.y * baseSize}% + 6px)`,
    };
  }, [position, gridSize]);

  const colors = useMemo(() => getTileColors(value), [value]);

  const animationClass = useMemo(() => {
    if (isNew) return 'tile-new';
    if (mergedFrom) return 'tile-merged';
    if (previousPosition && (previousPosition.x !== position.x || previousPosition.y !== position.y)) {
      return 'tile-moving';
    }
    return '';
  }, [isNew, mergedFrom, previousPosition, position]);

  const fontSize = useMemo(() => {
    if (value < 100) return '2.5rem';
    if (value < 1000) return '2rem';
    if (value < 10000) return '1.5rem';
    return '1.2rem';
  }, [value]);

  return (
    <div
      className={`tile ${animationClass} ${value >= 2048 ? 'tile-super' : ''}`}
      style={{
        width: tileSize,
        height: tileSize,
        left: tilePosition.left,
        top: tilePosition.top,
        background: colors.background,
        color: colors.color,
        boxShadow: colors.glow,
        fontSize,
      }}
    >
      <span className="tile-value">{value}</span>
    </div>
  );
};

export default React.memo(Tile);
