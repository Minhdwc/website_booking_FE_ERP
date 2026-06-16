"use client";

import AppSidebarMenu from "../app-sidebar/menu";
import Header from "./header";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-background px-4 lg:block">
        <nav className="mt-8">
          <AppSidebarMenu />
        </nav>
      </aside>

      <div className="lg:pl-64">
        <Header />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
