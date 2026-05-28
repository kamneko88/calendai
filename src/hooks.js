import { useState, useEffect, useRef, useCallback } from "react";

export function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return width;
}

export function useSwipe(onSwipeLeft, onSwipeRight) {
  const startX = useRef(null);
  const handleTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (startX.current === null) return;
    const diff = startX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onSwipeLeft();
      else onSwipeRight();
    }
    startX.current = null;
  };
  return { onTouchStart: handleTouchStart, onTouchEnd: handleTouchEnd };
}

export function useModalAnimation(onClose, duration = 200) {
  const [phase, setPhase] = useState('in');

  const close = useCallback(() => {
    setPhase('out');
    setTimeout(() => onClose(), duration);
  }, [onClose, duration]);

  const overlayAnim = {
    animation: phase === 'in'
      ? 'calOverlayIn 0.2s ease forwards'
      : 'calOverlayOut 0.2s ease forwards',
  };

  const contentAnim = {
    animation: phase === 'in'
      ? 'calModalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
      : 'calModalOut 0.18s ease forwards',
  };

  return { close, overlayAnim, contentAnim };
}