import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { WorkflowStep } from '../types/incident.constants';

export class UpdateStepDto {
  @IsNotEmpty()
  @IsEnum(WorkflowStep)
  step: WorkflowStep;

  @IsNotEmpty()
  @IsString()
  completedBy: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
