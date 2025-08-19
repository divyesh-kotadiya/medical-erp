import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type TenantDocument = Tenant & Document;
@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  metadata?: Record<string, any>;
}
export const TenantSchema = SchemaFactory.createForClass(Tenant);
