export interface TimesheetData {
  _id: string;
  staffId: string;
  staffName?: string;
  periodStart: string | Date;
  periodEnd: string | Date;
  hours: number;
  status: string;
  notes?: string;
}
