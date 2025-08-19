import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Administration</h1>
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Admin Panel</h2>
          <p className="text-muted-foreground">Coming Soon - System configuration and user management</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
