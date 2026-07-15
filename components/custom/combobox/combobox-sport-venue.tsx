'use client';

import { useMemo, useState } from 'react';
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
import { useVenueSports } from '@/stores/queries/venue-sport.query';

type ComboboxSportVenueProps = {
  venueId?: string;
  value?: string;
  onChange: (sportId: string) => void;
  excludeIds?: string[];
};

export function ComboboxSportVenue({
  venueId,
  value,
  onChange,
  excludeIds,
}: ComboboxSportVenueProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useVenueSports(
    venueId ? { venueId, limit: '200', isActive: true } : undefined,
    { enabled: Boolean(venueId) },
  );

  const sports = useMemo(() => {
    const excludeSet = new Set(excludeIds || []);
    const q = search.trim().toLowerCase();

    return (data || [])
      .filter((item) => item.isActive && item.sport)
      .map((item) => ({ id: item.sportId, name: item.sport!.name }))
      .filter((sport) => !excludeSet.has(sport.id))
      .filter((sport) => !q || sport.name.toLowerCase().includes(q));
  }, [data, excludeIds, search]);

  if (isLoading && venueId && sports.length === 0) {
    return <Skeleton className="h-8 w-full" />;
  }

  const selectedLabel = value ? sports.find((sport) => sport.id === value)?.name : undefined;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch('');
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
        <span className="truncate">{selectedLabel || 'Chọn bộ môn...'}</span>
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command shouldFilter={false}>
          <Input
            className="flex h-9 w-full rounded-none border-x-0 border-t-0 border-b bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Tìm bộ môn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CommandList>
            <CommandEmpty>Không có bộ môn.</CommandEmpty>
            <CommandGroup>
              {sports.map((sport) => (
                <CommandItem
                  key={sport.id}
                  value={`${sport.id} ${sport.name}`}
                  onSelect={() => {
                    onChange(sport.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <span className="truncate font-medium">{sport.name}</span>
                  <CheckIcon
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      value === sport.id ? 'opacity-100' : 'opacity-0',
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
