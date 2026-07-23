'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
  loading?: boolean;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
  loading = false,
}: PageHeaderProps) {
  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between', className)}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="hidden size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 sm:flex">
            <Icon className="size-5" />
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-heading sm:text-2xl">{title}</h1>
          {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">{actions}</div>}
    </div>
  );
}
