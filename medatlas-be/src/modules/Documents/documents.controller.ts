import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import {
  ALLOWED_FILE_TYPES,
  DocumentCategory,
  DocumentFileType,
} from './types/document.constants';
import { JwtGuard } from 'src/common/auth/jwt.guard';

import { promises as fsPromises, existsSync, createReadStream } from 'fs';
import * as path from 'path';
import { Response } from 'express';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'csv':
        return 'text/csv';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  @UseGuards(JwtGuard)
  @Get()
  async find(
    @Query('tenantId') tenantId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('category') category?: string,
  ) {
    if (!tenantId)
      throw new BadRequestException('tenantId query parameter is required');

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    if (
      category &&
      !Object.values(DocumentCategory).includes(category as DocumentCategory)
    ) {
      throw new BadRequestException(`Invalid category: ${category}`);
    }

    return await this.documentsService.findForTenant(
      tenantId,
      pageNumber,
      limitNumber,
      category as DocumentCategory,
    );
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const doc = await this.documentsService.findById(id);
      if (!doc) throw new NotFoundException('Document not found');
      return doc;
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      await this.documentsService.deleteById(id);
      return { message: 'Document deleted successfully' };
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor(
      'file',
      new FileUploadService().getMulterOptions('documents'),
    ),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      tenantId: string;
      createdBy: string;
      category: string;
      metadata?: Record<string, any>;
    },
  ) {
    try {
      if (!file) throw new BadRequestException('File is required');
      if (!body.tenantId) throw new BadRequestException('TenantId is required');
      if (!body.createdBy)
        throw new BadRequestException('CreatedBy user is required');

      const ext = (file.originalname.split('.').pop()?.toLowerCase() ||
        '') as DocumentFileType;
      if (!ALLOWED_FILE_TYPES.includes(ext)) {
        throw new BadRequestException(`Invalid file type: ${ext}`);
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new BadRequestException('File size must not exceed 50MB');
      }

      if (
        !body.category ||
        !Object.values(DocumentCategory).includes(
          body.category as DocumentCategory,
        )
      ) {
        throw new BadRequestException(`Invalid category: ${body.category}`);
      }

      const dto: CreateDocumentDto = {
        tenantId: new Types.ObjectId(body.tenantId),
        createdBy: new Types.ObjectId(body.createdBy),
        filename: file.originalname,
        url: `/uploads/documents/${file.filename}`,
        fileType: ext,
        size: file.size,
        metadata: body.metadata || {},
        category: body.category as DocumentCategory,
      };

      return await this.documentsService.create(dto);
    } catch (err) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      )
        throw err;
      throw new BadRequestException(err.message);
    }
  }

  @UseGuards(JwtGuard)
  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    try {
      const doc = await this.documentsService.findById(id);
      if (!doc) {
        throw new NotFoundException('Document not found');
      }

      const filePath = path.join(process.cwd(), doc.url);

      if (!existsSync(filePath)) {
        throw new NotFoundException('File not found on server');
      }

      const filename = doc.filename || path.basename(filePath);
      const fileStream = createReadStream(filePath);

      console.log(filename, fileStream);

      res.setHeader('Content-Type', this.getContentType(filename));
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.setHeader('Cache-Control', 'no-store');

      fileStream.pipe(res);

      fileStream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).send('Error streaming file');
        }
      });

      fileStream.on('end', () => {
        console.log('File stream completed');
      });
    } catch (error) {
      console.error('Download error:', error);
      if (!res.headersSent) {
        res.status(500).send('Error downloading file');
      }
    }
  }
}
