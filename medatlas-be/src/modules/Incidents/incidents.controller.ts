import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  Res,
  NotFoundException,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { SearchIncidentDto } from './dto/search-incident.dto';
import { IncidentService } from './incidents.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { Response } from 'express';
import { join } from 'path';
import { Attachment } from './types/incident.constants';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('incidents')
export class IncidentController {
  constructor(
    private readonly incidentService: IncidentService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  create(@Body() dto: CreateIncidentDto) {
    return this.incidentService.create(dto);
  }

  @Get()
  findAll(@Query() filter: SearchIncidentDto) {
    return this.incidentService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentService.findOne(id);
  }

  @Patch(':id/step')
  updateStep(@Param('id') id: string, @Body() dto: UpdateStepDto) {
    return this.incidentService.updateStep(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.incidentService.updateStatus(id, status);
  }

  @Patch(':id/attachment/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('No File Uploaded');
    }

    // let service handle saving file + path
    const savedFile = this.fileUploadService.handleFileUpload(
      file,
      'incident-attachments',
    );

    const attachment = {
      name: file.originalname,
      url: savedFile.path,
    };

    return this.incidentService.addAttachment(id, attachment);
  }

  @Get(':incidentId/attachment/:attachmentId')
  async downloadAttachment(
    @Param('incidentId') incidentId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ) {
    const incident = await this.incidentService.findOne(incidentId);

    const attachment = incident.attachments.find(
      (a: Attachment) => a._id?.toString() === attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const filePath = join(process.cwd(), attachment.url);

    res.setHeader('Content-Type', 'application/octet-stream');
    return res.download(filePath, attachment.name);
  }

  @Delete(':incidentId/attachment/:attachmentId')
  deleteAttachment(
    @Param('incidentId') incidentId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.incidentService.deleteAttachment(incidentId, attachmentId);
  }
}
