import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Incident, IncidentDocument } from './schemas/incident.schema';
@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident.name) private incModel: Model<IncidentDocument>,
  ) {}
  async create(data: Partial<Incident>) {
    return this.incModel.create(data);
  }
  async findForTenant(tenantId: string) {
    return this.incModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
  }
}
