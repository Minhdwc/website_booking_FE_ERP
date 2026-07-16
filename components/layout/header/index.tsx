'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KeyRoundIcon, LogOutIcon, UserRoundIcon } from 'lucide-react';

import { Search } from '@/components/custom/search';
import { Notification } from '@/components/custom/notification';
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

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const title = navSections.flatMap((s) => s.items).find((item) => item.href === pathname)?.title;

  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-3 border-b border-border/70 bg-white px-6">
      <SidebarTrigger className="-ml-1 rounded-xl text-muted-foreground hover:bg-brand-secondary-50 hover:text-brand-secondary-700" />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ERP nội bộ
        </p>
        <h1 className="truncate text-sm font-semibold text-heading">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Search />
        <Notification />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="h-11 rounded-2xl px-2.5"
                aria-label="Tài khoản"
              />
            }
          >
            <div className="flex items-center gap-2">
              <Avatar size="default">
                <AvatarFallback className="bg-brand-secondary-50 text-xs font-semibold text-brand-secondary-700">
                  {user?.name?.at(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="max-w-28 truncate text-sm font-semibold text-heading">{user?.name}</p>
              </div>
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
                <UserRoundIcon />
                Hồ sơ cá nhân
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/account/change-password" />}>
                <KeyRoundIcon />
                Đổi mật khẩu
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem variant="destructive" onClick={() => logout()}>
              <LogOutIcon />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
