'use client'
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSubmittedTimesheets, approveTimesheet, rejectTimesheet } from '@/store/slices/timesheets';

export const ApprovalsList = () => {
  const dispatch = useAppDispatch();
  const { submittedList, loading } = useAppSelector((s) => s.timesheets);

  useEffect(() => {
    dispatch(fetchSubmittedTimesheets({}));
  }, [dispatch]);

  const handleApprove = async (id: string) => {
    await dispatch(approveTimesheet({ timesheetId: id, approvedBy: 'admin' }));
    dispatch(fetchSubmittedTimesheets({}));
  };
  const handleReject = async (id: string) => {
    const reason = window.prompt('Reason for rejection?') || '';
    await dispatch(rejectTimesheet({ timesheetId: id, rejectedBy: 'admin', reason }));
    dispatch(fetchSubmittedTimesheets({}));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Submitted Timesheets</h2>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700">
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Period</th>
              <th className="p-3">Hours</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : (submittedList || []).length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No submissions</td></tr>
            ) : (
              (submittedList || []).map((ts: any) => (
                <tr key={ts._id} className="text-gray-700 dark:text-gray-300">
                  <td className="p-3">{ts.staffId?.name || '—'}</td>
                  <td className="p-3">{ts.staffId?.email || '—'}</td>
                  <td className="p-3">{new Date(ts.periodStart).toLocaleDateString()} - {new Date(ts.periodEnd).toLocaleDateString()}</td>
                  <td className="p-3 font-medium text-blue-600 dark:text-blue-400">{ts.hours}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs">{ts.status}</span></td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => handleApprove(ts._id)} className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:opacity-80">Approve</button>
                    <button onClick={() => handleReject(ts._id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:opacity-80">Reject</button>
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

export default ApprovalsList;


