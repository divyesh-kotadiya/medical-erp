'use client'

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  fetchStatus,
  fetchDailySummary,
  fetchEntries,
  clearError,
  resetTimesheetState,
} from "@/store/slices/timesheets";
import {
  formatHoursAsHhMm,
  getTodayBreakMinutes,
  mapEntryToDisplay,
} from "@/lib/time";

export default function Verification() {
  const dispatch = useAppDispatch();
  const { currentOrganization } = useAppSelector((state) => state.organizations)
  const { entries, status, dailySummary, loading, error } = useAppSelector(
    (state) => state.timesheets
  );

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentOrganization?.id) {
      dispatch(resetTimesheetState());
      dispatch(fetchStatus());
      dispatch(fetchDailySummary());
      dispatch(fetchEntries());
    }
  }, [dispatch, currentOrganization?.id]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleClockAction = async () => {
    if (status.isClockedIn) {
      dispatch(clockOut());
    } else {
      if (currentOrganization && currentOrganization?.id) {
        dispatch(clockIn({ tenantId: currentOrganization.id }));
      }
    }
  }

  const handleBreakAction = async () => {
    if (status.isOnBreak) {
      dispatch(endBreak());
    } else {
      dispatch(startBreak());
    }
  };

  const calculateBreakTime = () => Math.round(getTodayBreakMinutes(entries));

  const formatTimeEntries = () => entries.slice(0, 7).map((e) => mapEntryToDisplay(e));

  const timeEntries = formatTimeEntries();
  const breakTime = calculateBreakTime();

  return (
    <div className="bg-card rounded-xl shadow-card p-6 transition-all duration-300">
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center mb-4 md:mb-0">
          <span className="bg-primary/10 p-2.5 rounded-lg mr-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </span>
          Electronic Visit Verification
        </h2>
        <div className="text-sm text-muted-foreground bg-muted py-1.5 px-3 rounded-lg">
          {formatDate(currentTime)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20 transition-all duration-300 hover:shadow-card">
          <div className="text-sm text-muted-foreground mb-2">CURRENT STATUS</div>
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.isClockedIn ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
              {status.isClockedIn ? 'Clocked In' : 'Clocked Out'}
            </span>
            <button
              onClick={handleClockAction}
              disabled={loading || !currentOrganization?.id}
              className={`py-1.5 px-4 border border-transparent rounded-md text-sm font-medium text-primary-foreground transition-colors disabled:opacity-50 ${status.isClockedIn ? 'bg-destructive hover:bg-destructive/90' : 'bg-success hover:bg-success/90'}`}
            >
              {loading ? 'Loading...' : status.isClockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20 transition-all duration-300 hover:shadow-card">
          <div className="text-sm text-muted-foreground mb-1">CURRENT TIME</div>
          <div className="text-2xl font-bold text-foreground">{formatTime(currentTime)}</div>
          <div className="mt-3 text-sm text-muted-foreground flex items-center">
            <Clock className="w-4 h-4 mr-1.5" />
            Breaks: <span className="font-medium ml-1 text-foreground">{breakTime} mins</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20 transition-all duration-300 hover:shadow-card">
          <div className="text-sm text-muted-foreground mb-1">TODAY&apos;S HOURS</div>
          <div className="text-2xl font-bold text-foreground">{formatHoursAsHhMm(dailySummary.hours)} hrs</div>
          <div className="mt-3 text-sm text-muted-foreground">
            This Period: <span className="font-medium text-foreground">{formatHoursAsHhMm(dailySummary.hours * 7)} hrs</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20 transition-all duration-300 hover:shadow-card">
          <div className="text-sm text-muted-foreground mb-2">BREAK STATUS</div>
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.isOnBreak ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
              {status.isOnBreak ? 'On Break' : 'Active'}
            </span>
            <button
              onClick={handleBreakAction}
              disabled={loading || !status.isClockedIn}
              className={`py-1.5 px-4 border border-transparent rounded-md text-sm font-medium text-primary-foreground transition-colors disabled:opacity-50 ${status.isOnBreak ? 'bg-success hover:bg-success/90' : 'bg-warning hover:bg-warning/90'}`}
            >
              {loading ? 'Loading...' : status.isOnBreak ? 'End Break' : 'Start Break'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border shadow-card">
        <table className="w-full">
          <thead>
            <tr className="text-left text-muted-foreground text-sm font-medium bg-muted/50">
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Check In</th>
              <th className="p-4 font-semibold">Check Out</th>
              <th className="p-4 font-semibold">Meal Break</th>
              <th className="p-4 font-semibold">Working Hours</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {timeEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No time entries found. Start by clocking in!
                </td>
              </tr>
            ) : (
              timeEntries.map((entry) => (
                <tr key={entry.id} className="text-foreground hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      {entry.date === 'Today' && (
                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                      )}
                      {entry.date}
                    </div>
                  </td>
                  <td className="p-4">{entry.checkIn}</td>
                  <td className="p-4">
                    <span className={entry.checkOut === '--:--' ? 'text-muted-foreground' : ''}>
                      {entry.checkOut}
                    </span>
                  </td>
                  <td className="p-4">{entry.mealBreak}</td>
                  <td className="p-4 font-medium text-primary">{entry.workingHours}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.status === 'completed'
                      ? 'bg-success/10 text-success'
                      : 'bg-primary/10 text-primary'
                      }`}>
                      {entry.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}