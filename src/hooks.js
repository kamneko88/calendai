import { useState, useEffect, useRef } from "react";

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