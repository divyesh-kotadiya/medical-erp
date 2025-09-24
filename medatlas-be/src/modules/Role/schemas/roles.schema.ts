import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  REGULATOR = 'REGULATOR',
}

@Schema({ timestamps: true })
export class Role {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, required: true })
  role: UserRole;
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ tenantId: 1, role: 1 }, { unique: true });
