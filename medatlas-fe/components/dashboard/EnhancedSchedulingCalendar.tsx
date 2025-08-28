'use client';
import React, { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { CalendarApi, DateSelectArg, EventClickArg, EventContentArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  staff?: string;
  client?: string;
  type?: string;
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
}

export default function StaffSchedulingPage({ view = "timeGridWeek", next, prev, today, events, addEvent, updateEvent, removeEvent }: Props) {
  const calendarRef = useRef<FullCalendar>(null);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!addEvent) return;

    const newEvent: Event = {
      id: String(Date.now()),
      title: "New Shift",
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    };

    addEvent(newEvent);
    calendarRef.current?.getApi().unselect();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (!removeEvent) return;

    if (confirm(`Delete event '${clickInfo.event.title}'?`)) {
      removeEvent(clickInfo.event.id);
    }
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
        {eventInfo.event.extendedProps.staff && (
          <div className="text-xs text-gray-700 truncate">Staff: {eventInfo.event.extendedProps.staff}</div>
        )}
        {eventInfo.event.extendedProps.client && (
          <div className="text-xs text-gray-700 truncate">Client: {eventInfo.event.extendedProps.client}</div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const calendarApi: CalendarApi | null | undefined = calendarRef.current?.getApi();
    if (!calendarApi) return;

    setTimeout(() => {
      if (view) calendarApi.changeView(view);
      if (next) calendarApi.next();
      if (prev) calendarApi.prev();
      if (today) calendarApi.today();
    }, 0);
  }, [view, next, prev, today]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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
      />
    </div>
  );
}
