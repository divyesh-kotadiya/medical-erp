/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsMongoId()
  tenantId: string;

  @IsMongoId()
  roleId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  disabled?: boolean;
}
