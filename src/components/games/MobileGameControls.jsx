'use client';
import { useEffect, useRef } from 'react';

export default function MobileGameControls() {
  const touchStart = useRef(null);

  useEffect(() => {
    function handleTouchStart(e) {
      // Ignore if user taps a button or link
      if (['BUTTON', 'A', 'INPUT', 'SELECT'].includes(e.target.tagName)) return;
      
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
      const THRESHOLD = 30; // Swipe distance

      // Check for Tap (short duration, small movement)
      if (Math.abs(deltaX) < THRESHOLD && Math.abs(deltaY) < THRESHOLD && duration < 300) {
        dispatchKey(' ', 'Space');
      } 
      // Check for Swipes
      else {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal Swipe
          if (deltaX > THRESHOLD) dispatchKey('ArrowRight', 'ArrowRight');
          else if (deltaX < -THRESHOLD) dispatchKey('ArrowLeft', 'ArrowLeft');
        } else {
          // Vertical Swipe
          if (deltaY > THRESHOLD) dispatchKey('ArrowDown', 'ArrowDown');
          else if (deltaY < -THRESHOLD) dispatchKey('ArrowUp', 'ArrowUp');
        }
      }
      
      touchStart.current = null;
    }

    function dispatchKey(key, code) {
      const event = new KeyboardEvent('keydown', {
        key: key,
        code: code,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(event);
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return null; 
}
