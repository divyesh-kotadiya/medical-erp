import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TimesheetsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Timesheets</h1>
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Time Tracking System</h2>
          <p className="text-muted-foreground">Coming Soon - Comprehensive timesheet management and payroll tools</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
