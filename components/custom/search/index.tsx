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
import { navSections } from '@/lib/utils/menu-config';
import { useSession } from '@/provider/session-provider';

export function Search() {
  const router = useRouter();
  const { user } = useSession();
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

  const role = user?.role;
  const itemsByGroup = navSections
    .map((section) => ({
      label: section.label,
      items: section.items.filter((item) => !item.roles || (role && item.roles.includes(role))),
    }))
    .filter((section) => section.items.length > 0);

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
          {itemsByGroup.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => {
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
