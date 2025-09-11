import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  Attachment,
  IncidentStatus,
  IncidentType,
  WorkflowStep,
} from '../types/incident.constants';

export type IncidentDocument = Incident & Document;

@Schema({ timestamps: true })
export class Incident {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedBy: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    enum: IncidentType,
    required: true,
  })
  incidentType: string;

  @Prop({ type: [String], default: [] })
  phiDataTypes: string[];

  @Prop()
  individualsAffected: number;

  @Prop()
  occurrenceDate: Date;

  @Prop()
  discoveryDate: Date;

  @Prop({
    enum: IncidentStatus,
    default: IncidentStatus.OPEN,
  })
  status: string;

  @Prop({
    enum: WorkflowStep,
    default: WorkflowStep.INITIAL_ASSESSMENT,
  })
  currentStep: string;

  @Prop({
    type: [
      {
        step: {
          type: String,
          enum: WorkflowStep,
        },
        completedBy: { type: Types.ObjectId, ref: 'User' },
        completedAt: Date,
        notes: String,
      },
    ],
    default: [],
  })
  workflowHistory: {
    step: string;
    completedBy: Types.ObjectId;
    completedAt: Date;
    notes?: string;
  }[];

  @Prop({
    type: [
      {
        name: String,
        url: String,
      },
    ],
    default: [],
  })
  attachments: Attachment[];
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);
