import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type IncidentDocument = Incident & Document;
@Schema({ timestamps: true })
export class Incident {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) reportedBy: Types.ObjectId;
  @Prop() title: string;
  @Prop() description: string;
  @Prop({ enum: ['OPEN', 'IN_REVIEW', 'RESOLVED'], default: 'OPEN' })
  status: string;
  @Prop() attachments: { name: string; url: string }[];
}
export const IncidentSchema = SchemaFactory.createForClass(Incident);
