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
import { usePaymentMethods } from '@/stores/queries/payment-method.query';

type ComboboxPaymentMethodProps = {
  value?: string;
  onChange: (paymentMethodId: string) => void;
  excludeIds?: string[];
};

export function ComboboxPaymentMethod({ value, onChange, excludeIds }: ComboboxPaymentMethodProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = usePaymentMethods({ search, limit: '200' });

  const excludeSet = new Set(excludeIds || []);
  const allMethods = (data || []).filter((item) => item.isActive);
  const methods = allMethods.filter((item) => !excludeSet.has(item.id));

  if (isLoading && methods.length === 0) {
    return <Skeleton className="h-8 w-full" />;
  }

  const selected = value ? allMethods.find((item) => item.id === value) : undefined;

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
        <span className="truncate">{selected?.name || 'Chọn phương thức...'}</span>
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command shouldFilter={false}>
          <Input
            className="flex h-9 w-full rounded-none border-x-0 border-t-0 border-b bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Tìm phương thức..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy phương thức.</CommandEmpty>
            <CommandGroup>
              {methods.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.id} ${item.name} ${item.code}`}
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <span className="truncate font-medium">{item.name}</span>
                  <CheckIcon
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      value === item.id ? 'opacity-100' : 'opacity-0',
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
