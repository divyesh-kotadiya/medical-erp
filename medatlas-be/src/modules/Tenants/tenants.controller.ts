/* eslint-disable no-useless-catch */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './schemas/tenant.schema';
import { JwtGuard } from '../Users/jwt.guard';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  async createTenant(@Body() createTenantDto: CreateTenantDto) {
    try {
      return this.tenantsService.createTenantWithAdmin(createTenantDto);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtGuard)
  @Get()
  async findAll(): Promise<Tenant[]> {
    return this.tenantsService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Tenant | null> {
    return this.tenantsService.findById(id);
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Tenant>,
  ): Promise<Tenant | null> {
    return this.tenantsService.update(id, updateData);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.tenantsService.delete(id);
    return { success };
  }
}
