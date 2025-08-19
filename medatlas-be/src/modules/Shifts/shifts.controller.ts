import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}
  @Get()
  find(@Query('tenantId') tenantId: string) {
    return this.shiftsService.findForTenant(tenantId);
  }
  @Post()
  create(@Body() body: any) {
    return this.shiftsService.create(body);
  }
}
