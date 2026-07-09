'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { navConfig } from '@/components/layout/nav-config';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange: setOpen }: CommandMenuProps) {
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Tìm đặt sân, chi nhánh, người dùng..." />
      <CommandList>
        <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
        {navConfig.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.flatMap((item) =>
              item.href
                ? [
                    <CommandItem key={item.href} onSelect={() => go(item.href!)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </CommandItem>,
                  ]
                : (item.items ?? []).map((leaf) => (
                    <CommandItem key={leaf.href} onSelect={() => go(leaf.href)}>
                      <item.icon />
                      <span>{leaf.title}</span>
                    </CommandItem>
                  )),
            )}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
