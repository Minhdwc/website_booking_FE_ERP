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
import { useFields } from '@/stores/queries/field.query';

type ComboboxFieldsProps = {
  value?: string;
  onChange: (fieldId: string) => void;
};

export function ComboboxFields({ value, onChange }: ComboboxFieldsProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useFields({
    limit: '200',
    search,
  });

  const fields = data ?? [];

  if (isLoading && fields.length === 0) {
    return <Skeleton className="h-8 w-full" />;
  }

  const selectedLabel = value ? fields.find((field) => field.id === value)?.name : undefined;

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
        <span className="truncate">{selectedLabel ?? 'Chọn sân...'}</span>

        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-(--anchor-width) p-0" align="start">
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
              {fields.map((field) => (
                <CommandItem
                  key={field.id}
                  value={`${field.id} ${field.name}`}
                  onSelect={() => {
                    onChange(field.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <span className="truncate font-medium">{field.name}</span>

                  <CheckIcon
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      value === field.id ? 'opacity-100' : 'opacity-0',
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
