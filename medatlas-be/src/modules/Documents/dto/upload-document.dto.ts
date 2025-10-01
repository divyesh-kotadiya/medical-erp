// src/modules/Documents/dto/upload-document.dto.ts
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsMongoId,
  ValidateIf,
} from 'class-validator';
import {
  DocumentFileType,
  ALLOWED_FILE_TYPES,
} from '../types/document.constants';

export class UploadDocumentDto {
  @IsNotEmpty({ message: 'TenantId is required' })
  @IsMongoId({ message: 'TenantId must be a valid Mongo ID' })
  tenantId: string;

  @IsNotEmpty({ message: 'CreatedBy is required' })
  @IsMongoId({ message: 'CreatedBy must be a valid Mongo ID' })
  createdBy: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @ValidateIf((obj) => obj.fileType !== undefined)
  @IsEnum(ALLOWED_FILE_TYPES, {
    message: `fileType must be one of: ${ALLOWED_FILE_TYPES.join(', ')}`,
  })
  fileType?: DocumentFileType;
}
