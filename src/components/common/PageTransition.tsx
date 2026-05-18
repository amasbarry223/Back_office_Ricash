'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouterStore } from '@/stores/router-store';

/**
 * PageTransition — Smooth page transition on route changes
 *
 * Fades out the current view and fades in the new one
 * when the route changes. Uses CSS animations defined
 * in animations.css (pageEnter / pageExit).
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const currentRoute = useRouterStore((s) => s.currentRoute);
  const [phase, setPhase] = useState<'enter' | 'exit' | 'idle'>('enter');
  const [displayChildren, setDisplayChildren] = useState(children);
  const prevRouteRef = useRef(currentRoute);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevRouteRef.current !== currentRoute) {
      prevRouteRef.current = currentRoute;

      // Start exit animation via timeout to avoid sync setState in effect
      exitTimerRef.current = setTimeout(() => {
        setPhase('exit');

        // After exit animation, swap content and play enter
        enterTimerRef.current = setTimeout(() => {
          setDisplayChildren(children);
          setPhase('enter');

          // After enter animation, go idle
          enterTimerRef.current = setTimeout(() => {
            setPhase('idle');
          }, 250);
        }, 150);
      }, 0);
    }
  }, [currentRoute, children]);

  // Initial mount animation
  useEffect(() => {
    enterTimerRef.current = setTimeout(() => {
      setPhase('idle');
    }, 250);

    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
    };
  }, []);

  return (
    <div
      className={
        phase === 'enter'
          ? 'page-enter'
          : phase === 'exit'
            ? 'page-exit'
            : ''
      }
    >
      {displayChildren}
    </div>
  );
}
