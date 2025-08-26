'use client';

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import StaffSchedulingPage, { Event } from "@/components/dashboard/EnhancedSchedulingCalendar";
import { useState } from "react";
import {
  Calendar,
  Users,
  Plus,
  Download,
  Upload,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import CustomDropdown from "@/components/layout/Dropdown/Dropdown";

export default function SchedulingPage() {
  const [showStats, setShowStats] = useState(true);
  const [calendarView, setCalendarView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek">("dayGridMonth");

  const [events, setEvents] = useState<Event[]>([]);

  const [showAddShiftForm, setShowAddShiftForm] = useState(false);
  const [newShift, setNewShift] = useState({
    title: "",
    type: "Consulting",
    staff: "",
    client: "",
    start: "",
    end: "",
  });

  const stats = [
    { label: "Scheduled Shifts", value: "24", change: "+3", trend: "up" },
    { label: "Available Staff", value: "8", change: "+2", trend: "up" },
    { label: "Unassigned Shifts", value: "3", change: "-1", trend: "down" },
    { label: "This Week Hours", value: "187", change: "+12", trend: "up" },
  ];

  const calendarOptions = [
    { label: "Month", value: "dayGridMonth" },
    { label: "Week", value: "timeGridWeek" },
    { label: "Day", value: "timeGridDay" },
    { label: "List", value: "listWeek" },
  ];

  const addEvent = (event: Event) => {
    setEvents((prev) => [...prev, event]);
  };

  const removeEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const updateEvent = (updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6 container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Scheduling</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage staff assignments and shift schedules
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <Download className="h-4 w-4 mr-2" /> Export
            </button>
            <button
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowAddShiftForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> New Shift
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            onClick={() => setShowStats(!showStats)}
          >
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="font-medium text-gray-800 dark:text-gray-200">Schedule Overview</span>
            </div>
            {showStats ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>

          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</div>
                  <div className="flex items-baseline mt-1">
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stat.value}</span>
                    <span className={`ml-2 text-sm font-medium ${stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                <span className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </span>
                Staff Scheduling Calendar
              </h2>
              <CustomDropdown
                label=""
                options={calendarOptions}
                value={calendarView}
                onChange={(val) => setCalendarView(val as any)}
              />
            </div>
            <div className="h-[100%]">
              <StaffSchedulingPage
                view={calendarView}
                events={events}
                addEvent={addEvent}
                updateEvent={updateEvent}
                removeEvent={removeEvent}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help with scheduling? <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">View guidelines</span>
          </p>
          <div className="flex items-center space-x-3">
            <button className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200">
              <Upload className="h-4 w-4 mr-1" /> Import Schedule
            </button>
            <button className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              <Download className="h-4 w-4 mr-1" /> Download Template
            </button>
          </div>
        </div>

        {showAddShiftForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Add New Shift</h3>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Shift Title"
                  value={newShift.title}
                  onChange={(e) => setNewShift({ ...newShift, title: e.target.value })}
                  className="p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />

                <select
                  value={newShift.type}
                  onChange={(e) => setNewShift({ ...newShift, type: e.target.value })}
                  className="p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                >
                  <option value="Consulting">Consulting</option>
                  <option value="Support">Support</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="text"
                  placeholder="Staff Name"
                  value={newShift.staff}
                  onChange={(e) => setNewShift({ ...newShift, staff: e.target.value })}
                  className="p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />

                <input
                  type="text"
                  placeholder="Client Name"
                  value={newShift.client}
                  onChange={(e) => setNewShift({ ...newShift, client: e.target.value })}
                  className="p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />

                <input
                  type="datetime-local"
                  value={newShift.start}
                  onChange={(e) => setNewShift({ ...newShift, start: e.target.value })}
                  className="p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />

                <input
                  type="datetime-local"
                  value={newShift.end}
                  onChange={(e) => setNewShift({ ...newShift, end: e.target.value })}
                  className="p-2 border rounded border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowAddShiftForm(false)}
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newShift.title || !newShift.start || !newShift.end) {
                        alert("Please fill in title, start, and end times.");
                        return;
                      }
                      addEvent({
                        id: Math.random().toString(36).substr(2, 9),
                        title: `${newShift.title} (${newShift.staff})`,
                        start: newShift.start,
                        end: newShift.end,
                      });
                      setShowAddShiftForm(false);
                      setNewShift({ title: "", type: "Consulting", staff: "", client: "", start: "", end: "" });
                    }}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add Shift
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
