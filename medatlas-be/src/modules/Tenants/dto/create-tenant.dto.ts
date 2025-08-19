import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  adminPassword: string;

  @IsString()
  adminName: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
