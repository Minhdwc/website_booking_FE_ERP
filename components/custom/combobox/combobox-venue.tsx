'use client';

import { useState } from 'react';
import { ChevronsUpDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ComboboxPopoverContent } from '@/components/custom/combobox/combobox-popover-content';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVenues } from '@/stores/queries/venue';

type ComboboxVenueProps = {
  value?: string;
  onChange: (venueId: string | undefined) => void;
};

export function ComboboxVenue({ value, onChange }: ComboboxVenueProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: venues, isLoading } = useVenues({
    limit: '200',
    search,
  });

  const selectedLabel = value ? venues!.find((venue) => venue.id === value)?.name : 'Tất cả cơ sở';
  if (isLoading && !value) {
    return <Skeleton className="h-9 w-full rounded-lg" />;
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSearch('');
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-9 w-full justify-between gap-1.5 rounded-lg border-border/80 bg-white px-2.5 text-sm font-normal shadow-none',
              'hover:border-emerald-200 hover:bg-emerald-50/60',
              open && 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-100',
            )}
          />
        }
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className={cn('truncate', !value && 'text-muted-foreground')}>{selectedLabel}</span>
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <ComboboxPopoverContent className="overflow-hidden rounded-lg border-border/80 shadow-md">
        <Command shouldFilter={false} value={value} className="rounded-none bg-transparent p-0.5">
          <CommandInput placeholder="Tìm cơ sở..." value={search} onValueChange={setSearch} />

          <CommandList className="max-h-44 p-0.5">
            <CommandEmpty className="py-4 text-muted-foreground">
              Không tìm thấy cơ sở.
            </CommandEmpty>

            <CommandGroup className="p-0">
              <CommandItem
                value="__all__"
                className={cn(
                  'rounded-md px-2 py-1.5 text-sm',
                  !value && 'bg-emerald-50 text-emerald-700',
                )}
                onSelect={() => {
                  onChange(undefined);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <span className="truncate font-medium">Tất cả cơ sở</span>
              </CommandItem>
              {venues!.map((venue) => {
                const isSelected = value === venue.id;

                return (
                  <CommandItem
                    key={venue.id}
                    value={venue.id}
                    className={cn(
                      'rounded-md px-2 py-1.5 text-sm',
                      isSelected && 'bg-emerald-50 text-emerald-700',
                    )}
                    onSelect={() => {
                      onChange(venue.id);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <span className="truncate font-medium">{venue.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </ComboboxPopoverContent>
    </Popover>
  );
}
