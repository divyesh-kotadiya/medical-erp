import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './schemas/tenant.schema';
import { JwtGuard } from 'src/common/auth/jwt.guard';
import { JwtPayload } from '../Users/interface/jwt.interface';
import { Request } from 'express';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post('create')
  @UseGuards(JwtGuard)
  async createTenant(
    @Body() createTenantDto: CreateTenantDto,
    @Req() req: Request,
  ): Promise<Tenant> {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;

    return this.tenantsService.createTenant(createTenantDto, userId);
  }

  @Get('my')
  @UseGuards(JwtGuard)
  async getUserTenants(@Req() req: Request) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;

    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return this.tenantsService.findUserTenants(userId);
  }

  @Post('users')
  @UseGuards(JwtGuard)
  async getAllTenantUsers(@Req() req: Request) {
    const tenantId = (req.user as JwtPayload & { tenantId?: string }).tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant ID not found in token');
    }

    return this.tenantsService.fetchTenantMemebers(tenantId);
  }
}
