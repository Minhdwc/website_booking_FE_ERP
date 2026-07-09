'use client';

import { Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { navTitleByHref } from '@/components/layout/nav-config';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AppHeaderProps {
  onOpenCommand: () => void;
}

export function AppHeader({ onOpenCommand }: AppHeaderProps) {
  const pathname = usePathname();
  const title = navTitleByHref[pathname] ?? 'ERP';

  return (
    <header className="flex h-13 shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-700" />
      <Separator orientation="vertical" className="mx-1 h-4 bg-slate-200" />
      <span className="text-sm font-semibold text-slate-700">{title}</span>

      <div className="ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCommand}
          className="hidden h-8 gap-2 rounded-lg border-slate-200 bg-slate-50 px-3 text-[13px] text-slate-500 shadow-none hover:bg-slate-100 hover:text-slate-700 md:inline-flex"
        >
          <Search className="size-3.5" />
          Tìm kiếm
          <kbd className="pointer-events-none ml-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] text-slate-400">
            Ctrl K
          </kbd>
        </Button>
      </div>
    </header>
  );
}
