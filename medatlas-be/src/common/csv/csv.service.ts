import { Injectable } from '@nestjs/common';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { TimesheetData } from './interface/timesheet-export.interface';

@Injectable()
export class CsvService {
  toCsv(
    formatted: {
      Date: string;
      'Check In': string;
      'Check Out': string;
      'Meal Breaks': string;
      'Working Hours': number;
    }[],
  ): string {
    if (!formatted.length) return '';

    const headers = Object.keys(formatted[0]);

    const rows = formatted.map((row) =>
      headers
        .map(
          (h) =>
            `"${String(row[h as keyof typeof row] ?? '').replace(/"/g, '""')}"`,
        )
        .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }

  generateTimesheetApprovalCsv(
    timesheetData: TimesheetData,
    approvedBy: string,
    approvalDate: Date,
  ): string {
    const approvalFolder = './uploads/approvals';

    if (!existsSync(approvalFolder)) {
      mkdirSync(approvalFolder, { recursive: true });
    }

    const csvContent = this.createCsvContent(
      timesheetData,
      approvedBy,
      approvalDate,
    );

    const timestamp = approvalDate.toISOString().replace(/[:.]/g, '-');
    const filename = `timesheet-approval-${timesheetData._id}-${timestamp}.csv`;
    const filepath = join(approvalFolder, filename);

    writeFileSync(filepath, csvContent, 'utf8');

    return `/uploads/approvals/${filename}`;
  }

  private createCsvContent(
    timesheetData: TimesheetData,
    approvedBy: string,
    approvalDate: Date,
  ): string {
    const headers = [
      'Timesheet ID',
      'Staff ID',
      'Staff Name',
      'Period Start',
      'Period End',
      'Total Hours',
      'Status',
      'Approved By',
      'Approval Date',
      'Notes',
    ];

    const rows = [
      [
        timesheetData._id || '',
        timesheetData.staffId || '',
        timesheetData.staffName || '',
        timesheetData.periodStart
          ? new Date(timesheetData.periodStart).toISOString().split('T')[0]
          : '',
        timesheetData.periodEnd
          ? new Date(timesheetData.periodEnd).toISOString().split('T')[0]
          : '',
        timesheetData.hours || '0',
        timesheetData.status || '',
        approvedBy,
        approvalDate.toISOString(),
        timesheetData.notes || '',
      ],
    ];

    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','),
      ),
    ];

    return csvLines.join('\n');
  }
}
