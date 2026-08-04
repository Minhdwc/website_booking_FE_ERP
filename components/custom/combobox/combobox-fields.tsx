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
import { ComboboxPopoverContent } from '@/components/custom/combobox/combobox-popover-content';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCourts } from '@/stores/queries/court';

type ComboboxCourtsProps = {
  value?: string;
  onChange: (courtId: string) => void;
};

export function ComboboxCourts({ value, onChange }: ComboboxCourtsProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useCourts({
    limit: '200',
    search,
  });

  const courts = data || [];

  if (isLoading && courts.length === 0) {
    return <Skeleton className="h-8 w-full" />;
  }

  const selectedLabel = value ? courts.find((court) => court.id === value)?.name : undefined;

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
        <span className="truncate">{selectedLabel || 'Chọn sân...'}</span>

        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <ComboboxPopoverContent>
        <Command shouldFilter={false}>
          <Input
            className="flex h-9 w-full rounded-none border-x-0 border-t-0 border-b bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Tìm sân..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CommandList>
            <CommandEmpty>Không tìm thấy sân.</CommandEmpty>

            <CommandGroup>
              {courts.map((court) => (
                <CommandItem
                  key={court.id}
                  value={`${court.id} ${court.name}`}
                  onSelect={() => {
                    onChange(court.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <span className="truncate font-medium">{court.name}</span>

                  <CheckIcon
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      value === court.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </ComboboxPopoverContent>
    </Popover>
  );
}
