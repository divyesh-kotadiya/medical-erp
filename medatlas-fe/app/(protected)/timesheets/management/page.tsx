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
} from '@/store/slices/timesheets';
import { mapEntryToDisplay } from '@/lib/time';
import CustomDropdown from '@/components/layout/Dropdown/Dropdown';


export default function TimesheetList() {
  const dispatch = useAppDispatch();
  const { entries, loading, submittedList, submissionStatus } = useAppSelector(
    (state) => state.timesheets
  );
  const { user } = useAppSelector((state) => state.auth)
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
    dispatch(
      fetchEntries({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      })
    );
    dispatch(
      fetchSubmittedTimesheets({
        from: periodStart.toISOString(),
        to: periodEnd.toISOString(),
        userId: user?.id
      })
    );
    dispatch(
      fetchWeeklyTotal({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      })
    );
    dispatch(
      checkSubmissionStatus({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      })
    );
  }, [dispatch, periodStart, periodEnd, user?.id]);


  const formatTimeEntries = () => entries.map((entry) => mapEntryToDisplay(entry));

  const handleSubmitWeek = async () => {
    await dispatch(
      submitWeek({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      })
    );
    await dispatch(
      fetchSubmittedTimesheets({
        from: periodStart.toISOString(),
        to: periodEnd.toISOString(),
      })
    );
  };


  const handleDownloadWeek = async () => {
    try {
      const resultAction = await dispatch(
        downloadTimesheet({
          userId: user?.id,
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
        })
      );

      if (downloadTimesheet.fulfilled.match(resultAction)) {
        const blob = resultAction.payload;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Timesheet_${periodStart.toLocaleDateString()}_to_${periodEnd.toLocaleDateString()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Download failed:", resultAction.payload);
      }
    } catch (error) {
      console.error("Unexpected error downloading timesheet:", error);
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
    console.log(submissionStatus, submittedList)
    if (submittedList?.length) {
      const match = submittedList.find(
        (t) =>
          new Date(t.periodStart).toISOString() === periodStart.toISOString() &&
          new Date(t.periodEnd).toISOString() === periodEnd.toISOString()
      );

      if (match?.status) {
        return match.status.toUpperCase() as 'SUBMITTED' | 'APPROVED' | 'REJECTED';
      }
    }

    if (submissionStatus) {
      return submissionStatus.toUpperCase() as 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    }

    return 'NOT_SUBMITTED';
  }, [submittedList, submissionStatus, periodStart, periodEnd]);


  const handleWeekChange = async (value: string) => {
    setAnchorDate(new Date(value));
    await dispatch(
      checkSubmissionStatus({
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      })
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
            <ListChecks className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Weekly TimeSheet Management
          </h2>
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

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700">
              <th className="p-4">Date</th>
              <th className="p-4">Check In</th>
              <th className="p-4">Check Out</th>
              <th className="p-4">Meal Break</th>
              <th className="p-4">Working Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Loading time entries...
                </td>
              </tr>
            ) : formatTimeEntries().length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No time entries found for this week.
                </td>
              </tr>
            ) : (
              formatTimeEntries().map((entry) => (
                <tr key={entry.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4">{entry.date}</td>
                  <td className="p-4">{entry.checkIn}</td>
                  <td className="p-4">{entry.checkOut}</td>
                  <td className="p-4">{entry.mealBreak}</td>
                  <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{entry.workingHours}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2 pt-6">
        <button
          onClick={handleDownloadWeek}
          className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 py-2 px-3 rounded-lg transition-colors"
          disabled={formatTimeEntries().length === 0}
        >
          <Download size={16} /> Export
        </button>
        {(weekStatus === "REJECTED" || weekStatus === "NOT_SUBMITTED") && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:opacity-80 transition-all disabled:opacity-50"
            onClick={handleSubmitWeek}
            disabled={loading || formatTimeEntries().length === 0}
          >
            Submit Week
          </button>
        )}


        {weekStatus === "SUBMITTED" && (
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
            disabled
          >
            Submitted
          </button>
        )}

        {weekStatus === "APPROVED" && (
          <span className="px-4 py-2 bg-gray-400  text-white rounded-md">
            Approved
          </span>
        )}
      </div>


    </div>
  );
};
