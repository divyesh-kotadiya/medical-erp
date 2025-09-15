'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RequireAuth } from '@/components/providers/auth/RequireAuth';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardLayout>
        <div className="flex max-h-[100vh] relative">
          <div className="flex-1 transition-opacity duration-200">
            <main>{children}</main>
          </div>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}
