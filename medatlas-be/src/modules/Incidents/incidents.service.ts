import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { AddAttachmentDto } from './dto/add-attachment.dto';
import { SearchIncidentDto } from './dto/search-incident.dto';
import { Incident, IncidentDocument } from './schemas/incident.schema';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class IncidentService {
  constructor(
    @InjectModel(Incident.name) private incidentModel: Model<IncidentDocument>,
  ) {}

  async create(dto: CreateIncidentDto) {
    const incident = new this.incidentModel(dto);
    return incident.save();
  }

  async findAll(filter: SearchIncidentDto) {
    return this.incidentModel.find(filter).sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const incident = await this.incidentModel.findById(id);
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  async updateStep(id: string, dto: UpdateStepDto) {
    const incident = await this.findOne(id);

    incident.workflowHistory.push({
      step: dto.step,
      completedBy: new Types.ObjectId(dto.completedBy),
      completedAt: new Date(),
      notes: dto.notes,
    });

    incident.currentStep = dto.step;
    await incident.save();
    return incident;
  }

  async addAttachment(id: string, dto: AddAttachmentDto) {
    const incident = await this.findOne(id);
    incident.attachments.push(dto);
    return incident.save();
  }

  async updateStatus(id: string, status: string) {
    const incident = await this.findOne(id);
    incident.status = status;
    return incident.save();
  }

  async deleteAttachment(incidentId: string, attachmentId: string) {
    const incident = await this.incidentModel.findById(incidentId);
    if (!incident) throw new NotFoundException('Incident not found');

    const attachment = incident.attachments.find(
      (a) => a._id?.toString() === attachmentId,
    );
    if (!attachment) throw new NotFoundException('Attachment not found');

    incident.attachments = incident.attachments.filter(
      (a) => a._id?.toString() !== attachmentId,
    );
    await incident.save();

    const filePath = join(process.cwd(), attachment.url);
    try {
      await fs.unlink(filePath);
    } catch {
      console.warn(`File not found on disk: ${filePath}`);
    }

    return { message: 'Attachment deleted successfully' };
  }
}
