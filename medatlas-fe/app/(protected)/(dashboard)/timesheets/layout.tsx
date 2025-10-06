'use client';
import { siteConfig } from '@/app/siteConfig';
import FancyTabs from '@/components/layout/FancyTabs/FancyTabs';
import { useAppSelector } from '@/store/hooks';
import { CheckCircle, Settings, ThumbsUp } from 'lucide-react';

export default function TimesheetLayout({ children }: { children: React.ReactNode }) {
  const { currentOrganization } = useAppSelector((state) => state.organizations);

  const baseTabs = [
    {
      label: 'Verifications',
      href: siteConfig.baseLinks.timesheets.verification,
      icon: CheckCircle,
    },
    {
      label: 'Management',
      href: siteConfig.baseLinks.timesheets.management,
      icon: Settings,
    },
  ];

  const adminTabs =
    currentOrganization?.role === 'ADMIN'
      ? [
          {
            label: 'Approvals',
            href: siteConfig.baseLinks.timesheets.approvals,
            icon: ThumbsUp,
          },
        ]
      : [];

  const tabs = [...baseTabs, ...adminTabs];

  return (
    <div className="p-3 min-h-screen bg-background">
      <div className="flex space-x-2">
        <FancyTabs tabs={tabs} variant="default" />
      </div>
      <div>{children}</div>
    </div>
  );
}
