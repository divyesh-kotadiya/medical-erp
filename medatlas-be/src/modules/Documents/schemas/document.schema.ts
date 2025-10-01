import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { DocumentCategory } from '../types/document.constants';

export type DocumentDocument = EDocument & Document;

@Schema({ timestamps: true })
export class EDocument {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  filename: string;

  @Prop()
  url: string;

  @Prop()
  fileType: string;

  @Prop()
  size: number;

  @Prop({ type: String, enum: Object.values(DocumentCategory) })
  category: DocumentCategory;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata?: Record<string, any>;
}

export const DocumentSchema = SchemaFactory.createForClass(EDocument);
