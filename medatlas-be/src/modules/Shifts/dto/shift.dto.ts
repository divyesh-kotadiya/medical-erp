import { Type, Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsDate,
  IsOptional,
  IsMongoId,
  IsBoolean,
} from 'class-validator';

export class CreateShiftDto {
  @IsMongoId()
  tenantId: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  staffId?: string;

  @IsDate()
  @Type(() => Date)
  start: Date;

  @IsDate()
  @Type(() => Date)
  end: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateShiftDto {
  @IsMongoId()
  staffId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  cancelled?: boolean;
}
