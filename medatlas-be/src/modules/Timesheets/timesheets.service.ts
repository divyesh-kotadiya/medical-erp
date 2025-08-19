import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Timesheet, TimesheetDocument } from './schemas/timesheet.schema';
@Injectable()
export class TimesheetsService {
  constructor(
    @InjectModel(Timesheet.name) private tsModel: Model<TimesheetDocument>,
  ) {}
  async create(data: Partial<Timesheet>) {
    return this.tsModel.create(data);
  }
  async findForTenant(tenantId: string) {
    return this.tsModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
  }
}
