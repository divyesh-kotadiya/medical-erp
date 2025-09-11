import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsDate,
  IsEnum,
} from 'class-validator';
import { IncidentType } from '../types/incident.constants';
import { Type } from 'class-transformer';

export class CreateIncidentDto {
  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsString()
  reportedBy: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsEnum(IncidentType)
  incidentType: IncidentType;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  phiDataTypes?: string[];

  @IsNumber()
  @IsOptional()
  individualsAffected?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  occurrenceDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  discoveryDate?: Date;
}
