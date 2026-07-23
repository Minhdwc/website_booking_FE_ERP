'use client';

import { cn } from '@/lib/utils';

const SIZES = {
  sm: { ring: 'w-4 h-4', text: 'text-xs', dot: 'w-1.5 h-1.5', gap: 'gap-2' },
  md: { ring: 'w-8 h-8', text: 'text-sm', dot: 'w-2 h-2', gap: 'gap-3' },
  lg: { ring: 'w-12 h-12', text: 'text-base', dot: 'w-3 h-3', gap: 'gap-3' },
};

function Spinner({ size }: { size: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div
      className={cn(
        s.ring,
        'rounded-full border-[3px] border-border border-t-primary animate-spin',
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

function Dots({ size }: { size: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div className={cn('flex items-center', s.gap)} role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(s.dot, 'rounded-full bg-primary animate-bounce')}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function Bar() {
  return (
    <div
      className="w-48 h-1.5 rounded-full bg-muted overflow-hidden"
      role="status"
      aria-label="Loading"
    >
      <div className="h-full w-1/3 rounded-full bg-primary animate-[loadingBar_1.2s_ease-in-out_infinite]" />
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
      `}</style>
    </div>
  );
}

export default function Loading({
  variant = 'spinner',
  size = 'md',
  label,
  fullScreen = false,
  className,
}: {
  variant?: 'spinner' | 'dots' | 'bar';
  size?: keyof typeof SIZES;
  label?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  const s = SIZES[size];

  const content = (
    <div className={cn('flex flex-col items-center justify-center', s.gap)}>
      {variant === 'spinner' && <Spinner size={size} />}
      {variant === 'dots' && <Dots size={size} />}
      {variant === 'bar' && <Bar />}
      {label && <span className={cn(s.text, 'text-muted-foreground font-medium')}>{label}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className={cn('flex items-center justify-center p-6', className)}>{content}</div>;
}

export { Loading };

export function LoadingDemo() {
  return (
    <div className="min-h-screen bg-muted/50 flex flex-col items-center justify-center gap-10 p-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <Loading variant="spinner" label="Đang tải" />
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <Loading variant="dots" label="Vui lòng chờ" />
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <Loading variant="bar" label="Đang xử lý" />
        </div>
      </div>
      <div className="flex gap-6 items-center">
        <Loading variant="spinner" size="sm" />
        <Loading variant="spinner" size="md" />
        <Loading variant="spinner" size="lg" />
      </div>
    </div>
  );
}
