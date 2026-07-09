'use client';

import { useState } from 'react';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { CommandMenu } from '@/components/layout/command-menu';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function ErpShell({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader onOpenCommand={() => setCommandOpen(true)} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </SidebarProvider>
  );
}
