export type TimeBreakLike = {
  start: string | Date;
  end?: string | Date;
};

export type EntryLike = {
  clockIn: string | Date;
  clockOut?: string | Date;
  breaks: TimeBreakLike[];
  staffId?: string | {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

export function formatClockTime(d: string | Date): string {
  return toDate(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatLongDate(d: string | Date): string {
  return toDate(d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDisplayDate(d: string | Date): string {
  const date = toDate(d);
  const isToday = date.toDateString() === new Date().toDateString();
  if (isToday) return 'Today';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatHoursAsHhMm(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
}

export function getBreakMinutes(breaks: TimeBreakLike[] = []): number {
  return breaks.reduce((total, b) => {
    if (!b.end) return total;
    const start = toDate(b.start).getTime();
    const end = toDate(b.end).getTime();
    return total + Math.max(0, (end - start) / (1000 * 60));
  }, 0);
}

export function getWorkingHoursForEntry(entry: EntryLike): number {
  const clockInMs = toDate(entry.clockIn).getTime();
  const endMs = entry.clockOut ? toDate(entry.clockOut).getTime() : Date.now();
  const totalMinutes = Math.max(0, (endMs - clockInMs) / (1000 * 60));
  const breakMinutes = getBreakMinutes(entry.breaks);
  return Math.max(0, (totalMinutes - breakMinutes) / 60);
}

export function getTodayBreakMinutes(entries: EntryLike[]): number {
  const today = new Date().toDateString();
  return entries
    .filter((e) => toDate(e.clockIn).toDateString() === today)
    .reduce((sum, e) => sum + getBreakMinutes(e.breaks), 0);
}

export function mapEntryToDisplay(entry: EntryLike & { _id?: string }) {
  const date = toDate(entry.clockIn);
  const breakMinutes = getBreakMinutes(entry.breaks);
  const workingHours = getWorkingHoursForEntry(entry);
  
  const staffName = entry.staffId 
    ? typeof entry.staffId === 'string' 
      ? 'Unknown' 
      : `${entry.staffId.firstName || ''} ${entry.staffId.lastName || ''}`.trim() || entry.staffId.email || 'Unknown'
    : 'Unknown';

  return {
    id: (entry as { _id?: string })._id ?? `${date.getTime()}`,
    date: formatShortDisplayDate(date),
    checkIn: formatClockTime(date),
    checkOut: entry.clockOut ? formatClockTime(entry.clockOut) : '--:--',
    mealBreak: `${Math.round(breakMinutes)} min`,
    workingHours: `${formatHoursAsHhMm(workingHours)} hrs`,
    status: entry.clockOut ? 'completed' : 'in-progress',
    staffName,
  } as const;
}

