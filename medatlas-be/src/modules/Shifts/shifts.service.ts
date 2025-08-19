import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift, ShiftDocument } from './schemas/shift.schema';
@Injectable()
export class ShiftsService {
  constructor(
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
  ) {}
  async create(data: Partial<Shift>) {
    return this.shiftModel.create(data);
  }
  async findForTenant(tenantId: string) {
    return this.shiftModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
  }
}
