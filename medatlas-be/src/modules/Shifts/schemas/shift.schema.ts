import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
export type ShiftDocument = Shift & Document;
@Schema({ timestamps: true })
export class Shift {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) staffId: Types.ObjectId;
  @Prop({ required: true }) start: Date;
  @Prop({ required: true }) end: Date;
  @Prop({ type: mongoose.Schema.Types.Mixed })
  location?: { type: string; address?: string; lat?: number; lng?: number };
  @Prop() notes: string;
  @Prop({ default: false }) cancelled: boolean;
}
export const ShiftSchema = SchemaFactory.createForClass(Shift);
