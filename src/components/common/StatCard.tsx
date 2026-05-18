'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCountUp } from '@/hooks/use-count-up';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  color: 'blue' | 'green' | 'orange' | 'red';
  loading?: boolean;
  /** Stagger index for mount animation (1-8) */
  stagger?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Enable count-up animation for numeric values */
  animateValue?: boolean;
}

const COLOR_MAP = {
  blue: {
    bg: 'bg-[var(--ricash-primary-bg)]',
    icon: 'text-[var(--ricash-primary)]',
    ring: 'ring-[var(--ricash-primary-border)]',
  },
  green: {
    bg: 'bg-[var(--ricash-success-bg)]',
    icon: 'text-[var(--ricash-success)]',
    ring: 'ring-[var(--ricash-success-border)]',
  },
  orange: {
    bg: 'bg-[var(--ricash-warning-bg)]',
    icon: 'text-[var(--ricash-warning)]',
    ring: 'ring-[var(--ricash-warning-border)]',
  },
  red: {
    bg: 'bg-[var(--ricash-danger-bg)]',
    icon: 'text-[var(--ricash-danger)]',
    ring: 'ring-[var(--ricash-danger-border)]',
  },
};

const TREND_CONFIG = {
  up: { color: 'text-[var(--ricash-success)]', bg: 'bg-[var(--ricash-success-bg)]', Icon: TrendingUp },
  down: { color: 'text-[var(--ricash-danger)]', bg: 'bg-[var(--ricash-danger-bg)]', Icon: TrendingDown },
  stable: { color: 'text-muted-foreground', bg: 'bg-muted', Icon: Minus },
};

export default function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  color,
  loading = false,
  stagger,
  animateValue = true,
}: StatCardProps) {
  const colorConfig = COLOR_MAP[color];

  // Count-up animation for numeric values
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedCount = useCountUp(
    numericValue,
    1200,
    animateValue && typeof value === 'number' && !loading
  );

  // Stagger delay for mount animation
  const staggerDelay = stagger ? (stagger - 1) * 60 : 0;

  if (loading) {
    return (
      <Card className="p-6 animate-in" style={{ animationDelay: `${staggerDelay}ms` }}>
        <div className="flex items-start justify-between mb-5">
          <div className="shimmer size-11 rounded-xl" />
          <div className="shimmer size-6 rounded-full" />
        </div>
        <div className="shimmer h-8 w-28 rounded-lg mb-2" />
        <div className="shimmer h-4 w-24 rounded" />
      </Card>
    );
  }

  const trendConfig = trend ? TREND_CONFIG[trend.direction] : null;
  const TrendIcon = trendConfig?.Icon;

  // Display value: animated count for numbers, raw string for strings
  const displayValue = typeof value === 'number'
    ? animatedCount.toLocaleString('fr-FR')
    : value;

  return (
    <Card
      interactive
      className="p-6 animate-in"
      style={{ animationDelay: `${staggerDelay}ms` }}
    >
      <div className="flex items-start justify-between mb-5">
        {/* Icon */}
        <div className={`flex items-center justify-center size-11 rounded-xl ring-1 ${colorConfig.bg} ${colorConfig.ring}`}>
          <span className={colorConfig.icon}>{icon}</span>
        </div>

        {/* Trend indicator */}
        {trend && TrendIcon && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trendConfig.color} ${trendConfig.bg}`}>
            <TrendIcon className="size-3.5" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Value with count-up animation */}
      <div className="space-y-1.5">
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {displayValue}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1.5">{unit}</span>}
        </p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </Card>
  );
}
