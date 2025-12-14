import { useEffect, useCallback, useRef } from 'react';
import type { RefObject } from 'react';
import type { Direction } from '../types/game';

interface UseTouchControlsOptions {
  onMove: (direction: Direction) => void;
  enabled?: boolean;
  threshold?: number;
  elementRef: RefObject<HTMLElement | null>;
}

export const useTouchControls = ({ 
  onMove, 
  enabled = true, 
  threshold = 50,
  elementRef,
}: UseTouchControlsOptions) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [enabled]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;
    
    // Prevent scrolling while swiping on the game board
    event.preventDefault();
  }, [enabled]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!enabled || !touchStartRef.current) {
      return;
    }

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
    const element = elementRef.current;
    if (!element) return;

    const options: AddEventListenerOptions = { passive: false };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, elementRef]);
};
