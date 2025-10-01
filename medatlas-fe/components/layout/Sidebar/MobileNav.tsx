'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  Building,
  ChevronDown,
  Check,
  Plus,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; 
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { enqueueSnackbar } from 'notistack';
import { logout } from '@/store/slices/auth';
import { clearOrganizations, setCurrentOrganizationById } from '@/store/slices/organizations';
import gsap from 'gsap';
import { CSSPlugin } from 'gsap/CSSPlugin';

gsap.registerPlugin(CSSPlugin);

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector((state) => state.auth);
  const { organizations, currentOrganization } = useAppSelector((state) => state.organizations);

  const sidebarRef = useRef(null);
  const backdropRef = useRef(null);
  const navItemsRef = useRef([]);

  const onboarding = !organizations || organizations.length === 0;

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearOrganizations());
    enqueueSnackbar("Logout successful", { variant: "success" });
    setIsOpen(false);
  };

  const handleSwitchOrganization = (orgId: string) => {
    if (orgId) {
      dispatch(setCurrentOrganizationById(orgId));
      setShowOrgSwitcher(false);
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
        { title: 'Settings', url: '/settings', icon: Settings },
      ];

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(sidebarRef.current, 
        { x: -300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
      
      gsap.fromTo(backdropRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      
      gsap.from(navItemsRef.current, {
        y: 20,
        opacity: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.2
      });
    }
  }, [isOpen]);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            ref={backdropRef}
            className="fixed inset-0 bg-black/50" 
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            ref={sidebarRef}
            className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-sidebar to-sidebar-muted border-r border-sidebar-border flex flex-col overflow-hidden shadow-sidebar"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-sidebar-primary rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sidebar-accent rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-pulse"></div>
            </div>

            <div className="p-4 border-b border-sidebar-border flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-lg font-semibold text-sidebar-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sidebar-primary" />
                  {onboarding ? 'MedAtlas Onboarding' : 'MedAtlas'}
                </h2>
                <p className="text-sm text-sidebar-muted-foreground">
                  {onboarding ? 'Setup your organization' : 'Healthcare Management'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-6 w-6 text-sidebar-foreground" />
              </Button>
            </div>

            {organizations?.length > 0 && (
              <div className="p-3 border-b border-sidebar-border relative z-10">
                <div 
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-sidebar-primary/10 to-sidebar-accent/10 hover:from-sidebar-primary/20 hover:to-sidebar-accent/20 cursor-pointer transition-all duration-300 shadow-sm border border-sidebar-border/50"
                  onClick={() => setShowOrgSwitcher(!showOrgSwitcher)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-accent shadow-md">
                      <Building className="h-5 w-5 text-sidebar-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {currentOrganization?.name || 'Select Organization'}
                      </p>
                      <p className="text-xs text-sidebar-muted-foreground">
                        {currentOrganization?.role || 'No role'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 text-sidebar-foreground transition-transform duration-300",
                      showOrgSwitcher && "rotate-180"
                    )} 
                  />
                </div>

                {showOrgSwitcher && (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {organizations.map((org) => (
                      <div
                        key={org.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300",
                          org.id === currentOrganization?.id
                            ? "bg-gradient-to-r from-sidebar-primary to-sidebar-accent text-sidebar-primary-foreground shadow-md"
                            : "bg-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                        onClick={() => handleSwitchOrganization(org.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sidebar-primary/20 to-sidebar-accent/20 flex items-center justify-center shadow-sm">
                            <span className="text-xs font-medium text-sidebar-foreground">
                              {org.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-sidebar-foreground">{org.name}</p>
                            <p className="text-xs text-sidebar-muted-foreground">{org.role}</p>
                          </div>
                        </div>
                        {org.id === currentOrganization?.id && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    ))}
                    
                    <Link
                      href="/organizations/new"
                      className="flex items-center justify-center p-3 rounded-xl border-2 border-dashed border-sidebar-border hover:bg-sidebar-accent/50 transition-all duration-300"
                      onClick={() => {
                        setShowOrgSwitcher(false);
                        setIsOpen(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2 text-sidebar-muted-foreground" />
                      <span className="text-sm text-sidebar-muted-foreground">Add Organization</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto relative z-10">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.title}
                  ref={el => navItemsRef.current[index] = el}
                  href={item.url}
                  prefetch
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 group",
                    isActive(item.url)
                      ? "bg-gradient-to-r from-sidebar-primary to-sidebar-accent text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-300 group-hover:scale-110",
                    isActive(item.url) 
                      ? "bg-white/20" 
                      : "bg-sidebar-primary/10 group-hover:bg-sidebar-primary/20"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive(item.url) ? "text-sidebar-primary-foreground" : "text-sidebar-primary"
                    )} />
                  </div>
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-sidebar-border relative z-10">
              <div className="flex items-center space-x-3 mb-3 p-3 rounded-xl bg-gradient-to-r from-sidebar-primary/10 to-sidebar-accent/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sidebar-primary to-sidebar-accent flex items-center justify-center shadow-md">
                  <span className="text-sidebar-primary-foreground font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-sidebar-muted-foreground truncate">
                    {currentOrganization?.role || 'No role'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-sidebar-border relative z-10">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start bg-gradient-to-r from-sidebar-primary to-sidebar-accent hover:from-sidebar-primary/90 hover:to-sidebar-accent/90 text-sidebar-primary-foreground border-0 shadow-md transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};