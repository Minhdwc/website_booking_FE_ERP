'use client';

import {
  ActionIcon,
  Avatar,
  Menu,
  Text,
  TextInput,
  UnstyledButton,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import { Bell, LogOut, Search, Settings, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const segment = pathname.split('/')[1];
  const pageTitle = segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard';

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <TextInput
        aria-label="Search"
        placeholder="Search..."
        leftSection={<Search className="h-3.5 w-3.5" />}
        className="hidden w-52 md:block"
        radius="md"
        size="sm"
      />

      <ActionIcon
        aria-label="Notifications"
        className="relative"
        color="gray"
        radius="xl"
        size="lg"
        variant="subtle"
      >
        <Bell className="h-4.5 w-4.5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
      </ActionIcon>
      <div>
        <ActionIcon
          aria-label="Toggle theme"
          color="gray"
          radius="xl"
          size="lg"
          variant="subtle"
          onClick={() => {
            setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
          }}
        >
          <Sun size={18} className="block dark:hidden" />
          <Moon size={18} className="hidden dark:block" />
        </ActionIcon>
      </div>

      <Menu position="bottom-end" shadow="md" width={220}>
        <Menu.Target>
          <UnstyledButton className="rounded-full outline-none">
            <Avatar
              className="ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-background"
              color="teal"
              radius="xl"
              size={34}
            >
              AU
            </Avatar>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <div className="border-b border-border px-3 py-3">
            <div className="flex items-center gap-2">
              <Avatar color="teal" radius="xl" size={32}>
                AU
              </Avatar>
              <div>
                <Text fw={500} lh={1} size="sm">
                  Admin User
                </Text>
                <Text c="dimmed" mt={4} size="xs">
                  admin@fieldops.com
                </Text>
              </div>
            </div>
          </div>

          <Menu.Item leftSection={<User className="h-4 w-4" />}>Profile</Menu.Item>
          <Menu.Item leftSection={<Settings className="h-4 w-4" />}>Settings</Menu.Item>
          <Menu.Item color="red" leftSection={<LogOut className="h-4 w-4" />}>
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </header>
  );
}
