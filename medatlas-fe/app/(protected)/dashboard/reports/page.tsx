import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Coming Soon - Real-time insights and detailed reporting tools</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
