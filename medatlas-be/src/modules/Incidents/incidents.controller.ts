import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}
  @Get()
  find(@Query('tenantId') tenantId: string) {
    return this.incidentsService.findForTenant(tenantId);
  }
  @Post()
  create(@Body() body: any) {
    return this.incidentsService.create(body);
  }
}
