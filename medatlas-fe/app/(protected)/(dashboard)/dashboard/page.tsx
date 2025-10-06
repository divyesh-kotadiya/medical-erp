'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchShifts } from '@/store/slices/shifts';
import { UserRole } from '@/constants/UserRole/role';
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
  FileText,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Search,
} from 'lucide-react';
import InviteStaffDialog from '@/components/layout/Dialog/InviteStaffDialog';
import InviteListDialog from '@/components/layout/Dialog/InviteListDialog';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentOrganization } = useAppSelector((state) => state.organizations);
  const { total } = useAppSelector((state) => state.invite);
  const { shifts } = useAppSelector((state) => state.shifts);

  useEffect(() => {
    if (currentOrganization?.id) {
      dispatch(fetchShifts());
    }
  }, [currentOrganization?.id, dispatch]);

  const stats = [
    {
      title: 'Active Staff',
      value: '5',
      change: '+5 this week',
      icon: Users,
      color: 'text-primary',
    },
    {
      title: "Today's Shifts",
      value: shifts?.length || 0,
      change: '12 remaining',
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      title: 'Hours This Week',
      value: '2,847',
      change: '+12% vs last week',
      icon: Clock,
      color: 'text-amber-600',
    },
    {
      title: 'Open Incidents',
      value: '3',
      change: '-2 from yesterday',
      icon: AlertTriangle,
      color: 'text-destructive',
    },
  ];

  const quickActions = [
    {
      title: 'Invite Member',
      value: '',
      change: 'Send invitation to new staff',
      icon: UserPlus,
      component: <InviteStaffDialog />,
    },
    { title: 'Invited Member', value: total, change: 'Total invited member', icon: Users },
    {
      title: 'View Member',
      value: '',
      change: 'See all Members',
      icon: Eye,
      component: <InviteListDialog />,
    },
  ];

  const upcomingShifts =
    shifts?.slice(0, 6).map((s) => ({
      id: s.id,
      staff: s.staffId?.name || 'Not Assigned',
      department: s?.department || 'Unknown',
      start: s.start,
      end: s.end,
      date: new Date(s.start).toLocaleDateString(),
      status: s.cancelled ? 'cancel' : 'pending',
    })) || [];

  const reportTypes = [
    {
      title: 'Document Reports',
      description: 'Access and generate document-related reports',
      icon: FileText,
      color: 'bg-primary/10 text-primary',
      count: 24,
    },
    {
      title: 'Incident Reports',
      description: 'View incident data and analysis',
      icon: AlertTriangle,
      color: 'bg-destructive/10 text-destructive',
      count: 8,
    },
    {
      title: 'Timesheet Reports',
      description: 'Staff hours and attendance reports',
      icon: Clock,
      color: 'bg-success/10 text-success',
      count: 12,
    },
    {
      title: 'Shift Reports',
      description: 'Shift scheduling and coverage reports',
      icon: Calendar,
      color: 'bg-accent/10 text-accent',
      count: 15,
    },
  ];

  const formatTimeRange = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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
            Here&apos;s what&apos;s happening at{' '}
            <span className="font-semibold text-primary">
              {currentOrganization?.name ?? 'MedAtlas'}
            </span>{' '}
            today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button size="sm" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            View Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-primary/10`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-card">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics Dashboard
              </h2>
              <p className="text-muted-foreground">Key metrics and performance indicators</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Staffing Overview</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4 mr-1" /> Last 7 days
                </div>
              </div>
              <div className="h-48 flex items-end space-x-2">
                {[65, 80, 70, 90, 85, 75, 95].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-primary rounded-t-md"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-muted-foreground mt-1">Day {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Incident Distribution</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <PieChart className="h-4 w-4 mr-1" /> This month
                </div>
              </div>
              <div className="h-48 flex items-center justify-center">
                <div className="relative w-40 h-40 rounded-full flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-8 border-destructive"></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-warning"
                    style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-amber-500"
                    style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-yellow-500"
                    style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0% 100%, 0% 50%)' }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full border-8 border-lime-500"
                    style={{ clipPath: 'polygon(50% 50%, 0% 50%, 0% 0%, 50% 0%)' }}
                  ></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">24</p>
                    <p className="text-xs text-muted-foreground">Total Incidents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report, i) => (
          <Card key={i} className="border border-border shadow-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
                  {report.count} reports
                </span>
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{report.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{report.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                View Reports
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              <span>Recent Activities</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Latest actions from your team members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    U{item}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">User {item}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed shift in Department {item}
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
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
                <CardTitle className="flex items-center space-x-2 text-foreground">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <span>Upcoming Shifts</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Next scheduled shifts for your team
                </CardDescription>
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
                {upcomingShifts.length > 0 ? (
                  upcomingShifts.map((shift) => (
                    <TableRow key={shift?.id} className="hover:bg-secondary/50 cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {shift.staff.charAt(0)}
                          </div>
                          <p className="font-medium text-foreground">{shift.staff}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{shift?.date}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTimeRange(shift.start, shift.end)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      No upcoming shifts found
                    </TableCell>
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
            <CardDescription className="text-muted-foreground">
              Common tasks and shortcuts for efficient management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, i) => (
                <Card key={i} className="border border-border shadow-card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <action.icon className="h-6 w-6 text-primary" />
                      </div>
                      {action.value !== '' && (
                        <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
                          {action.value}
                        </span>
                      )}
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
