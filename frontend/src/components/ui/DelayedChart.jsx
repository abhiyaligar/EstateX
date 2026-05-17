import React, { useState, useEffect } from 'react';

export const DelayedChart = ({ children, delay = 50 }) => {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // Delay rendering of Recharts components until the DOM layout has fully resolved
    // This prevents the "width(-1) and height(-1)" ResizeObserver warnings
    const timer = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!ready) return null;
  return children;
};
