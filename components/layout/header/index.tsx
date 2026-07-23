'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KeyRoundIcon, LogOutIcon, UserRoundIcon } from 'lucide-react';

import { Search } from '@/components/custom/search';
import { Notification } from '@/components/custom/notification';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSession } from '@/provider/session-provider';
import { navSections } from '@/lib/utils/menu-config';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const title = navSections.flatMap((s) => s.items).find((item) => item.href === pathname)?.title;

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-card/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
      <SidebarTrigger className="h-9 w-9 rounded-lg border border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground" />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold text-heading">{title ?? 'Trang chủ'}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Search />
        <Notification />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-9 gap-2 rounded-lg border border-transparent px-2 text-sm font-medium',
                  'hover:border-border hover:bg-muted hover:text-foreground',
                )}
                aria-label="Tài khoản"
              />
            }
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-brand-100 text-xs font-semibold text-brand-700">
                {user?.name?.at(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="max-w-28 truncate text-sm font-semibold text-heading">{user?.name}</p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" side="bottom">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="grid leading-tight">
                  <span className="truncate font-medium text-heading">{user?.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/account/profile" />}>
                <UserRoundIcon className="mr-2 size-4" />
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/account/change-password" />}>
                <KeyRoundIcon className="mr-2 size-4" />
                Đổi mật khẩu
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              <LogOutIcon className="mr-2 size-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
