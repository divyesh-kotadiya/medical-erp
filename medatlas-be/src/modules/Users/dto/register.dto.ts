/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsString,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsMongoId()
  tenantId: string;

  @IsMongoId()
  @IsOptional()
  roleId?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  disabled?: boolean;
}
