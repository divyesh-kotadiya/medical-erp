'use client'

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EVVClockInOut } from "@/components/dashboard/EVVClockInOut";
import { TimesheetList } from "@/components/dashboard/TimesheetList";
import { useState } from "react";


export default function TimesheetsPage() {
  const [activeTab, setActiveTab] = useState('Verifications');

  return (
    <DashboardLayout>
      <div className="p-4 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1.5 w-fit">
          <div className="flex space-x-1">
            <button
              className={`relative px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center ${activeTab === 'Verifications'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              onClick={() => setActiveTab('Verifications')}
            >
              {activeTab === 'Verifications' && (
                <span className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-1.5 h-4 bg-blue-500 rounded-full"></span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verifications
            </button>
            <button
              className={`relative px-6 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center ${activeTab === 'TimeSheet Management'
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              onClick={() => setActiveTab('TimeSheet Management')}
            >
              {activeTab === 'TimeSheet Management' && (
                <span className="absolute -left-1.5 top-1/2 transform -translate-y-1/2 w-1.5 h-4 bg-blue-500 rounded-full"></span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              TimeSheet Management
            </button>
          </div>
        </div>

        <div className="px-1 transition-all duration-300">
          <div className={`${activeTab === 'Verifications' ? 'block' : 'hidden'} animate-fadeIn`}>
            <EVVClockInOut />
          </div>
          <div className={`${activeTab === 'TimeSheet Management' ? 'block' : 'hidden'} animate-fadeIn`}>
            <TimesheetList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
