'use client';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { BookingProvider } from '@/context/booking.context';
import { NotificationProvider } from '@/context/notification.context';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export function ErpShell({ children }: { children: React.ReactNode }) {
  return (
    <BookingProvider>
      <NotificationProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="bg-background">
            <Header />
            <main className="flex flex-1 flex-col overflow-auto">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </NotificationProvider>
    </BookingProvider>
  );
}
