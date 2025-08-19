import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EDocument, DocumentDocument } from './schemas/document.schema';
@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(EDocument.name) private docModel: Model<DocumentDocument>,
  ) {}
  async create(data: Partial<EDocument>) {
    return this.docModel.create(data);
  }
  async findForTenant(tenantId: string) {
    return this.docModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .lean()
      .exec();
  }
}
