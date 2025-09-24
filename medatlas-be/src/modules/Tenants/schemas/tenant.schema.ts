import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TenantType } from '../types/tenant.constants';

export type TenantDocument = Tenant & Document;

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: TenantType,
    default: TenantType.OTHER,
    required: true,
  })
  type: TenantType;

  @Prop({
    type: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    _id: false,
  })
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop({
    type: {
      phone: { type: String },
      email: { type: String },
      website: { type: String },
    },
    _id: false,
  })
  contact?: {
    phone: string;
    email: string;
    website?: string;
  };

  @Prop({
    type: {
      timezone: { type: String },
      currency: { type: String },
      dateFormat: { type: String },
    },
    _id: false,
  })
  settings?: {
    timezone: string;
    currency: string;
    dateFormat: string;
  };
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
