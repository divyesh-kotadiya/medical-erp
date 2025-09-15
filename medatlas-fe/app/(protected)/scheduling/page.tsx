"use client";

import StaffSchedulingPage, { Event } from "@/components/dashboard/EnhancedSchedulingCalendar";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createShift, fetchShifts, updateShift } from "@/store/slices/shifts";
import { Calendar, Plus, X } from "lucide-react";
import CustomDropdown from "@/components/layout/Dropdown/Dropdown";
import { fetchMembers } from "@/store/slices/auth";
import SearchableDropdown from "@/components/layout/SearchableDropdown/SearchableDropdown";
import Button from "@/components/layout/Button/Button";

export default function SchedulingPage() {
  const dispatch = useAppDispatch();
  const { shifts, loading } = useAppSelector((state) => state.shifts);
  const { members, tenant } = useAppSelector((state) => state.auth);

  const [calendarView, setCalendarView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek">("dayGridMonth");
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [error, setError] = useState("");

  const [currentShift, setCurrentShift] = useState({
    id: "",
    title: "",
    staff: "",
    start: "",
    end: "",
    notes: "",
  });

  const staffOptions = members.map((m) => ({ label: m.name, value: m._id }));

  useEffect(() => {
    dispatch(fetchShifts());
    dispatch(fetchMembers());
  }, [dispatch]);

  const calendarOptions = [
    { label: "Month", value: "dayGridMonth" },
    { label: "Week", value: "timeGridWeek" },
    { label: "Day", value: "timeGridDay" },
    { label: "List", value: "listWeek" },
  ];

  const nowDateTime = new Date().toISOString().slice(0, 16);

  const validateShift = (shift: typeof currentShift) => {
    if (!shift.title || !shift.start || !shift.end || !shift.staff) {
      return "Please fill in all required fields.";
    }
    if (shift.start < nowDateTime) {
      return "Start date/time cannot be in the past.";
    }
    if (shift.end < shift.start) {
      return "End date/time cannot be before start date/time.";
    }
    return "";
  };

  const handleEventClick = (event: Event) => {
    setCurrentShift({
      id: event.id || "",
      title: event.title,
      staff: event.staff || "",
      start: event.start,
      end: event.end,
      notes: event.notes || "",
    });
    setError("");
    setShowShiftForm(true);
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentShift((prev) => ({ ...prev, start: value }));
    setError(validateShift({ ...currentShift, start: value }));

    if (currentShift.end && currentShift.end < value) {
      setCurrentShift((prev) => ({ ...prev, end: value }));
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentShift((prev) => ({ ...prev, end: value }));
    setError(validateShift({ ...currentShift, end: value }));
  };

  const handleSaveShift = async () => {
    const errorMsg = validateShift(currentShift);
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    const shiftPayload = {
      tenantId: tenant?.id,
      staffId: currentShift.staff,
      title: currentShift.title,
      start: currentShift.start,
      end: currentShift.end,
      notes: currentShift.notes,
    };

    try {
      if (currentShift.id) {
        await dispatch(updateShift({ id: currentShift.id, data: shiftPayload }));
      } else {
        await dispatch(createShift(shiftPayload));
      }
      await dispatch(fetchShifts());
      setCurrentShift({ id: "", title: "", staff: "", start: "", end: "", notes: "" });
      setShowShiftForm(false);
      setError("");
    } catch (err) {
      setError("Failed to save shift. Please try again.");
    }
  };

  const events: Event[] =
    shifts?.map((s) => ({
      id: s._id,
      title: `${s.title} (${s.staffId ? s.staffId.name : "Not Assigned"})`,
      start: s.start,
      end: s.end,
      notes: s.notes,
      staff: s.staffId?._id || "",
    })) || [];

  return (
      <div className="flex flex-col gap-6 p-6 container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Scheduling</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage staff assignments and shift schedules</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              className="flex items-center px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                setCurrentShift({ id: "", title: "", staff: "", start: "", end: "", notes: "" });
                setError("");
                setShowShiftForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> New Shift
            </Button>
          </div>
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
                label="Calendar View"
                options={calendarOptions}
                value={calendarView}
                onChange={(val) =>
                  setCalendarView(
                    val as "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek"
                  )
                }
              />
            </div>

            <div className="h-[100%]">
              <StaffSchedulingPage
                view={calendarView}
                events={events}
                addEvent={() => { }}
                updateEvent={() => { }}
                removeEvent={() => { }}
                onEventClick={handleEventClick}
              />
            </div>
          </div>
        </div>

        {showShiftForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-2 h-6 bg-primary rounded-full mr-3"></div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {currentShift.id ? "Update Shift" : "Add New Shift"}
                  </h3>
                </div>
                <button
                  onClick={() => setShowShiftForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shift Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter shift title"
                    value={currentShift.title}
                    onChange={(e) => setCurrentShift({ ...currentShift, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Staff Member
                  </label>
                  <SearchableDropdown
                    options={staffOptions}
                    value={currentShift.staff}
                    onChange={(value) => setCurrentShift({ ...currentShift, staff: value })}
                    placeholder="Select staff member"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={currentShift.start}
                      min={nowDateTime}
                      onChange={handleStartChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={currentShift.end}
                      min={currentShift.start || nowDateTime}
                      onChange={handleEndChange}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Add notes (optional)"
                    value={currentShift.notes}
                    onChange={(e) => setCurrentShift({ ...currentShift, notes: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowShiftForm(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform shadow-md"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleSaveShift}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform  shadow-md flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : null}
                  {loading ? "Saving..." : currentShift.id ? "Update Shift" : "Add Shift"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
