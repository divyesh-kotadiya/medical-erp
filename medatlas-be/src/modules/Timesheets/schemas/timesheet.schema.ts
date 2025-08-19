import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type TimesheetDocument = Timesheet & Document;
@Schema({ timestamps: true })
export class Timesheet {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  staffId: Types.ObjectId;
  @Prop({ required: true }) periodStart: Date;
  @Prop({ required: true }) periodEnd: Date;
  @Prop() hours: number;
  @Prop({ enum: ['SUBMITTED', 'APPROVED', 'REJECTED'], default: 'SUBMITTED' })
  status: string;
  @Prop() notes: string;
}
export const TimesheetSchema = SchemaFactory.createForClass(Timesheet);
