'use client';
import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import {
  CalendarApi,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useAppDispatch } from '@/store/hooks';
import { deleteShift } from '@/store/slices/shifts';
import { Calendar, Clock, Edit, FileText, Trash, User, X } from 'lucide-react';
import Button from '../layout/Button/Button';

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  staff?: string;
  notes?: string;
}

interface Props {
  view?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
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
  view = 'timeGridWeek',
  next,
  prev,
  today,
  events,
  addEvent,
  updateEvent,
  onEventClick,
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
      title: 'New Shift',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    };
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
        title: selectedEvent.event.title + '(Updated)',
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

  const handleEventDrop = (dropInfo: {
    event: {
      id: string;
      title: string;
      startStr: string;
      endStr: string;
      extendedProps: Record<string, unknown>;
    };
  }) => {
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
      ? new Date(eventInfo.event.start).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    const end = eventInfo.event.end
      ? new Date(eventInfo.event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    const bgColor =
      eventInfo.event.extendedProps.type === 'Consulting'
        ? 'bg-primary'
        : eventInfo.event.extendedProps.type === 'Support'
          ? 'bg-success/20'
          : 'bg-muted';

    return (
      <div className={`${bgColor} p-2 rounded-md border-l-4 border-primary`}>
        <div className="font-semibold text-foreground truncate">{eventInfo.event.title}</div>
        <div className="text-xs text-muted-foreground">
          {start} - {end}
        </div>
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
      if (next) {
        calendarApi.next();
        updateCurrentDate();
      }
      if (prev) {
        calendarApi.prev();
        updateCurrentDate();
      }
      if (today) {
        calendarApi.today();
        updateCurrentDate();
      }
    }, 0);
  }, [view, next, prev, today]);

  return (
    <div className="p-6 bg-background min-h-screen relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrev} className="px-3 py-1 bg-muted rounded hover:bg-muted/80">
            Prev
          </button>
          <button onClick={handleToday} className="px-3 py-1 bg-muted rounded hover:bg-muted/80">
            Today
          </button>
          <button onClick={handleNext} className="px-3 py-1 bg-muted rounded hover:bg-muted/80">
            Next
          </button>
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
          start: new Date().toISOString().split('T')[0],
        }}
      />

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-elevated p-8 w-full max-w-2xl mx-4 border border-border transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-2 h-6 bg-primary rounded-full mr-3"></div>
                <h3 className="text-2xl font-bold text-foreground">Shift Details</h3>
              </div>
              <button
                className="p-2 hover:bg-muted rounded-full transition-colors"
                onClick={() => setSelectedEvent(null)}
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-center p-4 bg-primary/10 rounded-xl">
                <div className="p-2 bg-primary/20 rounded-lg mr-4">
                  <Calendar size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium text-foreground">{selectedEvent?.event.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-success/10 rounded-xl">
                  <div className="p-2 bg-success/20 rounded-lg mr-3">
                    <Clock size={18} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start</p>
                    <p className="font-medium text-foreground">
                      {formatTime(selectedEvent?.event.start)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-destructive/10 rounded-xl">
                  <div className="p-2 bg-destructive/20 rounded-lg mr-3">
                    <Clock size={18} className="text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End</p>
                    <p className="font-medium text-foreground">
                      {formatTime(selectedEvent?.event.end)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedEvent?.event.extendedProps.staff && (
                <div className="flex items-center p-4 bg-accent/10 rounded-xl">
                  <div className="p-2 bg-accent/20 rounded-lg mr-4">
                    <User size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Staff</p>
                    <p className="font-medium text-foreground">
                      {selectedEvent.event.extendedProps.staff}
                    </p>
                  </div>
                </div>
              )}

              {selectedEvent?.event.extendedProps.notes && (
                <div className="p-4 bg-warning/10 rounded-xl">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-warning/20 rounded-lg mr-3">
                      <FileText size={18} className="text-warning" />
                    </div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                  </div>
                  <p className="text-foreground ml-11">{selectedEvent.event.extendedProps.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex items-center justify-center px-6 py-3 rounded-xl transition-all transform flex-1 shadow-card"
                onClick={handleUpdate}
              >
                <Edit size={18} className="mr-2" />
                Edit
              </Button>
              <Button
                variant="danger"
                className="flex items-center justify-center px-6 py-3 rounded-xl transition-all transform flex-1 shadow-card"
                onClick={handleDelete}
              >
                <Trash size={18} className="mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
