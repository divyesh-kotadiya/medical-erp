import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function IncidentsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Incident Management</h1>
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Incident Reporting</h2>
          <p className="text-muted-foreground">Coming Soon - Comprehensive incident tracking and reporting system</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
