import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { RequireAuth } from '@/components/providers/auth/RequireAuth';
import { OrgGuard } from '@/components/providers/organization/OrgGuard';
import { ThemeProvider } from '@/components/providers/themee/theme-provider';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <OrgGuard>
        <RequireAuth>
          <DashboardLayout>
            <div className="flex max-h-[100vh] relative">
              <div className="flex-1 transition-opacity duration-200">
                <main>{children}</main>
              </div>
            </div>
          </DashboardLayout>
        </RequireAuth>
      </OrgGuard>
    </ThemeProvider>
  );
}
