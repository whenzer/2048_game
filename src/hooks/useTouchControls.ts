import { useEffect, useCallback, useRef } from 'react';
import type { Direction } from '../types/game';

interface UseTouchControlsOptions {
  onMove: (direction: Direction) => void;
  enabled?: boolean;
  threshold?: number;
}

export const useTouchControls = ({ 
  onMove, 
  enabled = true, 
  threshold = 50 
}: UseTouchControlsOptions) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [enabled]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Only trigger if swipe is significant enough
    if (Math.max(absDeltaX, absDeltaY) < threshold) {
      touchStartRef.current = null;
      return;
    }

    let direction: Direction;

    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'down' : 'up';
    }

    event.preventDefault();
    onMove(direction);
    touchStartRef.current = null;
  }, [onMove, enabled, threshold]);

  useEffect(() => {
    const options: AddEventListenerOptions = { passive: false };
    
    window.addEventListener('touchstart', handleTouchStart, options);
    window.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);
};
