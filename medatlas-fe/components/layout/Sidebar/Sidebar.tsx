'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ListPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; 
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { enqueueSnackbar } from 'notistack';
import { logout } from '@/store/slices/auth';
import { clearOrganizations, setCurrentOrganizationById } from '@/store/slices/organizations';
import CustomDropdown from '../Dropdown/Dropdown';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const { organizations, currentOrganization, switching } = useAppSelector((state) => state.organizations);

  const onboarding = !organizations || organizations.length === 0;

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearOrganizations());
    enqueueSnackbar("Logout successful", { variant: "success" });
  };

  const handleSwitchOrganization = (orgId: string) => {
    if (orgId) {
      dispatch(setCurrentOrganizationById(orgId));
    }
  };

  const navigationItems = onboarding
    ? [
        { title: 'Dashboard', url: '/onboarding', icon: LayoutDashboard },
        { title: 'Settings', url: '/settings', icon: Settings },
      ]
    : [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Scheduling', url: '/scheduling', icon: Calendar },
        { title: 'Timesheets', url: '/timesheets', icon: Clock },
        { title: 'Incidents', url: '/incidents', icon: AlertTriangle },
        { title: 'Documents', url: '/documents', icon: FileText },
        { title: 'Reports', url: '/reports', icon: BarChart3 },
        { title: 'Settings', url: '/settings', icon: Settings },
      ];

  return (
    <div
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              {onboarding ? 'MedAtlas Onboarding' : 'MedAtlas'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {onboarding ? 'Setup your organization' : 'Healthcare Management'}
            </p>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </Button>
      </div>

      {/* Organization dropdown */}
      {!collapsed && organizations?.length > 0 && (
        <div className="p-3 border-b border-sidebar-border">
          <CustomDropdown
            options={organizations.map(org => ({
              label: org.name,
              value: org.id
            }))}
            value={currentOrganization?.id || ''}
            onChange={handleSwitchOrganization}
            placeholder="Select organization"
            disabled={switching}
            buttonClassName="w-full justify-between"
            menuClassName="max-h-60 overflow-auto"
          />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.title}
            href={item.url}
            prefetch
            className={cn(
              "flex items-center space-x-4 px-3 py-3 rounded-lg transition-all duration-200",
              isActive(item.url)
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-medical"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">{currentOrganization?.role || '-'}</p>
          </div>
        )}
        <Button
          variant="outline"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start bg-sidebar-primary hover:bg-sidebar-primary",
            collapsed && "px-2"
          )}
        >
          <LogOut className="h-4 w-4 text-white" />
          {!collapsed && <span className="ml-2 text-white">Logout</span>}
        </Button>
      </div>
    </div>
  );
};
