'use client';

import { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:border-brand-200 hover:shadow-md',
          className,
        )}
      >
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-8 w-24" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/70 bg-card p-5 shadow-sm',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-heading sm:text-3xl">{value}</p>
          {(trend || description) && (
            <p className="mt-1 text-sm">
              {trend ? (
                <span className={trend.positive ? 'text-brand-600' : 'text-destructive'}>
                  {trend.positive ? '+' : ''}
                  {trend.value}% {trend.label}
                </span>
              ) : (
                <span className="text-muted-foreground">{description}</span>
              )}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 group-hover:text-brand-700">
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </div>
  );
}
