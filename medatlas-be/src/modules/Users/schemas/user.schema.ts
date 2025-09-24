import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  phone: string;

  @Prop()
  password?: string;

  @Prop({ default: false })
  disabled: boolean;

  @Prop()
  otpCode?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  avatar?: string;

  _id: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
