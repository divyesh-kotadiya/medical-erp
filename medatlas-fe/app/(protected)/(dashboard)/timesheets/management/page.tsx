'use client';
import { useState, useEffect, useMemo } from 'react';
import { ListChecks, Download } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchEntries,
  fetchWeeklyTotal,
  submitWeek,
  fetchSubmittedTimesheets,
  checkSubmissionStatus,
  downloadTimesheet,
  resetTimesheetState,
} from '@/store/slices/timesheets';
import { mapEntryToDisplay } from '@/lib/time';
import CustomDropdown from '@/components/layout/Dropdown/Dropdown';

export default function TimesheetList() {
  const dispatch = useAppDispatch();
  const { entries, loading, submittedList, submissionStatus } = useAppSelector(
    (state) => state.timesheets,
  );
  const { currentOrganization } = useAppSelector((state) => state.organizations);
  const { user } = useAppSelector((state) => state.auth);
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());

  const { periodStart, periodEnd } = useMemo(() => {
    const d = new Date(anchorDate);
    const day = d.getDay();
    const diffToMonday = (day + 6) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { periodStart: start, periodEnd: end };
  }, [anchorDate]);

  useEffect(() => {
    dispatch(resetTimesheetState());
    dispatch(
      fetchEntries({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      }),
    );
    dispatch(
      fetchSubmittedTimesheets({
        from: periodStart.toISOString(),
        to: periodEnd.toISOString(),
        userId: user?.id,
      }),
    );
    dispatch(
      fetchWeeklyTotal({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      }),
    );
    dispatch(
      checkSubmissionStatus({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      }),
    );
  }, [dispatch, periodStart, periodEnd, user?.id, currentOrganization?.id]);

  const formatTimeEntries = () => entries.map((entry) => mapEntryToDisplay(entry));

  const handleSubmitWeek = async () => {
    await dispatch(
      submitWeek({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      }),
    );
    await dispatch(
      fetchSubmittedTimesheets({
        from: periodStart.toISOString(),
        to: periodEnd.toISOString(),
      }),
    );
  };

  const handleDownloadWeek = async () => {
    try {
      const resultAction = await dispatch(
        downloadTimesheet({
          userId: user?.id,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
        }),
      );

      if (downloadTimesheet.fulfilled.match(resultAction)) {
        const blob = resultAction.payload;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Timesheet_${periodStart.toLocaleDateString()}_to_${periodEnd.toLocaleDateString()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Download failed:', resultAction.payload);
      }
    } catch (error) {
      console.error('Unexpected error downloading timesheet:', error);
    }
  };

  const weekOptions = useMemo(() => {
    const options: { label: string; value: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const refDate = new Date(today);
      refDate.setDate(today.getDate() - i * 7);
      const day = refDate.getDay();
      const diffToMonday = (day + 6) % 7;
      const start = new Date(refDate);
      start.setDate(refDate.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      options.push({
        label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
        value: start.toISOString(),
      });
    }
    return options;
  }, []);

  const weekStatus = useMemo<'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED'>(() => {
    if (submittedList?.length) {
      const match = submittedList.find(
        (t) =>
          new Date(t.periodStart).toISOString() === periodStart.toISOString() &&
          new Date(t.periodEnd).toISOString() === periodEnd.toISOString(),
      );

      if (match?.status) {
        return match.status.toUpperCase() as 'SUBMITTED' | 'APPROVED' | 'REJECTED';
      }
    }

    if (submissionStatus) {
      return submissionStatus.toUpperCase() as 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    }

    return 'NOT_SUBMITTED';
  }, [submittedList, submissionStatus, periodStart, periodEnd, currentOrganization?.id]);

  const handleWeekChange = async (value: string) => {
    setAnchorDate(new Date(value));
    await dispatch(
      checkSubmissionStatus({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      }),
    );
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 transition-all duration-300 hover:shadow-elevated">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-primary/10 p-3 rounded-lg mr-4">
            <ListChecks className="text-primary" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Weekly TimeSheet Management</h2>
        </div>

        <div className="flex items-center gap-2">
          <CustomDropdown
            label="Select Week"
            options={weekOptions}
            value={periodStart.toISOString()}
            onChange={handleWeekChange}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="text-left text-muted-foreground text-sm font-medium bg-muted/50">
              <th className="p-4">Date</th>
              <th className="p-4">Check In</th>
              <th className="p-4">Check Out</th>
              <th className="p-4">Meal Break</th>
              <th className="p-4">Working Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Loading time entries...
                </td>
              </tr>
            ) : formatTimeEntries().length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No time entries found for this week.
                </td>
              </tr>
            ) : (
              formatTimeEntries().map((entry) => (
                <tr key={entry.id} className="text-foreground hover:bg-muted/50 transition-colors">
                  <td className="p-4">{entry.date}</td>
                  <td className="p-4">{entry.checkIn}</td>
                  <td className="p-4">{entry.checkOut}</td>
                  <td className="p-4">{entry.mealBreak}</td>
                  <td className="p-4 font-medium text-primary">{entry.workingHours}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2 pt-6">
        <button
          onClick={handleDownloadWeek}
          className="flex items-center gap-1 text-sm text-muted-foreground bg-muted hover:bg-muted/80 py-2 px-3 rounded-lg transition-colors"
          disabled={formatTimeEntries().length === 0}
        >
          <Download size={16} /> Export
        </button>
        {(weekStatus === 'REJECTED' || weekStatus === 'NOT_SUBMITTED') && (
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all disabled:opacity-50"
            onClick={handleSubmitWeek}
            disabled={loading || formatTimeEntries().length === 0}
          >
            Submit Week
          </button>
        )}

        {weekStatus === 'SUBMITTED' && (
          <button
            className="px-4 py-2 bg-muted text-muted-foreground rounded-md cursor-not-allowed"
            disabled
          >
            Submitted
          </button>
        )}

        {weekStatus === 'APPROVED' && (
          <span className="px-4 py-2 bg-success text-success-foreground rounded-md">Approved</span>
        )}
      </div>
    </div>
  );
}
