import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
export type DocumentDocument = EDocument & Document;
@Schema({ timestamps: true })
export class EDocument {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) uploadedBy: Types.ObjectId;
  @Prop() filename: string;
  @Prop() url: string;
  @Prop() mimeType: string;
  @Prop() size: number;
  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata?: Record<string, any>;
}
export const DocumentSchema = SchemaFactory.createForClass(EDocument);
