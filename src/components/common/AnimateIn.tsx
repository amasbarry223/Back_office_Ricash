'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * AnimateIn — Mount animation wrapper
 *
 * Wraps children with a fadeInUp animation on mount.
 * Supports staggered delays for list items.
 */

interface AnimateInProps {
  children: React.ReactNode;
  delay?: number;
  stagger?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  className?: string;
  as?: React.ElementType;
}

export default function AnimateIn({
  children,
  delay,
  stagger,
  className,
  as: Comp = 'div',
}: AnimateInProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const delayMs = delay ?? (stagger ? (stagger - 1) * 50 : 0);

  return (
    <Comp
      className={cn('animate-in', className)}
      style={{
        animationDelay: `${delayMs}ms`,
        animationFillMode: 'both',
        opacity: visible ? undefined : 0,
      }}
    >
      {children}
    </Comp>
  );
}
