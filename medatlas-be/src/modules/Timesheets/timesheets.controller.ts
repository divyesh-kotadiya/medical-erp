/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Res,
  Param,
  Request,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import { JwtGuard } from 'src/common/auth/jwt.guard';
import { Response } from 'express';

@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Post('clock-in')
  @UseGuards(JwtGuard)
  clockIn(
    @Request() req: { user: { sub: string } },
    @Body('tenantId') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.timesheetsService.clockIn(tenantId, req.user.sub);
  }

  @Post('clock-out')
  @UseGuards(JwtGuard)
  clockOut(@Request() req: { user: { sub: string } }) {
    return this.timesheetsService.clockOut(req.user.sub);
  }

  @Post('start-break')
  @UseGuards(JwtGuard)
  startBreak(@Request() req: { user: { sub: string } }) {
    return this.timesheetsService.startBreak(req.user.sub);
  }

  @Post('end-break')
  @UseGuards(JwtGuard)
  endBreak(@Request() req: { user: { sub: string } }) {
    return this.timesheetsService.endBreak(req.user.sub);
  }

  @Get('status')
  @UseGuards(JwtGuard)
  getStatus(
    @Request() req: { user: { sub: string } },
    @Query('periodStart') periodStart: string,
    @Query('periodEnd') periodEnd: string,
  ) {
    return this.timesheetsService.getStatus(
      req.user.sub,
      periodStart,
      periodEnd,
    );
  }

  @Get('daily-summary')
  @UseGuards(JwtGuard)
  getDailySummary(@Request() req: { user: { sub: string } }) {
    return this.timesheetsService.getDailySummary(req.user.sub);
  }

  @Get('entries')
  @UseGuards(JwtGuard)
  getEntries(
    @Request() req: { user: { sub: string } },
    @Query('periodStart') periodStart?: string,
    @Query('periodEnd') periodEnd?: string,
  ) {
    return this.timesheetsService.getEntries(
      req.user.sub,
      periodStart ? new Date(periodStart) : undefined,
      periodEnd ? new Date(periodEnd) : undefined,
    );
  }

  @Post('submit-week')
  @UseGuards(JwtGuard)
  submitWeek(
    @Request() req: { user: { sub: string; tenantId?: string } },
    @Body('periodStart') periodStart: string,
    @Body('periodEnd') periodEnd: string,
  ) {
    return this.timesheetsService.submitWeek(
      req.user.sub,
      new Date(periodStart),
      new Date(periodEnd),
      req.user.tenantId,
    );
  }

  @Post('weekly-total')
  @UseGuards(JwtGuard)
  weeklyTotal(
    @Request() req: { user: { sub: string } },
    @Body('periodStart') periodStart: string,
    @Body('periodEnd') periodEnd: string,
  ) {
    return this.timesheetsService.getWeeklyTotal(
      req.user.sub,
      new Date(periodStart),
      new Date(periodEnd),
    );
  }

  @Post('weekly-total/all')
  @UseGuards(JwtGuard)
  weeklyTotalAll(
    @Request() req: { user: { tenantId?: string } },
    @Body('periodStart') periodStart: string,
    @Body('periodEnd') periodEnd: string,
  ) {
    return this.timesheetsService.getWeeklyTotalAll(
      req.user.tenantId,
      new Date(periodStart),
      new Date(periodEnd),
    );
  }

  @Get('submitted')
  @UseGuards(JwtGuard)
  getSubmitted(
    @Request() req: { user: { tenantId?: string } },
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.timesheetsService.getSubmittedTimesheets(req.user.tenantId, {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      userId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Patch(':id/approve')
  @UseGuards(JwtGuard)
  approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.timesheetsService.approve(id, approvedBy);
  }

  @Patch(':id/reject')
  @UseGuards(JwtGuard)
  reject(
    @Param('id') id: string,
    @Body('rejectedBy') rejectedBy: string,
    @Body('reason') reason?: string,
  ) {
    return this.timesheetsService.reject(id, rejectedBy, reason);
  }

  @Delete('entries/:entryId')
  @UseGuards(JwtGuard)
  deleteEntry(
    @Request() req: { user: { sub: string } },
    @Param('entryId') entryId: string,
  ) {
    return this.timesheetsService.deleteEntry(req.user.sub, entryId);
  }

  @Get('export')
  @UseGuards(JwtGuard)
  async exportTimesheetCsv(
    @Req() req: Request & { user: { sub: string } },
    @Query('periodStart') periodStart: string,
    @Query('periodEnd') periodEnd: string,
    @Res() res: Response,
  ) {
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format for periodStart or periodEnd',
      );
    }

    const buffer = await this.timesheetsService.exportTimesheetCsv(
      req.user.sub,
      startDate,
      endDate,
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="timesheet_${periodStart}_to_${periodEnd}.csv"`,
    );
    res.setHeader('Cache-Control', 'no-store');

    res.send(buffer);
  }
}
