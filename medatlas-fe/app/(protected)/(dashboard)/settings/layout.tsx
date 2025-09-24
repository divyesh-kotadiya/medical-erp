'use client';
import { siteConfig } from '@/app/siteConfig';
import FancyTabs from '@/components/layout/FancyTabs/FancyTabs';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const tabs = [
    { label: 'Profile', href: siteConfig.baseLinks.setting.profile, icon: null },
    { label: 'Account', href: siteConfig.baseLinks.setting.account, icon: null },
    { label: 'Invites', href: siteConfig.baseLinks.setting.invites, icon: null }
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Settings</h1>

      <FancyTabs tabs={tabs} />

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        {children}
      </div>
    </div>
  );
}
