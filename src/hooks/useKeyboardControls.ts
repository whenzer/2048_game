import { useEffect, useCallback } from 'react';
import type { Direction } from '../types/game';

interface UseKeyboardControlsOptions {
  onMove: (direction: Direction) => void;
  enabled?: boolean;
}

export const useKeyboardControls = ({ onMove, enabled = true }: UseKeyboardControlsOptions) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Map arrow keys and WASD to directions
    const keyMap: Record<string, Direction> = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      W: 'up',
      s: 'down',
      S: 'down',
      a: 'left',
      A: 'left',
      d: 'right',
      D: 'right',
    };

    const direction = keyMap[event.key];
    if (direction) {
      event.preventDefault();
      onMove(direction);
    }
  }, [onMove, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
