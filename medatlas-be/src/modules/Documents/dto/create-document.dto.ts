import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import {
  DocumentCategory,
  DocumentFileType,
} from '../types/document.constants';
import { Types } from 'mongoose';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  tenantId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  createdBy: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  filename: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsEnum(DocumentFileType)
  fileType: DocumentFileType;

  @IsEnum(DocumentCategory)
  category: DocumentCategory;

  @IsNotEmpty()
  size: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
