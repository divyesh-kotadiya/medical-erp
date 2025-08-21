import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  organization: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
