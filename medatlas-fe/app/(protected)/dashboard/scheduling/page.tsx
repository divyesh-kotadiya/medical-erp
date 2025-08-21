import { DashboardLayout } from "@/components/dashboard/DashboardLayout";


export default function SchedulingPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Staff Scheduling</h1>
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Scheduling System</h2>
          <p className="text-muted-foreground">Coming Soon - Advanced staff scheduling and management tools</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
