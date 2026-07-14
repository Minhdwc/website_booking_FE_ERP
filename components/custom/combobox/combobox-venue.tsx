'use client';

import { useState } from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVenues } from '@/stores/queries/venue.query';

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

  const venues = data ?? [];

  if (isLoading && venues.length === 0) {
    return <Skeleton className="h-8 w-full" />;
  }

  const selectedLabel = value ? venues.find((venue) => venue.id === value)?.name : undefined;

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
            className="h-8 w-full justify-between font-normal"
          />
        }
      >
        <span className="truncate">{selectedLabel ?? 'Chọn cơ sở...'}</span>

        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command shouldFilter={false}>
          <Input
            className="flex h-9 w-full rounded-none border-x-0 border-t-0 border-b bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Tìm cơ sở..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CommandList>
            <CommandEmpty>Không tìm thấy cơ sở.</CommandEmpty>

            <CommandGroup>
              {venues.map((venue) => (
                <CommandItem
                  key={venue.id}
                  value={`${venue.id} ${venue.name}`}
                  onSelect={() => {
                    onChange(venue.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <span className="truncate font-medium">{venue.name}</span>

                  <CheckIcon
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      value === venue.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
