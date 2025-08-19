'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Scheduling', url: '/dashboard/scheduling', icon: Calendar },
  { title: 'Timesheets', url: '/dashboard/timesheets', icon: Clock },
  { title: 'Incidents', url: '/dashboard/incidents', icon: AlertTriangle },
  { title: 'Documents', url: '/dashboard/documents', icon: FileText },
  { title: 'Reports', url: '/dashboard/reports', icon: BarChart3 },
  { title: 'Admin', url: '/dashboard/admin', icon: Settings },
];

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-lg z-50">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                href={item.url}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200",
                  isActive(item.url)
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-medical"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};
