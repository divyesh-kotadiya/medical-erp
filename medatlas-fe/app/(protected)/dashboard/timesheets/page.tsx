'use client'

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EVVClockInOut } from "@/components/dashboard/EVVClockInOut";
import { TimesheetList } from "@/components/dashboard/TimesheetList";
import { useState } from "react";


export default function TimesheetsPage() {
  const [activeTab, setActiveTab] = useState('Verifications');

  return (
    <DashboardLayout>
      <div className="p-4 flex flex-col gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg p-1 w-fit">
          <div className="flex space-x-1">
            <button
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${activeTab === 'Verifications'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              onClick={() => setActiveTab('Verifications')}
            >
              Verifications
            </button>
            <button
              className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${activeTab === 'TimeSheet Management'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              onClick={() => setActiveTab('TimeSheet Management')}
            >
              TimeSheet Management
            </button>
          </div>
        </div>
      </div>
      <div className="px-4  ">
        {activeTab === 'Verifications' && (
          <EVVClockInOut />
        )}
        {activeTab === 'TimeSheet Management' && (
          <TimesheetList />
        )}
      </div>
    </DashboardLayout>
  );
}
