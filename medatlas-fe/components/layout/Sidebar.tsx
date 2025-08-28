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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/auth';
import { enqueueSnackbar } from 'notistack';

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const isActive = (path: string) => pathname === path;

  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    enqueueSnackbar("logout successful", { variant: "success" });
  }
  const navigationItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Scheduling', url: '/dashboard/scheduling', icon: Calendar },
    { title: 'Timesheets', url: '/dashboard/timesheets', icon: Clock },
    { title: 'Incidents', url: '/dashboard/incidents', icon: AlertTriangle },
    { title: 'Documents', url: '/dashboard/documents', icon: FileText },
    { title: 'Reports', url: '/dashboard/reports', icon: BarChart3 },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings }
  ];
  return (
    <div className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border">
        <div className={`flex items-centern justify-center ${!collapsed && 'justify-between'}`}>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">MedAtlas</h2>
              <p className="text-sm text-muted-foreground">Healthcare Management</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-10 w-10 p-0 hover:bg-white hover:text-black"
          >
            {collapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.title}
            href={item.url}
            className={cn(
              "flex items-center space-x-4 px-3 py-3 rounded-lg transition-all duration-200",
              isActive(item.url)
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-medical"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium">{item.title}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-medium text-sidebar-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        )}
        <Button
          variant="outline"
          onClick={() => handleLogout()}
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
