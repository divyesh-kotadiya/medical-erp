import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RequireAuth } from '@/components/providers/auth/RequireAuth';
import { OrgGuard } from '@/components/providers/organization/OrgGuard';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <OrgGuard>
        <DashboardLayout>
          <div className="flex max-h-[100vh] relative">
            <div className="flex-1 transition-opacity duration-200">
              <main>{children}</main>
            </div>
          </div>
        </DashboardLayout>
      </OrgGuard>
    </RequireAuth>
  );
}
