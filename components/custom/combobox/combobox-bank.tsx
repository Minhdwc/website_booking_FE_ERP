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
import { useVietQrBanks } from '@/stores/queries/vietqr.query';
import { IVietQrBank } from '@/stores/service/vietqr.service';

type ComboboxBankProps = {
  value?: string;
  onChange: (bank: IVietQrBank | undefined) => void;
};

export function ComboboxBank({ value, onChange }: ComboboxBankProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useVietQrBanks();
  const banks = data || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter((bank) => {
      const haystack = `${bank.shortName} ${bank.name} ${bank.code} ${bank.bin}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [banks, search]);

  if (isLoading && banks.length === 0) {
    return <Skeleton className="h-8 w-full" />;
  }

  const selected = value
    ? banks.find((bank) => bank.code === value || bank.bin === value)
    : undefined;

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
        {selected ? (
          <span className="flex min-w-0 items-center gap-2">
            <img src={selected.logo} alt="" className="size-5 shrink-0 rounded-sm object-contain" />
            <span className="truncate">{selected.shortName}</span>
          </span>
        ) : (
          <span className="truncate text-muted-foreground">Chọn ngân hàng...</span>
        )}
        <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command shouldFilter={false}>
          <Input
            className="flex h-9 w-full rounded-none border-x-0 border-t-0 border-b bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Tìm ngân hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy ngân hàng.</CommandEmpty>
            <CommandGroup>
              {filtered.map((bank) => (
                <CommandItem
                  key={bank.id}
                  value={`${bank.code} ${bank.shortName} ${bank.name} ${bank.bin}`}
                  onSelect={() => {
                    onChange(bank);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <img
                    src={bank.logo}
                    alt=""
                    className="size-5 shrink-0 rounded-sm object-contain"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{bank.shortName}</span>
                    <span className="ml-1.5 text-muted-foreground">{bank.code}</span>
                  </span>
                  <CheckIcon
                    className={cn(
                      'ml-auto size-4 shrink-0',
                      selected?.code === bank.code ? 'opacity-100' : 'opacity-0',
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
