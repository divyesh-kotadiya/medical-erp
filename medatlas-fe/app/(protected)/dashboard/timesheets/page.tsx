'use client'

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EVVClockInOut } from "@/components/dashboard/EVVClockInOut";
import { TimesheetList } from "@/components/dashboard/TimesheetList";
import { ApprovalsList } from "@/components/dashboard/ApprovalsList";
import { useState } from "react";
import { Section } from "@/components/ui/section";
import { CheckCircle, CalendarCheck } from "lucide-react";  
import { useAppSelector } from "@/store/hooks";

export default function TimesheetsPage() {
  const [activeTab, setActiveTab] = useState('Verifications');
  const { user } = useAppSelector((s) => s.auth);

  const tabs = [
    {
      id: 'Verifications',
      label: 'Verifications',
      icon: <CheckCircle className="h-5 w-5" />,
      component: <EVVClockInOut />
    },
    {
      id: 'TimeSheet Management',
      label: 'TimeSheet Management',
      icon: <CalendarCheck className="h-5 w-5" />,
      component: <TimesheetList />
    },
    ...(user && (user.isTenantAdmin || user.role === 'ADMIN')
      ? [{
          id: 'Approvals',
          label: 'Approvals (Admin)',
          icon: <CalendarCheck className="h-5 w-5" />,
          component: <ApprovalsList />
        }]
      : [])
  ];

  return (
    <DashboardLayout>
      <div className="p-6 flex flex-col gap-6">
        <Section className="overflow-hidden">
          <div className="flex items-center justify-between p-1 bg-secondary rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 inline-flex items-cenater justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200 
                  ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-card'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'}
                `}
                aria-pressed={activeTab === tab.id}
              >
                {tab.icon}
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section className="relative p-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`transition-all duration-500 ease-in-out ${
                activeTab === tab.id
                  ? 'opacity-100 translate-y-0 relative'
                  : 'opacity-0 absolute top-0 left-0 w-full translate-y-4 pointer-events-none'
              }`}
            >
              {tab.component}
            </div>
          ))}
        </Section>
      </div>
    </DashboardLayout>
  );
}