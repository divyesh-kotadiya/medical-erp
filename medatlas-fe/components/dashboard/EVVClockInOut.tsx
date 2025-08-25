'use client'

import { useEffect, useState } from "react";

export const EVVClockInOut = () => {
  const [timeEntries, setTimeEntries] = useState([
    { date: 'Nov 21, 2023', checkIn: '9:00 AM', checkOut: '5:00 PM', mealBreak: '1:00 hr', workingHours: '8:00 hrs' },
    { date: 'Nov 20, 2023', checkIn: '9:00 AM', checkOut: '5:00 PM', mealBreak: '1:00 hr', workingHours: '8:00 hrs' },
    { date: 'Nov 19, 2023', checkIn: '9:00 AM', checkOut: '5:00 PM', mealBreak: '1:00 hr', workingHours: '8:00 hrs' },
    { date: 'Nov 18, 2023', checkIn: '9:00 AM', checkOut: '5:00 PM', mealBreak: '1:00 hr', workingHours: '8:00 hrs' },
    { date: 'Nov 18, 2023', checkIn: '9:00 AM', checkOut: '5:00 PM', mealBreak: '1:00 hr', workingHours: '8:00 hrs' },
    { date: 'Nov 18, 2023', checkIn: '9:00 AM', checkOut: '5:00 PM', mealBreak: '1:00 hr', workingHours: '8:00 hrs' },
    { date: 'Nov 18, 2023', checkIn: '9:00 AM', checkOut: '5:00 PM', mealBreak: '1:00 hr', workingHours: '8:00 hrs' },

  ]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleClockStatus = () => {
    setIsClockedIn(!isClockedIn);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center">
        <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </span>
        Electronic Visit Verifications
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-blue-100 dark:border-gray-700 transition-all duration-300 ">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">NOV 23</div>
          <div className="flex space-x-2">
            <button className="flex-1 py-2 px-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
              Start Break
            </button>
            <button
              onClick={toggleClockStatus}
              className={`flex-1 py-2 px-3 border border-transparent rounded-md text-sm font-medium text-white transition-colors ${isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            >
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-blue-100 dark:border-gray-700 transition-all duration-300 ">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Time</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">{formatTime(currentTime)}</div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Breaks: <span className="font-medium ml-1 dark:text-gray-300">0:30 mins</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-blue-100 dark:border-gray-700 transition-all duration-300 ">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">This Pay Period</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">45:56 hrs</div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Total Hours: <span className="font-medium dark:text-gray-300">1,890 hrs</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-xl border border-blue-100 dark:border-gray-700 transition-all duration-300 ">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</div>
          <button className="w-full py-2 px-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors flex items-center justify-between">
            Filter by Date
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
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
            {timeEntries.map((entry, index) => (
              <tr key={index} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="p-4">{entry.date}</td>
                <td className="p-4">{entry.checkIn}</td>
                <td className="p-4">{entry.checkOut}</td>
                <td className="p-4">{entry.mealBreak}</td>
                <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{entry.workingHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};