'use client';
import { useState } from 'react';
import { ListChecks } from 'lucide-react';

export const TimesheetList = () => {
  const [submitted, setSubmitted] = useState(false);
  const [approved, setApproved] = useState(false);
  const [timeEntries, setTimeEntries] = useState([
    { date: '2025-08-19', checkIn: '09:00', checkOut: '17:00', mealBreak: '1h', workingHours: '7h' },
    { date: '2025-08-20', checkIn: '08:30', checkOut: '16:30', mealBreak: '30m', workingHours: '7.5h' },
  ]);

  const handleDelete = (index: number) => {
    setTimeEntries((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center">
        <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
          <ListChecks className="text-blue-600 dark:text-blue-400" size={24} />
        </span>
        <span className="">Weekly TimeSheet Management</span>
      </h2>

      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50 dark:bg-gray-700">
              <th className="p-4">Date</th>
              <th className="p-4">Check In</th>
              <th className="p-4">Check Out</th>
              <th className="p-4">Meal Break</th>
              <th className="p-4">Working Hours</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {timeEntries.map((entry, index) => (
              <tr key={index} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4">{entry.date}</td>
                <td className="p-4">{entry.checkIn}</td>
                <td className="p-4">{entry.checkOut}</td>
                <td className="p-4">{entry.mealBreak}</td>
                <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{entry.workingHours}</td>
                <td className="p-4 space-x-2">
                  <button
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:opacity-80"
                    onClick={() => alert('Edit entry feature here')}
                    disabled={submitted}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:opacity-80"
                    onClick={() => handleDelete(index)}
                    disabled={submitted}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:opacity-80 transition-all"
          onClick={() => setSubmitted(true)}
          disabled={submitted}
        >
          Submit
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:opacity-80 transition-all"
          onClick={() => setApproved(true)}
          disabled={!submitted || approved}
        >
          Approve
        </button>
      </div>
    </div>
  );
};
