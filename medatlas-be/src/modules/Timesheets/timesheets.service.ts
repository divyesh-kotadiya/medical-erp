import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { TimeEntry, TimeEntryDocument } from './schemas/time-entry.schema';
import { Timesheet, TimesheetDocument } from './schemas/timesheet.schema';
import { CsvService } from 'src/common/csv/csv.service';
import { ensureValidObjectId } from 'src/common/utils/mongo.util';
import { calculateEntryWorkingMs } from 'src/common/utils/time.util';

@Injectable()
export class TimesheetsService {
  constructor(
    @InjectModel(TimeEntry.name)
    private readonly timeEntryModel: Model<TimeEntryDocument>,
    @InjectModel(Timesheet.name)
    private readonly timesheetModel: Model<TimesheetDocument>,
    private readonly csvService: CsvService,
  ) { }

  async clockIn(tenantId: string, userId: string) {
    const staffId = ensureValidObjectId(userId);

    const existingOpen = await this.timeEntryModel.findOne({
      staffId,
      clockOut: { $exists: false },
    });
    if (existingOpen) throw new BadRequestException('Already clocked in');

    if (!tenantId) throw new BadRequestException('Tenant ID not provided');

    return this.timeEntryModel.create({
      staffId,
      tenantId,
      clockIn: new Date(),
      breaks: [],
    });
  }

  async clockOut(userId: string) {
    const staffId = ensureValidObjectId(userId);
    const open = await this.timeEntryModel.findOne({
      staffId,
      clockOut: { $exists: false },
    });
    if (!open) throw new BadRequestException('Not clocked in');

    if (open.breaks?.length) {
      const last = open.breaks[open.breaks.length - 1];
      if (last && !last.end) last.end = new Date();
    }

    open.clockOut = new Date();
    await open.save();
    return open;
  }

  async startBreak(userId: string) {
    const staffId = ensureValidObjectId(userId);
    const open = await this.timeEntryModel.findOne({
      staffId,
      clockOut: { $exists: false },
    });
    if (!open) throw new BadRequestException('Not clocked in');

    const hasOpenBreak = (open.breaks || []).some((b) => !b.end);
    if (hasOpenBreak) throw new BadRequestException('Break already started');

    open.breaks.push({ start: new Date() });
    await open.save();
    return open;
  }

  async endBreak(userId: string) {
    const staffId = ensureValidObjectId(userId);
    const open = await this.timeEntryModel.findOne({
      staffId,
      clockOut: { $exists: false },
    });
    if (!open) throw new BadRequestException('Not clocked in');

    const last = (open.breaks || []).slice(-1)[0];
    if (!last || last.end) throw new BadRequestException('No active break');

    last.end = new Date();
    await open.save();
    return open;
  }

  async getStatus(userId: string, periodStart: string, periodEnd: string) {
    const staffId = ensureValidObjectId(userId);

    const open = await this.timeEntryModel.findOne({
      staffId,
      clockOut: { $exists: false },
    });

    const isClockedIn = !!open;
    const isOnBreak = !!open && (open.breaks || []).some((b) => !b.end);

    const parsedStart = new Date(periodStart);
    const parsedEnd = new Date(periodEnd);

    if (isNaN(parsedStart.getTime())) {
      throw new BadRequestException('Invalid periodStart date');
    }
    if (isNaN(parsedEnd.getTime())) {
      throw new BadRequestException('Invalid periodEnd date');
    }

    const submission = await this.timesheetModel.findOne({
      staffId,
      periodStart: { $eq: parsedStart },
      periodEnd: { $eq: parsedEnd },
    });

    return {
      isClockedIn,
      isOnBreak,
      weekStatus: submission?.status?.toUpperCase() || null,
    };
  }

  async getDailySummary(userId: string) {
    const staffId = ensureValidObjectId(userId);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const entries = await this.timeEntryModel.find({
      staffId,
      clockIn: { $gte: start, $lte: end },
    });

    const totalMs = entries.reduce(
      (acc, e) => acc + calculateEntryWorkingMs(e),
      0,
    );
    return { hours: Math.round((totalMs / 3600000) * 100) / 100 };
  }

  async getEntries(userId: string, periodStart?: Date, periodEnd?: Date) {
    const staffId = ensureValidObjectId(userId);
    const filter: any = { staffId };

    if (periodStart && periodEnd) {
      filter.clockIn = {
        $gte: new Date(periodStart),
        $lte: new Date(periodEnd),
      };
    }

    return this.timeEntryModel.find(filter).sort({ clockIn: -1 });
  }

  async getWeeklyTotal(userId: string, periodStart: Date, periodEnd: Date) {
    const staffId = ensureValidObjectId(userId);
    const entries = await this.timeEntryModel.find({
      staffId,
      clockIn: { $gte: periodStart, $lte: periodEnd },
    });

    const totalMs = entries.reduce(
      (sum, e) => sum + calculateEntryWorkingMs(e),
      0,
    );
    return { hours: Math.round((totalMs / 3600000) * 100) / 100 };
  }

  async getWeeklyTotalAll(
    tenantId: string | undefined,
    periodStart: Date,
    periodEnd: Date,
  ) {
    const match: Record<string, any> = {
      clockIn: { $gte: periodStart, $lte: periodEnd },
    };
    if (tenantId && Types.ObjectId.isValid(tenantId)) {
      match.tenantId = new Types.ObjectId(tenantId);
    }

    const entries = await this.timeEntryModel.find(match);
    const totalMs = entries.reduce(
      (sum, e) => sum + calculateEntryWorkingMs(e),
      0,
    );
    return { hours: Math.round((totalMs / 3600000) * 100) / 100 };
  }

  async submitWeek(
    userId: string,
    periodStart: Date,
    periodEnd: Date,
    tenantId?: string,
  ) {
    const staffId = ensureValidObjectId(userId);

    if (!(periodStart instanceof Date) || isNaN(periodStart.getTime())) {
      throw new BadRequestException('Invalid periodStart');
    }
    if (!(periodEnd instanceof Date) || isNaN(periodEnd.getTime())) {
      throw new BadRequestException('Invalid periodEnd');
    }
    if (periodEnd < periodStart) {
      throw new BadRequestException('periodEnd must be after periodStart');
    }

    const open = await this.timeEntryModel.findOne({
      staffId,
      clockOut: { $exists: false },
    });
    if (open)
      throw new BadRequestException('Cannot submit while a session is open');

    const entries = await this.timeEntryModel.find({
      staffId,
      clockIn: { $gte: periodStart, $lte: periodEnd },
    });

    const totalMs = entries.reduce(
      (sum, e) => sum + calculateEntryWorkingMs(e),
      0,
    );
    const hours = Math.round((totalMs / 3600000) * 100) / 100;

    const existing = await this.timesheetModel.findOne({
      staffId,
      periodStart,
      periodEnd,
    });
    if (existing) {
      existing.hours = hours;
      existing.status = 'SUBMITTED';
      if (tenantId && Types.ObjectId.isValid(tenantId)) {
        existing.tenantId = new Types.ObjectId(tenantId);
      }
      await existing.save();
      return existing;
    }

    return this.timesheetModel.create({
      staffId,
      tenantId:
        tenantId && Types.ObjectId.isValid(tenantId)
          ? new Types.ObjectId(tenantId)
          : undefined,
      periodStart,
      periodEnd,
      hours,
      status: 'SUBMITTED',
    });
  }

  async approve(timesheetId: string, approvedBy: string) {
    if (!Types.ObjectId.isValid(timesheetId))
      throw new BadRequestException('Invalid timesheet ID');

    const ts = await this.timesheetModel.findById(timesheetId);
    if (!ts) throw new NotFoundException('Timesheet not found');

    ts.status = 'APPROVED';

    const approvalDate = new Date();
    const timesheetData = {
      _id: ts.id.toString(),
      staffId: ts.staffId.toString(),
      staffName: undefined,
      periodStart: ts.periodStart,
      periodEnd: ts.periodEnd,
      hours: ts.hours,
      status: ts.status,
      notes: ts.notes,
    };

    const csvPath = this.csvService.generateTimesheetApprovalCsv(
      timesheetData,
      approvedBy,
      approvalDate,
    );

    const notes: string[] = [];
    if (ts.notes) notes.push(ts.notes);
    notes.push(`Approved by ${approvedBy} on ${approvalDate.toISOString()}`);
    notes.push(`CSV Report: ${csvPath}`);
    ts.notes = notes.join('\n');

    await ts.save();
    return ts;
  }

  async reject(timesheetId: string, rejectedBy: string, reason?: string) {
    if (!Types.ObjectId.isValid(timesheetId))
      throw new BadRequestException('Invalid timesheet ID');

    const ts = await this.timesheetModel.findById(timesheetId);
    if (!ts) throw new NotFoundException('Timesheet not found');

    ts.status = 'REJECTED';

    const notes: string[] = [];
    if (ts.notes) notes.push(ts.notes);
    notes.push(`Rejected by ${rejectedBy} on ${new Date().toISOString()}`);
    if (reason) notes.push(`Reason: ${reason}`);
    ts.notes = notes.join('\n');

    await ts.save();
    return ts;
  }

  async deleteEntry(userId: string, entryId: string) {
    const staffId = ensureValidObjectId(userId);
    if (!Types.ObjectId.isValid(entryId))
      throw new BadRequestException('Invalid entry ID');

    const deleted = await this.timeEntryModel.findOneAndDelete({
      _id: new Types.ObjectId(entryId),
      staffId,
    });
    if (!deleted) throw new NotFoundException('Time entry not found');

    return { success: true };
  }

  async getSubmittedTimesheets(
    tenantId: string | undefined,
    params: {
      from?: Date;
      to?: Date;
      userId?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const query: FilterQuery<TimesheetDocument> = { status: 'SUBMITTED' };

    if (tenantId && Types.ObjectId.isValid(tenantId)) {
      query.tenantId = new Types.ObjectId(tenantId);
    }
    if (params.userId && Types.ObjectId.isValid(params.userId)) {
      query.staffId = new Types.ObjectId(params.userId);
    }
    if (params.from || params.to) {
      query.periodStart = {};
      if (params.from) query.periodStart.$gte = params.from;
      if (params.to) query.periodStart.$lte = params.to;
    }

    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.max(1, Math.min(100, Number(params.limit || 20)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.timesheetModel
        .find(query)
        .sort({ periodStart: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'staffId',
          select:
            '-password -roleId -tenantId -createdAt -updatedAt -__v -resetPasswordToken -resetPasswordExpires',
        }),
      this.timesheetModel.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  async exportTimesheetCsv(
    userId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<Buffer> {
    const entries = await this.getEntries(userId, periodStart, periodEnd);

    const formatted = entries.map((entry) => ({
      Date: new Date(entry.clockIn).toLocaleDateString(),
      'Check In': new Date(entry.clockIn).toLocaleTimeString(),
      'Check Out': entry.clockOut
        ? new Date(entry.clockOut).toLocaleTimeString()
        : '',
      'Meal Breaks': entry.breaks ? `${entry.breaks.length} break(s)` : '0',
      'Working Hours':
        Math.round((calculateEntryWorkingMs(entry) / 3600000) * 100) / 100,
    }));

    const csv = this.csvService.toCsv(formatted);
    return Buffer.from(csv, 'utf8');
  }
}
