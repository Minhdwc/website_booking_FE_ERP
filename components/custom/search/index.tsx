'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import { Icon } from '@iconify/react';

import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const searchItems = [
  { name: 'Trang chủ', href: '/dashboard', icon: 'mdi:home-outline' },
  { name: 'Danh sách đặt sân', href: '/bookings', icon: 'mdi:calendar-check-outline' },
  { name: 'Cơ sở', href: '/venues', icon: 'mdi:stadium' },
  { name: 'Sân thi đấu', href: '/fields', icon: 'mdi:soccer-field' },
  { name: 'Môn thể thao', href: '/sports', icon: 'mdi:basketball' },
  { name: 'Khung giờ', href: '/timeslots', icon: 'mdi:clock-outline' },
  { name: 'Phương thức thanh toán', href: '/payment-methods', icon: 'mdi:credit-card-outline' },
  { name: 'Giao dịch', href: '/payments', icon: 'mdi:receipt-text-outline' },
  { name: 'Đánh giá', href: '/reviews', icon: 'mdi:star-outline' },
  { name: 'Người dùng', href: '/users', icon: 'mdi:account-group-outline' },
  { name: 'Thông báo', href: '/notifications', icon: 'mdi:bell-outline' },
];

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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden h-8 gap-2 border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-500 shadow-none hover:bg-slate-100 hover:text-slate-700 md:inline-flex"
      >
        <SearchIcon className="size-3.5" />
        Tìm kiếm
        <kbd className="pointer-events-none ml-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] text-slate-400">
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
          <CommandGroup heading="Điều hướng">
            {searchItems.map((item) => (
              <CommandItem key={item.href} value={item.name} onSelect={() => onSelect(item.href)}>
                <Icon icon={item.icon} className="size-4" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
