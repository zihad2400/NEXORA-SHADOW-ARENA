'use client';
import { useEffect, useRef } from 'react';

export default function MobileGameControls() {
  const touchStart = useRef(null);

  useEffect(() => {
    function handleTouchStart(e) {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }

    function handleTouchEnd(e) {
      if (!touchStart.current) return;
      
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };

      const deltaX = touchEnd.x - touchStart.current.x;
      const deltaY = touchEnd.y - touchStart.current.y;
      const duration = touchEnd.time - touchStart.current.time;

      // Minimum distance to be considered a swipe (30px)
      const SWIPE_THRESHOLD = 30;

      // Check for Tap (short duration, small movement)
      if (Math.abs(deltaX) < SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD && duration < 300) {
        dispatchKey('Space', 'Space');
      } 
      // Check for Swipes
      else {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal Swipe
          if (deltaX > SWIPE_THRESHOLD) dispatchKey('ArrowRight', 'ArrowRight');
          else if (deltaX < -SWIPE_THRESHOLD) dispatchKey('ArrowLeft', 'ArrowLeft');
        } else {
          // Vertical Swipe
          if (deltaY > SWIPE_THRESHOLD) dispatchKey('ArrowDown', 'ArrowDown');
          else if (deltaY < -SWIPE_THRESHOLD) dispatchKey('ArrowUp', 'ArrowUp');
        }
      }
      
      touchStart.current = null;
    }

    function dispatchKey(key, code) {
      // Create and dispatch a real keyboard event
      const event = new KeyboardEvent('keydown', {
        key: key,
        code: code,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
    }

    // Attach to document body so it works over the canvas
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // This is a logic-only component, no UI
  return null; 
}
