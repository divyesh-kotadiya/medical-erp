'use client';

import { Sidebar } from "../layout/Sidebar";
import MobileNav from "../MobileNav";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <div>
            <h1 className="text-lg font-semibold">MedAtlas</h1>
            <p className="text-sm text-muted-foreground">Healthcare Management</p>
          </div>
          <MobileNav />
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
