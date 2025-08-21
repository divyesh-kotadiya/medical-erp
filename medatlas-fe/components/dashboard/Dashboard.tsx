'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import InviteStaffDialog from '../layout/Dialog/InviteStaffDialog';
import { UserRole } from '@/constants/UserRole/role';

const stats = [
  {
    title: 'Active Staff',
    value: '127',
    change: '+5 this week',
    icon: Users,
    color: 'text-primary'
  },
  {
    title: 'Today\'s Shifts',
    value: '34',
    change: '12 remaining',
    icon: Calendar,
    color: 'text-accent'
  },
  {
    title: 'Hours This Week',
    value: '2,847',
    change: '+12% vs last week',
    icon: Clock,
    color: 'text-warning'
  },
  {
    title: 'Open Incidents',
    value: '3',
    change: '-2 from yesterday',
    icon: AlertTriangle,
    color: 'text-destructive'
  }
];

const recentActivities = [
  {
    id: 1,
    user: 'Dr. Michael Chen',
    action: 'Completed shift',
    department: 'Emergency',
    time: '10 minutes ago',
    status: 'completed'
  },
  {
    id: 2,
    user: 'Sarah Williams',
    action: 'Submitted timesheet',
    department: 'ICU',
    time: '25 minutes ago',
    status: 'pending'
  },
  {
    id: 3,
    user: 'James Rodriguez',
    action: 'Reported incident',
    department: 'Pediatrics',
    time: '1 hour ago',
    status: 'urgent'
  },
  {
    id: 4,
    user: 'Dr. Emily Davis',
    action: 'Updated schedule',
    department: 'Surgery',
    time: '2 hours ago',
    status: 'completed'
  }
];

const invitedStaffCount = 12; 

const newstates = [
  {
    title: "Invite Member",
    value: "",
    change: "Send invitation to new staff",
    icon: UserPlus,
    component: <InviteStaffDialog />,
  },
  {
    title: "Invited Member",
    value: invitedStaffCount,
    change: "Total invited member",
    icon: Users,
  },
  {
    title: "View Member",
    value: "",
    change: "See all Member",
    icon: Eye,
    button: true, 
  },
  {
    title: "Manage Roles",
    value: "",
    change: "Update Member roles",
    icon: UserPlus,
    button: true,
  },
];

const upcomingShifts = [
  {
    id: 1,
    staff: 'Dr. Robert Kim',
    department: 'Emergency',
    time: '14:00 - 22:00',
    date: 'Today',
    status: 'confirmed'
  },
  {
    id: 2,
    staff: 'Lisa Thompson',
    department: 'ICU',
    time: '22:00 - 06:00',
    date: 'Tonight',
    status: 'confirmed'
  },
  {
    id: 3,
    staff: 'Mark Johnson',
    department: 'Surgery',
    time: '06:00 - 14:00',
    date: 'Tomorrow',
    status: 'pending'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-success text-success-foreground';
    case 'pending': return 'bg-warning text-warning-foreground';
    case 'urgent': return 'bg-destructive text-destructive-foreground';
    case 'confirmed': return 'bg-primary text-primary-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const Dashboard = () => {
  const { user, tenant } = useAppSelector((state) => state.auth);
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className='flex flex-col space-y-2'>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name ?? "Guest"}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening at{" "}
            <span className="font-semibold text-primary">
              {tenant?.name ?? "MedAtlas"}
            </span>{" "}
            today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm" className="bg-gradient-primary">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Recent Activities</span>
            </CardTitle>
            <CardDescription>
              Latest actions from your team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-foreground">{activity.user}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.department}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>Upcoming Shifts</span>
            </CardTitle>
            <CardDescription>
              Next scheduled shifts for your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingShifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{shift.staff}</p>
                        <p className="text-sm text-muted-foreground">{shift.date}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {shift.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{shift.time}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(shift.status)}>
                        {shift.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      {
        user?.role === UserRole.ADMIN && (
          <Card className=" border border-border/50 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts for efficient management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {newstates.map((stat, index) => (
                  <Card
                    key={index}
                    className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center  justify-between">
                        <div className='flex flex-col space-y-4'>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>

                          {stat.value !== "" && (
                            <p className="text-2xl font-bold text-foreground">
                              {stat.value}
                            </p>
                          )}

                          {stat.change && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {stat.change}
                            </p>
                          )}

                          {stat.component && <div className="mt-3">{stat.component}</div>}

                          {stat.button && (
                            <button className=" w-full bg-gradient-primary text-white py-2 px-4 rounded-lg shadow hover:shadow-lg transition">
                              {stat.title}
                            </button>
                          )}
                        </div>

                        <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      }
    </div>
  );
};
