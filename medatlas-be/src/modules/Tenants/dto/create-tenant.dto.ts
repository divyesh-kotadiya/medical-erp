import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { TenantType } from '../types/tenant.constants';

export class CreateTenantDto {
  @IsString({ message: 'Tenant name must be a string' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsEnum(TenantType, {
    message: `Type must be one of: ${Object.values(TenantType).join(', ')}`,
  })
  type: TenantType;

  @IsOptional()
  @IsObject({ message: 'Address must be a valid object' })
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @IsOptional()
  @IsObject({ message: 'Contact must be a valid object' })
  contact?: {
    phone: string;
    email: string;
    website?: string;
  };

  @IsOptional()
  @IsObject({ message: 'Settings must be a valid object' })
  settings?: {
    timezone: string;
    currency: string;
    dateFormat: string;
  };
}
