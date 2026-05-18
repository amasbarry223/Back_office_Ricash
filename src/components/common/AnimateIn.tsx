'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * AnimateIn — Mount animation wrapper
 *
 * Wraps children with a fadeInUp animation on mount.
 * Supports staggered delays for list items.
 *
 * @param delay      Custom delay in ms (overrides stagger)
 * @param stagger    Stagger index (1-8) for cascaded list items
 * @param className  Additional classes
 * @param as         Element type (default: 'div')
 * @param once       Whether to animate only once (default: true)
 */

interface AnimateInProps {
  children: React.ReactNode;
  delay?: number;
  stagger?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  className?: string;
  as?: React.ElementType;
  once?: boolean;
}

export default function AnimateIn({
  children,
  delay,
  stagger,
  className,
  as: Comp = 'div',
  once = true,
}: AnimateInProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Small rAF delay to ensure DOM is painted before animating
    const id = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Compute the delay class or inline style
  const delayMs = delay ?? (stagger ? (stagger - 1) * 50 : 0);

  return (
    <Comp
      ref={ref as React.RefObject<HTMLElement>}
      className={cn(
        'animate-in',
        className
      )}
      style={{
        animationDelay: `${delayMs}ms`,
        animationFillMode: 'both',
        // When not yet visible, keep opacity 0 to prevent flash
        opacity: visible ? undefined : 0,
      }}
    >
      {children}
    </Comp>
  );
}
