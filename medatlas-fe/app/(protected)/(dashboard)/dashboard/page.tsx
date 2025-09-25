'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchShifts } from '@/store/slices/shifts';
import { UserRole } from '@/constants/UserRole/role';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Calendar, Clock, AlertTriangle, TrendingUp, Activity, UserCheck, Bell, Eye, UserPlus } from 'lucide-react';
import InviteStaffDialog from '@/components/layout/Dialog/InviteStaffDialog';
import InviteListDialog from '@/components/layout/Dialog/InviteListDialog';


export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentOrganization } = useAppSelector((state) => state.organizations);
  const { total } = useAppSelector((state) => state.invite);
  const { shifts } = useAppSelector((state) => state.shifts);

  useEffect(() => {
    if (currentOrganization?.id)
      dispatch(fetchShifts());

  }, [currentOrganization?.id, dispatch]);


  const stats = [
    { title: 'Active Staff', value: '5', change: '+5 this week', icon: Users, color: 'text-primary' },
    { title: "Today's Shifts", value: shifts?.length, change: '12 remaining', icon: Calendar, color: 'text-accent' },
    { title: 'Hours This Week', value: '2,847', change: '+12% vs last week', icon: Clock, color: 'text-warning' },
    { title: 'Open Incidents', value: '3', change: '-2 from yesterday', icon: AlertTriangle, color: 'text-destructive' },
  ];

  const quickActions = [
    { title: "Invite Member", value: "", change: "Send invitation to new staff", icon: UserPlus, component: <InviteStaffDialog /> },
    { title: "Invited Member", value: total, change: "Total invited member", icon: Users },
    { title: "View Member", value: "", change: "See all Members", icon: Eye, component: <InviteListDialog /> },
  ];

  const upcomingShifts = shifts?.slice(0, 6).map((s) => ({
    id: s.id,
    staff: s.staffId?.name || 'Not Assigned',
    department: s?.department || 'Unknown',
    start: s.start,
    end: s.end,
    date: new Date(s.start).toLocaleDateString(),
    status: s.cancelled ? 'cancel' : 'pending',
  }));

  const computeAvatarUrl = (raw?: string): string => {
    if (!raw) return '';
    const trimmed = raw.trim();
    if (trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) return trimmed;
    if (trimmed.startsWith('/')) {
      const base = process.env.NEXT_PUBLIC_IMAGE_API_BASE_URL || '';
      if (!base) return trimmed;
      return `${base.replace(/\/$/, '')}${trimmed}`;
    }
    return trimmed;
  };

  const getInitials = (fullName?: string): string => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase();
  };

  // const recentActivities = members?.slice(0, 4).map((m, idx) => ({
  //   id: idx,
  //   user: m.name,
  //   avatar: computeAvatarUrl((m as unknown as { avatar?: string }).avatar),
  //   action: 'Updated profile',
  //   department: m.department || 'General',
  //   time: 'Just now',
  //   status: 'completed',
  // }));

  const formatTimeRange = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name ?? "Guest"}</h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening at <span className="font-semibold text-primary">{currentOrganization?.name ?? "MedAtlas"}</span> today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm"><Bell className="h-4 w-4 mr-2" />Notifications</Button>
          <Button size="sm" className="bg-gradient-primary"><TrendingUp className="h-4 w-4 mr-2" />View Reports</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats && stats.length > 0 ? (
          stats.map((stat, i) => (
            <Card
              key={i}
              className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300"
            >
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 flex items-center justify-center text-muted-foreground">
              No data found
            </CardContent>
          </Card>
        )}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2"><Activity className="h-5 w-5 text-primary" /><span>Recent Activities</span></CardTitle>
            <CardDescription>Latest actions from your team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 cursor-pointer">
            {/* {recentActivities?.map((activity) => (
              <div key={activity?.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {activity.avatar == "" ? (
                    <div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 ring-2 ring-white dark:ring-gray-800 shadow flex items-center justify-center text-[15px] font-bold text-blue-700"
                      aria-label={activity.user}
                      title={activity.user}
                    >
                      {getInitials(activity.user)}
                    </div>
                  ) : (
                    <Image
                      src={activity.avatar}
                      alt={activity.user}
                      width={36}
                      height={36}
                      className="rounded-full w-12 h-12 object-cover"
                      unoptimized
                    />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action} ({activity.department})</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))} */}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2"><UserCheck className="h-5 w-5 text-primary" /><span>Upcoming Shifts</span></CardTitle>
            <CardDescription>Next scheduled shifts for your team</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="cursor-pointer">
                {upcomingShifts && upcomingShifts.length > 0 ? (
                  upcomingShifts.map((shift) => (
                    <TableRow key={shift?.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{shift.staff}</p>
                        </div>
                      </TableCell>
                      <TableCell>{shift?.date}</TableCell>
                      <TableCell>{formatTimeRange(shift.start, shift.end)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center max text-muted-foreground py-6">
                      No data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </CardContent>
        </Card>
      </div>

      {currentOrganization?.role === UserRole.ADMIN && (
        <Card className="border border-border/50 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts for efficient management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, i) => (
                <Card
                  key={i}
                  className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300"
                >
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{action.title}</p>
                      {action.value !== "" && (
                        <p className="text-2xl font-bold text-foreground">{action.value}</p>
                      )}
                      {action.change && <p className="text-xs text-muted-foreground">{action.change}</p>}
                      {action.component && <div>{action.component}</div>}
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
