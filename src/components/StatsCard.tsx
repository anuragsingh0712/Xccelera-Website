import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatsCard({ title, value, subtitle, icon, iconBg = 'bg-primary/10', trend }: StatsCardProps) {
  return (
    <div className="bg-surface rounded-card p-5 shadow-card flex items-start gap-4">
      <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wide mb-1">{title}</p>
        <p className="text-2xl font-bold text-ink">{value}</p>
        {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trend.positive ? 'text-success' : 'text-danger'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
