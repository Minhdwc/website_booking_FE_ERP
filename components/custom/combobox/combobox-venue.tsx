'use client';

import { useState } from 'react';
import { Building2Icon, ChevronsUpDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVenue, useVenues } from '@/stores/queries/venue.query';

type ComboboxVenueProps = {
  value?: string;
  onChange: (venueId: string) => void;
};

export function ComboboxVenue({ value, onChange }: ComboboxVenueProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useVenues({
    limit: '200',
    search,
  });
  const { data: selectedVenue } = useVenue(value || '');

  const venues = data || [];
  const selectedLabel = selectedVenue?.name ?? venues.find((venue) => venue.id === value)?.name;

  if (isLoading && venues.length === 0 && !value) {
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
          <Building2Icon className="size-3.5 shrink-0 text-emerald-600" />
          <span className={cn('truncate', !selectedLabel && 'text-muted-foreground')}>
            {selectedLabel || 'Chọn cơ sở...'}
          </span>
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent
        className="w-(--anchor-width) overflow-hidden rounded-lg border-border/80 p-0 shadow-md"
        align="start"
      >
        <Command shouldFilter={false} value={value} className="rounded-none bg-transparent p-0.5">
          <CommandInput placeholder="Tìm cơ sở..." value={search} onValueChange={setSearch} />

          <CommandList className="max-h-44 p-0.5">
            <CommandEmpty className="py-4 text-muted-foreground">
              Không tìm thấy cơ sở.
            </CommandEmpty>

            <CommandGroup className="p-0">
              {venues.map((venue) => {
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
                    <Building2Icon
                      className={cn(
                        'size-3.5 shrink-0',
                        isSelected ? 'text-emerald-600' : 'text-muted-foreground',
                      )}
                    />
                    <span className="truncate font-medium">{venue.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
