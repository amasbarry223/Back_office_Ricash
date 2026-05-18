'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp — Animated number counter for stats/KPIs
 *
 * Uses requestAnimationFrame for 60fps-smooth counting.
 * Respects prefers-reduced-motion by snapping instantly.
 */
export function useCountUp(
  target: number,
  duration: number = 1200,
  enabled: boolean = true
): number {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // If disabled or target is 0, defer showing target
    if (!enabled || target === 0) {
      requestAnimationFrame(() => setCount(target));
      return;
    }

    // Check for reduced motion preference
    const prefersReduced = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    if (prefersReduced) {
      requestAnimationFrame(() => setCount(target));
      return;
    }

    // Start from 0 and animate
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      setCount(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, duration, enabled]);

  return count;
}
