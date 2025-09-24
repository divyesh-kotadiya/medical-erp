import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './schemas/tenant.schema';
import { JwtGuard } from 'src/common/auth/jwt.guard';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) { }

  @Post('create')
  @UseGuards(JwtGuard)
  async createTenant(
    @Body() createTenantDto: CreateTenantDto,
    @Req() req: any,
  ): Promise<Tenant> {
    const userId = req.user.userId || req.user.sub;
    return this.tenantsService.createTenant(createTenantDto, userId);
  }

  @Get('my')
  @UseGuards(JwtGuard)
  async getUserTenants(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return this.tenantsService.findUserTenants(userId);
  }

  @Post('users')
  @UseGuards(JwtGuard)
  async getAllTenantUsers(@Body('tenantId') tenantId: string) {
    return this.tenantsService.fetchTenantMemebers(tenantId);
  }
}