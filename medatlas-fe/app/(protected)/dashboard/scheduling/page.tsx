import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EnhancedSchedulingCalendar } from "@/components/dashboard/EnhancedSchedulingCalendar";

export default function SchedulingPage() {
  return (
    <DashboardLayout>
      <div className="transition-all duration-300">
        <div className="flex flex-col gap-8 h-full min-h-[85vh]">
          <div className="flex flex-col   gap-6">
            <div className="bg-white dark:bg-gray-800 h-screen shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </span>
                Scheduling Calendar
              </h2>
              <div className="h-[90%]">
                <EnhancedSchedulingCalendar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}