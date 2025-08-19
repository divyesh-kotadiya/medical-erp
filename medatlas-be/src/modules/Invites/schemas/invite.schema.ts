import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../Role/schemas/roles.schema';

@Schema({ timestamps: true })
export class Invite {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  accepted: boolean;
}

export type InviteDocument = Invite & Document;
export const InviteSchema = SchemaFactory.createForClass(Invite);
