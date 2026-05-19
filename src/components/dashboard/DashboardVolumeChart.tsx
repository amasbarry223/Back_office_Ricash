'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatXOF } from '@/lib/format';

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name === 'montant' ? 'Montant' : 'Volume'} :{' '}
          {p.name === 'montant' ? formatXOF(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

interface DashboardVolumeChartProps {
  data: { date: string; montant: number; volume: number }[];
}

export default function DashboardVolumeChart({ data }: DashboardVolumeChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            yAxisId="montant"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} />
          <Line
            yAxisId="montant"
            type="monotone"
            dataKey="montant"
            name="montant"
            stroke="var(--ricash-primary)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--ricash-primary)' }}
          />
          <Line
            yAxisId="volume"
            type="monotone"
            dataKey="volume"
            name="volume"
            stroke="var(--ricash-blue-gray)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--ricash-blue-gray)' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-ricash-brand" />
          Montant (XOF)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-ricash-blue-gray" />
          Volume
        </span>
      </div>
    </div>
  );
}
