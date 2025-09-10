import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimeEntryDocument = TimeEntry & Document;

@Schema({ _id: false })
export class TimeBreak {
  @Prop({ required: true })
  start: Date;

  @Prop()
  end?: Date;
}

const TimeBreakSchema = SchemaFactory.createForClass(TimeBreak);

@Schema({ timestamps: true })
export class TimeEntry {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  staffId: Types.ObjectId;

  @Prop({ required: true })
  clockIn: Date;

  @Prop()
  clockOut?: Date;

  @Prop({ type: [TimeBreakSchema], default: [] })
  breaks: TimeBreak[];
  totalHours: number;
}

export const TimeEntrySchema = SchemaFactory.createForClass(TimeEntry);
