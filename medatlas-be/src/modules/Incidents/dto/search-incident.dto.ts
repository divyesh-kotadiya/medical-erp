import { IsOptional, IsString, IsEnum } from 'class-validator';
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
  @IsString()
  incidentType: IncidentType;
}
