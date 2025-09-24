import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantMemberDocument = TenantMember & Document;

@Schema({ timestamps: true })
export class TenantMember {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role' })
  roleId: Types.ObjectId;

  @Prop({ default: false })
  isTenantAdmin: boolean;

  @Prop({ default: false })
  disabled: boolean;

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  invitedBy?: Types.ObjectId;
}

export const TenantMemberSchema = SchemaFactory.createForClass(TenantMember);

TenantMemberSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
