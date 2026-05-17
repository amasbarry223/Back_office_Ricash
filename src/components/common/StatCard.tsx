'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
}

const COLOR_MAP = {
  blue: {
    bg: 'bg-[var(--ricash-primary)]/10',
    icon: 'text-[var(--ricash-primary)]',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
  },
};

const TREND_COLORS = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  stable: 'text-muted-foreground',
};

export default function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  color,
  loading = false,
}: StatCardProps) {
  const colorConfig = COLOR_MAP[color];

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 ricash-card-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="shimmer size-10 rounded-lg" />
          <div className="shimmer size-5 rounded" />
        </div>
        <div className="shimmer h-8 w-24 rounded mb-2" />
        <div className="shimmer h-4 w-20 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 ricash-card-shadow hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center justify-center size-10 rounded-lg ${colorConfig.bg}`}>
          <span className={colorConfig.icon}>{icon}</span>
        </div>
        {trend && trend.direction !== 'stable' && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${TREND_COLORS[trend.direction]}`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
        {trend && trend.direction === 'stable' && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${TREND_COLORS.stable}`}>
            <Minus className="size-3.5" />
            <span>0%</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}
