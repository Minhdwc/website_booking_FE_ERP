'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { navSearchItems } from '@/lib/utils/menu-config';

export function Search() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const onSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const itemsByGroup = navSearchItems.reduce<Record<string, typeof navSearchItems>>((acc, item) => {
    (acc[item.groupLabel] ??= []).push(item);
    return acc;
  }, {});

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden h-8 gap-2 border-border bg-muted-surface px-3 text-[13px] text-muted-foreground shadow-none hover:bg-hover hover:text-foreground md:inline-flex"
      >
        <SearchIcon className="size-3.5" />
        Tìm kiếm
        <kbd className="pointer-events-none ml-1 rounded border border-border bg-surface px-1.5 font-mono text-[10px] text-muted-foreground">
          Ctrl K
        </kbd>
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        className="md:hidden"
        aria-label="Tìm kiếm"
      >
        <SearchIcon className="size-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Tìm kiếm"
        description="Tìm nhanh trang và chức năng trong hệ thống"
      >
        <CommandInput placeholder="Tìm trang, chức năng..." />
        <CommandList>
          <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
          {Object.entries(itemsByGroup).map(([groupLabel, items]) => (
            <CommandGroup key={groupLabel} heading={groupLabel}>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={item.title}
                    onSelect={() => onSelect(item.href)}
                  >
                    <Icon className="size-4" />
                    <span>{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
