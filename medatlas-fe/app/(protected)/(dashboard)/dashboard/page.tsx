'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchShifts } from '@/store/slices/shifts';
import { fetchIncidents } from '@/store/slices/incidents';
import { fetchTenantMembers } from '@/store/slices/organizations';
import { UserRole } from '@/constants/UserRole/role';
import { IncidentStatus } from '@/constants/Incidents';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import InviteStaffDialog from '@/components/layout/Dialog/InviteStaffDialog';
import InviteListDialog from '@/components/layout/Dialog/InviteListDialog';
import IncidentAnalytics from '@/components/dashboard/IncidentAnalytics';

import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  UserCheck,
  Bell,
  Eye,
  UserPlus,
  BarChart3,
  Download,
  Search,
} from 'lucide-react';
import CustomDropdown from '@/components/layout/Dropdown/Dropdown';
import Image from 'next/image';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { user } = useAppSelector((state) => state.auth);
  const { currentOrganization, memberList } = useAppSelector((state) => state.organizations);
  const { incidents } = useAppSelector((state) => state.incidents);
  const { shifts } = useAppSelector((state) => state.shifts);
  const { total } = useAppSelector((state) => state.invite);

  const currentOrgId = currentOrganization?.id;

  const computeAvatarUrl = (raw: string): string | undefined => {
    if (!raw || !raw.trim()) return undefined;
    const trimmed = raw.trim();
    if (trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      const base = process.env.NEXT_PUBLIC_IMAGE_API_BASE_URL || '';
      if (!base) return trimmed;
      return `${base.replace(/\/$/, '')}${trimmed}`;
    }
    return trimmed;
  };

  useEffect(() => {
    if (!currentOrgId) return;
    dispatch(fetchShifts());
    dispatch(fetchIncidents({ tenantId: currentOrgId }));
    if (!memberList.length || memberList[0]?.tenantId !== currentOrgId) {
      dispatch(fetchTenantMembers(currentOrgId));
    }
  }, [currentOrgId, dispatch, memberList]);

  const quickActions = [
    { title: 'Invite Member', value: '', change: 'Send invitation to new staff', icon: UserPlus, component: <InviteStaffDialog /> },
    { title: 'Invited Members', value: total, change: 'Total invited members', icon: Users },
    { title: 'View Members', value: '', change: 'See all members', icon: Eye, component: <InviteListDialog /> },
  ];

  const statusOptions = useMemo(
    () => [
      { label: 'All Statuses', value: '' },
      ...Object.values(IncidentStatus).map((status) => ({
        label: status.replace('_', ' '),
        value: status,
      })),
    ],
    [],
  );

  const filteredIncidents = useMemo(() => {
    if (!statusFilter) return incidents;
    return incidents.filter((i) => i.status === statusFilter);
  }, [statusFilter, incidents]);

  const upcomingShifts = useMemo(() => {
    return shifts?.slice(0, 5).map((s) => ({
      id: s.id,
      staff: s.staffId?.name ?? 'Not Assigned',
      department: s.department ?? 'Unknown',
      start: s.start,
      end: s.end,
      date: new Date(s.start).toLocaleDateString(),
      status: s.cancelled ? 'Cancelled' : 'Pending',
    })) || [];
  }, [shifts]);

  const hoursThisWeek = useMemo(() => {
    if (!shifts) return 0;
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return shifts
      .filter((s) => {
        const d = new Date(s.start);
        return d >= startOfWeek && d <= endOfWeek;
      })
      .reduce((acc, s) => acc + (new Date(s.end).getTime() - new Date(s.start).getTime()) / (1000 * 60 * 60), 0)
      .toFixed(1);
  }, [shifts]);

  const stats = [
    { title: 'Total Staff', value: memberList.length, icon: Users, color: 'text-primary' },
    { title: "Today's Shifts", value: shifts?.length || 0, change: '+12 today', icon: Calendar, color: 'text-purple-600' },
    { title: 'Hours This Week', value: hoursThisWeek, change: '+12% vs last week', icon: Clock, color: 'text-amber-600' },
    { title: 'Open Incidents', value: incidents.length, change: '-2 from yesterday', icon: AlertTriangle, color: 'text-destructive' },
  ];

  const formatTimeRange = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name ?? 'Guest'}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening at <span className="font-semibold text-primary">{currentOrganization?.name ?? 'MedAtlas'}</span> today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> View Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-border shadow-card">
            <CardContent className="p-6 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-primary/10`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5 text-primary" /> Analytics Dashboard
            </CardTitle>
            <CardDescription className="text-muted-foreground">Key metrics and performance indicators</CardDescription>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <CustomDropdown
              buttonClassName="gap-5"
              menuClassName="w-40"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter by Status"
            />
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="">
          <IncidentAnalytics incidents={filteredIncidents} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" /> Recent Users
            </CardTitle>
            <CardDescription className="text-muted-foreground">Your team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {memberList.map((item) => (
              <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-14   h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <Image 
                      width={250}
                      height={250}
                      unoptimized
                      priority
                      src={computeAvatarUrl(item.User.avatar)}
                      alt="User Avatar"
                      className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <p className="text-xl text-foreground">{item.User.name || 'User Name'}</p>
                    <p className="text-lg text-muted-foreground">{item.User.email || 'User Email'}</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-success"></div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-card">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <UserCheck className="h-5 w-5 text-primary" /> Upcoming Shifts
                </CardTitle>
                <CardDescription className="text-muted-foreground">Next scheduled shifts for your team</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search shifts..."
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Staff</TableHead>
                  <TableHead className="text-foreground">Date</TableHead>
                  <TableHead className="text-foreground">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingShifts.length ? (
                  upcomingShifts.map((shift) => (
                    <TableRow key={shift.id} className="hover:bg-secondary/50 cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{shift.staff.charAt(0)}</div>
                          <p className="font-medium text-foreground">{shift.staff}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{shift.date}</TableCell>
                      <TableCell className="text-muted-foreground">{formatTimeRange(shift.start, shift.end)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">No upcoming shifts found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {currentOrganization?.role === UserRole.ADMIN && (
        <Card className="border border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">Common tasks and shortcuts for efficient management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, i) => (
                <Card key={i} className="border border-border shadow-card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-lg bg-primary/10"><action.icon className="h-6 w-6 text-primary" /></div>
                      {action.value && <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">{action.value}</span>}
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1">{action.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{action.change}</p>
                    {action.component}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
