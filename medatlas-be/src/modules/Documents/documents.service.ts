import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentDocument, EDocument } from './schemas/document.schema';
import { DocumentCategory } from './types/document.constants';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(EDocument.name)
    private readonly documentModel: Model<DocumentDocument>,
  ) {}

  async findForTenant(
    tenantId: string,
    page = 1,
    limit = 10,
    category?: DocumentCategory,
  ): Promise<{
    data: DocumentDocument[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const tenantObjectId = new Types.ObjectId(tenantId);

    const query: any = { tenantId: tenantObjectId };
    if (category) {
      query.category = category;
    }

    const data = await this.documentModel
      .find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.documentModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(dto: CreateDocumentDto): Promise<DocumentDocument> {
    const created = new this.documentModel(dto);
    return created.save();
  }

  async findById(id: string): Promise<DocumentDocument> {
    const doc = await this.documentModel.findById(id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async deleteById(id: string): Promise<void> {
    const doc = await this.documentModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Document not found');
  }
}
