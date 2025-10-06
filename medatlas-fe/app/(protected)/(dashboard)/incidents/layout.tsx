'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import FancyTabs from '@/components/layout/FancyTabs/FancyTabs';
import { siteConfig } from '@/app/siteConfig';
import { FileTextIcon, PaperclipIcon, ListIcon, PlusCircleIcon, ChevronLeft } from 'lucide-react';

export default function IncidentLayout({ children }: { children: React.ReactNode }) {
  const { id } = useParams();

  const tabs = id
    ? [
        {
          label: 'Overview',
          href: `${siteConfig.baseLinks.incidents.incidentsList}/${id}`,
          icon: FileTextIcon,
        },
        {
          label: 'Attachments',
          href: `${siteConfig.baseLinks.incidents.incidentsList}/${id}/attachments`,
          icon: PaperclipIcon,
        },
        { label: 'Go Back', href: `${siteConfig.baseLinks.incidents.goback}`, icon: ChevronLeft },
      ]
    : [
        {
          label: 'Incident List',
          href: siteConfig.baseLinks.incidents.incidentsList,
          icon: ListIcon,
        },
        {
          label: 'Create Incident',
          href: siteConfig.baseLinks.incidents.incidentsCreate,
          icon: PlusCircleIcon,
        },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-full mx-auto">
        <div className="bg-card rounded-xl overflow-hidden shadow-card border border-border">
          <div className="flex space-x-2 px-4">
            <FancyTabs tabs={tabs} variant="default" />
          </div>
          <div className="px-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
