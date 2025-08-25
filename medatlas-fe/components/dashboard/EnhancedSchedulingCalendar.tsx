'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  date: string;
  staff?: string;
}

interface Props {
  staffFilter?: string;
}

export const EnhancedSchedulingCalendar = ({ staffFilter }: Props) => {
  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: 'Morning Shift – Home Visit (John Carter)', date: '2025-08-22', staff: 'Alicia Patel (RN)' },
    { id: '2', title: 'Evening Shift – Medication Administration (Mary Wang)', date: '2025-08-22', staff: 'Brian Lee (CNA)' },
    { id: '3', title: 'Overnight Shift – Hospice Care (John Carter)', date: '2025-08-23', staff: 'Chloe Singh (LPN)' },
    { id: '4', title: 'Physical Therapy Session (Mary Wang)', date: '2025-08-24', staff: 'Alicia Patel (RN)' },
    { id: '5', title: 'Daily Care – Home Assistance (John Carter)', date: '2025-08-25', staff: 'Brian Lee (CNA)' }
  ]);

  const handleDateClick = (arg: any) => {
    const title = prompt('Enter event title:');
    if (title) {
      const newEvent = {
        id: String(new Date().getTime()),
        title,
        date: arg.dateStr
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const action = prompt(
      `Edit title for '${clickInfo.event.title}' or type 'delete' to remove:`,
      clickInfo.event.title
    );

    if (!action) return;

    if (action.toLowerCase() === 'delete') {
      clickInfo.event.remove();
      setEvents(events.filter(e => e.id !== clickInfo.event.id));
    } else {
      clickInfo.event.setProp('title', action);
      setEvents(events.map(e => e.id === clickInfo.event.id ? { ...e, title: action } : e));
    }
  };

  const handleEventChange = (changeInfo: any) => {
    setEvents(events.map(e =>
      e.id === changeInfo.event.id
        ? { ...e, title: changeInfo.event.title, date: changeInfo.event.startStr }
        : e
    ));
  };

  const filteredEvents = staffFilter ? events.filter(e => e.staff === staffFilter) : events;

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      editable
      selectable
      events={filteredEvents}
      dateClick={handleDateClick}
      eventClick={handleEventClick}
      eventChange={handleEventChange}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      }}
      height="100%"
      dayCellClassNames={(arg) =>
        arg.isToday
          ? 'bg-accent/20 rounded-xl font-semibold text-accent transition-all'
          : 'hover:bg-muted/50 transition-all rounded-xl'
      }
      dayHeaderClassNames={() =>
        'bg-card text-foreground font-semibold py-2 border-b border-border rounded-t-xl'
      }
      eventClassNames={() =>
        'cursor-pointer bg-gradient-primary text-primary-foreground rounded-xl px-3 py-1 text-sm shadow hover:scale-105 transition-all'
      }
    />
  );
};
