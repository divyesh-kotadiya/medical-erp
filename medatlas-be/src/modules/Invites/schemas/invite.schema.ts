// invite.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../Role/schemas/roles.schema';

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Invite {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ type: String, enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;

  @Prop({ type: Date, required: false })
  acceptedAt?: Date;

  @Prop({ type: Date, required: false })
  rejectedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  rejectedBy?: Types.ObjectId;
}

export type InviteDocument = Invite & Document;
export const InviteSchema = SchemaFactory.createForClass(Invite);

InviteSchema.index({ tenantId: 1, email: 1 }, { unique: true });
