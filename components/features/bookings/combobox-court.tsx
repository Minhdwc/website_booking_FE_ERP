'use client';

import { useState } from 'react';
import { ChevronsUpDownIcon, LandPlotIcon } from 'lucide-react';

import { ComboboxPopoverContent } from '@/components/custom/combobox/combobox-popover-content';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCourt, useCourts } from '@/stores/queries/court';

type ComboboxCourtProps = {
  value?: string;
  onChange: (courtId: string) => void;
};

const formatCourtLabel = (name: string, venueName?: string) =>
  venueName ? `${name} · ${venueName}` : name;

export function ComboboxCourt({ value, onChange }: ComboboxCourtProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useCourts({
    limit: '200',
    search,
  });
  const { data: selectedCourt } = useCourt(value || '');

  const courts = data || [];
  const selectedFromList = courts.find((court) => court.id === value);
  const selectedLabel = selectedCourt
    ? formatCourtLabel(selectedCourt.name, selectedCourt.venue?.name)
    : selectedFromList
      ? formatCourtLabel(selectedFromList.name, selectedFromList.venue?.name)
      : undefined;

  if (isLoading && courts.length === 0 && !value) {
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
            className="h-9 w-full justify-between gap-1.5 font-normal"
          />
        }
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <LandPlotIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className={cn('truncate', !selectedLabel && 'text-muted-foreground')}>
            {selectedLabel || 'Chọn sân...'}
          </span>
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </PopoverTrigger>

      <ComboboxPopoverContent>
        <Command shouldFilter={false} value={value}>
          <CommandInput placeholder="Tìm sân..." value={search} onValueChange={setSearch} />

          <CommandList>
            <CommandEmpty>Không tìm thấy sân.</CommandEmpty>

            <CommandGroup>
              {courts.map((court) => {
                const isSelected = value === court.id;

                return (
                  <CommandItem
                    key={court.id}
                    value={court.id}
                    className={cn(isSelected && 'bg-accent')}
                    onSelect={() => {
                      onChange(court.id);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <LandPlotIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">
                      {formatCourtLabel(court.name, court.venue?.name)}
                    </span>
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
