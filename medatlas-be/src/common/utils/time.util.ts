import { TimeEntry } from 'src/modules/Timesheets/schemas/time-entry.schema';

export function calculateEntryWorkingMs(entry: TimeEntry): number {
  const startMs = entry.clockIn.getTime();
  const endMs = entry.clockOut ? entry.clockOut.getTime() : Date.now();
  const raw = Math.max(0, endMs - startMs);

  const breakMs = (entry.breaks || []).reduce((acc, b) => {
    const s = new Date(b.start).getTime();
    const e = b.end ? new Date(b.end).getTime() : Date.now();
    return acc + Math.max(0, e - s);
  }, 0);

  return Math.max(0, raw - breakMs);
}
