'use client';
import React, { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { CalendarApi, DateSelectArg, EventClickArg, EventContentArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useAppDispatch } from "@/store/hooks";
import { deleteShift } from "@/store/slices/shifts";
import { Calendar, Clock, Edit, FileText, Trash, User, X } from "lucide-react";

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  staff?: string;
  notes?: string;
}

interface Props {
  view?: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";
  next?: boolean;
  prev?: boolean;
  today?: boolean;
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent?: (event: Event) => void;
  removeEvent?: (eventId: string) => void;
  onEventClick?: (event: Event) => void;
}

export default function StaffSchedulingPage({
  view = "timeGridWeek",
  next,
  prev,
  today,
  events,
  addEvent,
  updateEvent,
  onEventClick
}: Props) {
  const calendarRef = useRef<FullCalendar>(null);
  const dispatch = useAppDispatch();
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const updateCurrentDate = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      setCurrentDate(calendarApi.getDate());
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const newEvent: Event = {
      id: String(Date.now()),
      title: "New Shift",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    }
    addEvent(newEvent);
    calendarRef.current?.getApi().unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo);
  };

  const handleUpdate = () => {
    if (selectedEvent && onEventClick) {
      const updatedEvent: Event = {
        id: selectedEvent.event.id,
        title: selectedEvent.event.title + "(Updated)",
        start: selectedEvent.event.startStr,
        end: selectedEvent.event.endStr,
        ...selectedEvent.event.extendedProps,
      };
      onEventClick(updatedEvent);
    }
    setSelectedEvent(null);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    dispatch(deleteShift(selectedEvent.event.id));
    setSelectedEvent(null);
  };

  const handleEventDrop = (dropInfo: { event: { id: string; title: string; startStr: string; endStr: string; extendedProps: Record<string, unknown> } }) => {
    if (!updateEvent) return;

    const updatedEvent: Event = {
      id: dropInfo.event.id,
      title: dropInfo.event.title,
      start: dropInfo.event.startStr,
      end: dropInfo.event.endStr,
      ...dropInfo.event.extendedProps,
    };

    updateEvent(updatedEvent);
  };

  const eventContent = (eventInfo: EventContentArg) => {
    const start = eventInfo.event.start
      ? new Date(eventInfo.event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "";
    const end = eventInfo.event.end
      ? new Date(eventInfo.event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "";

    const bgColor = eventInfo.event.extendedProps.type === 'Consulting'
      ? 'bg-blue-100'
      : eventInfo.event.extendedProps.type === 'Support'
        ? 'bg-green-100'
        : 'bg-gray-100';

    return (
      <div className={`${bgColor} p-2 rounded-md border-l-4 border-blue-500`}>
        <div className="font-semibold text-gray-800 truncate">{eventInfo.event.title}</div>
        <div className="text-xs text-gray-600">{start} - {end}</div>
      </div>
    );
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
    updateCurrentDate();
  };
  const handleNext = () => {
    calendarRef.current?.getApi().next();
    updateCurrentDate();
  };
  const handleToday = () => {
    calendarRef.current?.getApi().today();
    updateCurrentDate();
  };
  const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  useEffect(() => {
    const calendarApi: CalendarApi | null | undefined = calendarRef.current?.getApi();
    if (!calendarApi) return;

    setTimeout(() => {
      if (view) calendarApi.changeView(view);
      if (next) { calendarApi.next(); updateCurrentDate(); }
      if (prev) { calendarApi.prev(); updateCurrentDate(); }
      if (today) { calendarApi.today(); updateCurrentDate(); }
    }, 0);
  }, [view, next, prev, today]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrev} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Prev</button>
          <button onClick={handleToday} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Today</button>
          <button onClick={handleNext} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">Next</button>
        </div>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView={view}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        height="100vh"
        select={handleDateSelect}
        eventContent={eventContent}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        headerToolbar={false}
        validRange={{
          start: new Date().toISOString().split('T')[0]
        }}
      />

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-4 border border-gray-100 transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-2xl font-bold text-gray-800">Shift Details</h3>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setSelectedEvent(null)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium text-gray-800">{selectedEvent?.event.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-green-50 rounded-xl">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Clock size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start</p>
                    <p className="font-medium text-gray-800">{formatTime(selectedEvent?.event.start)}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-red-50 rounded-xl">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <Clock size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End</p>
                    <p className="font-medium text-gray-800">{formatTime(selectedEvent?.event.end)}</p>
                  </div>
                </div>
              </div>

              {selectedEvent?.event.extendedProps.staff && (
                <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                  <div className="p-2 bg-purple-100 rounded-lg mr-4">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Staff</p>
                    <p className="font-medium text-gray-800">{selectedEvent.event.extendedProps.staff}</p>
                  </div>
                </div>
              )}

              {selectedEvent?.event.extendedProps.notes && (
                <div className="p-4 bg-orange-50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <FileText size={18} className="text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-500">Notes</p>
                  </div>
                  <p className="text-gray-800 ml-11">{selectedEvent.event.extendedProps.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all transform flex-1 shadow-md" onClick={handleUpdate}>
                <Edit size={18} className="mr-2" />
                Edit
              </button>
              <button className="flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all transform flex-1 shadow-md" onClick={handleDelete}>
                <Trash size={18} className="mr-2" />
                Delete
              </button>
              <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all flex-1 shadow-md" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}