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
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-4">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-heading" />
      <Separator orientation="vertical" className="mx-1 h-4" />
      <h1 className="text-sm font-semibold text-heading">{title}</h1>

      <div className="ml-auto flex items-center gap-1.5">
        <Search />
        <Notification />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full"
                aria-label="Tài khoản"
              />
            }
          >
            <Avatar size="default">
              <AvatarFallback className="bg-brand-secondary-500 text-xs font-semibold text-black">
                {user?.name?.at(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
