'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchShifts } from '@/store/slices/shifts';
import { fetchMembers } from '@/store/slices/auth';
import { UserRole } from '@/constants/UserRole/role';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Calendar, Clock, AlertTriangle, TrendingUp, Activity, UserCheck, Bell, Eye, UserPlus } from 'lucide-react';

import InviteStaffDialog from '../layout/Dialog/InviteStaffDialog';
import InviteListDialog from '../layout/Dialog/InviteListDialog';

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user, tenant, members } = useAppSelector((state) => state.auth);
  const { total } = useAppSelector((state) => state.invite);
  const { shifts } = useAppSelector((state) => state.shifts);

  useEffect(() => {
    dispatch(fetchShifts());
    dispatch(fetchMembers());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground hover:bg-success';
      case 'pending': return 'bg-warning text-warning-foreground hover:bg-warning';
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'confirmed': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const stats = [
    { title: 'Active Staff', value: members?.length, change: '+5 this week', icon: Users, color: 'text-primary' },
    { title: "Today's Shifts", value: shifts?.length, change: '12 remaining', icon: Calendar, color: 'text-accent' },
    { title: 'Hours This Week', value: '2,847', change: '+12% vs last week', icon: Clock, color: 'text-warning' },
    { title: 'Open Incidents', value: '3', change: '-2 from yesterday', icon: AlertTriangle, color: 'text-destructive' },
  ];

  const quickActions = [
    { title: "Invite Member", value: "", change: "Send invitation to new staff", icon: UserPlus, component: <InviteStaffDialog /> },
    { title: "Invited Member", value: total || 0, change: "Total invited member", icon: Users },
    { title: "View Member", value: "", change: "See all Members", icon: Eye, component: <InviteListDialog /> },
  ];

  const upcomingShifts = shifts?.map((s) => ({
    id: s.id,
    staff: s.staffId?.name || 'Not Assigned',
    department: s?.department || 'Unknown',
    start: s.start,
    end: s.end
    , date: new Date(s.start).toLocaleDateString(),
    status: s.cancelled ? 'cancel' : 'pending',
  }));

  const recentActivities = members?.slice(0, 5).map((m, idx) => ({
    id: idx,
    user: m.name,
    action: 'Updated profile',
    department: m.department || 'General',
    time: 'Just now',
    status: 'completed',
  }));

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
            Here&apos;s what&apos;s happening at <span className="font-semibold text-primary">{tenant?.name ?? "MedAtlas"}</span> today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm"><Bell className="h-4 w-4 mr-2" />Notifications</Button>
          <Button size="sm" className="bg-gradient-primary"><TrendingUp className="h-4 w-4 mr-2" />View Reports</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats?.map((stat, i) => (
          <Card key={i} className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300">
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2"><Activity className="h-5 w-5 text-primary" /><span>Recent Activities</span></CardTitle>
            <CardDescription>Latest actions from your team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities?.map((activity) => (
              <div key={activity?.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium text-foreground">{activity.user}</p>
                  <p className="text-sm text-muted-foreground">{activity.action} ({activity.department})</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
              </div>
            ))}
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
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingShifts?.map((shift) => (
                  <TableRow key={shift?.date}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{shift.staff}</p>
                      </div>
                    </TableCell>
                    <TableCell>{shift?.date}</TableCell>
                    <TableCell>{formatTimeRange(shift.start, shift.end)}</TableCell>
                    <TableCell><Badge className={getStatusColor(shift.status)}>{shift.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {user?.role === UserRole.ADMIN && (
        <Card className="border border-border/50 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts for efficient management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, i) => (
                <Card key={i} className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{action.title}</p>
                      {action.value !== "" && <p className="text-2xl font-bold text-foreground">{action.value}</p>}
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
