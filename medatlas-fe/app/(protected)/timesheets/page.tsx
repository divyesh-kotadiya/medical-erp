'use client'

import { Clock, Download, Filter } from "lucide-react";
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
} from "@/store/slices/timesheets";
import {
  formatHoursAsHhMm,
  getTodayBreakMinutes,
  mapEntryToDisplay,
} from "@/lib/time";

export default function Verification() {
  const dispatch = useAppDispatch();
  const { tenant } = useAppSelector((state) => state.auth)
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
    dispatch(fetchStatus());
    dispatch(fetchDailySummary());
    dispatch(fetchEntries());
  }, [dispatch]);

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
      if (tenant && tenant?.id) {
        console.log(tenant.id)
        dispatch(clockIn({ tenantId: tenant.id }));
      }
    }}

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
    <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg p-6 transition-all duration-300">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center mb-4 md:mb-0">
          <span className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-lg mr-3">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </span>
          Electronic Visit Verification
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 py-1.5 px-3 rounded-lg">
          {formatDate(currentTime)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:shadow-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">CURRENT STATUS</div>
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.isClockedIn ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
              {status.isClockedIn ? 'Clocked In' : 'Clocked Out'}
            </span>
            <button
              onClick={handleClockAction}
              disabled={loading}
              className={`py-1.5 px-4 border border-transparent rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 ${status.isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {loading ? 'Loading...' : status.isClockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:shadow-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">CURRENT TIME</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(currentTime)}</div>
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-gray-400 dark:text-gray-500" />
            Breaks: <span className="font-medium ml-1 dark:text-gray-300">{breakTime} mins</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:shadow-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">TODAY&apos;S HOURS</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatHoursAsHhMm(dailySummary.hours)} hrs</div>
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            This Period: <span className="font-medium dark:text-gray-300">{formatHoursAsHhMm(dailySummary.hours * 7)} hrs</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:shadow-md">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">BREAK STATUS</div>
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.isOnBreak ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
              {status.isOnBreak ? 'On Break' : 'Active'}
            </span>
            <button
              onClick={handleBreakAction}
              disabled={loading || !status.isClockedIn}
              className={`py-1.5 px-4 border border-transparent rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 ${status.isOnBreak ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
            >
              {loading ? 'Loading...' : status.isOnBreak ? 'End Break' : 'Start Break'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700">
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Check In</th>
              <th className="p-4 font-semibold">Check Out</th>
              <th className="p-4 font-semibold">Meal Break</th>
              <th className="p-4 font-semibold">Working Hours</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {timeEntries.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No time entries found. Start by clocking in!
                </td>
              </tr>
            ) : (
              timeEntries.map((entry) => (
                <tr key={entry.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center">
                      {entry.date === 'Today' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      )}
                      {entry.date}
                    </div>
                  </td>
                  <td className="p-4">{entry.checkIn}</td>
                  <td className="p-4">
                    <span className={entry.checkOut === '--:--' ? 'text-gray-400 dark:text-gray-500' : ''}>
                      {entry.checkOut}
                    </span>
                  </td>
                  <td className="p-4">{entry.mealBreak}</td>
                  <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{entry.workingHours}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entry.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
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
};