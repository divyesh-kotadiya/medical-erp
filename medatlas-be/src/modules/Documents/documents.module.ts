import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentSchema, EDocument } from './schemas/document.schema';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EDocument.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, FileUploadService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
