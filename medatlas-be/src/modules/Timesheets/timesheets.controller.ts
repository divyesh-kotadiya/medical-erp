import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}
  @Get()
  find(@Query('tenantId') tenantId: string) {
    return this.timesheetsService.findForTenant(tenantId);
  }
  @Post()
  create(@Body() body: any) {
    return this.timesheetsService.create(body);
  }
}
