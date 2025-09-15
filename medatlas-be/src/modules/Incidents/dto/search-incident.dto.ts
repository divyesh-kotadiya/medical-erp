import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import {
  IncidentStatus,
  IncidentType,
  WorkflowStep,
} from '../types/incident.constants';
export class SearchIncidentDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;

  @IsOptional()
  @IsEnum(WorkflowStep)
  currentStep?: WorkflowStep;

  @IsOptional()
  @IsString()
  reportedBy?: string;

  @IsOptional()
  @IsEnum(IncidentType)
  incidentType?: IncidentType;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
