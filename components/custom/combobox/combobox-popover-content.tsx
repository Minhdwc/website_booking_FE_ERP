'use client';

import * as React from 'react';

import { PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const comboboxCollisionAvoidance = {
  side: 'shift',
  align: 'shift',
  fallbackAxisSide: 'none',
} as const;

type ComboboxPopoverContentProps = React.ComponentProps<typeof PopoverContent>;

export function ComboboxPopoverContent({
  className,
  side = 'bottom',
  align = 'start',
  collisionAvoidance = comboboxCollisionAvoidance,
  ...props
}: ComboboxPopoverContentProps) {
  return (
    <PopoverContent
      side={side}
      align={align}
      collisionAvoidance={collisionAvoidance}
      className={cn('w-(--anchor-width) p-0', className)}
      {...props}
    />
  );
}
