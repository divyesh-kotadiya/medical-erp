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
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import { JwtGuard } from 'src/common/auth/jwt.guard';
import { Request, Response } from 'express';
import { JwtPayload } from '../Users/interface/jwt.interface';

@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Post('clock-in')
  @UseGuards(JwtGuard)
  clockIn(@Req() req: Request) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    const tenantId = (req.user as JwtPayload & { sub?: string })?.tenantId;
    return this.timesheetsService.clockIn(tenantId, userId);
  }

  @Post('clock-out')
  @UseGuards(JwtGuard)
  clockOut(@Req() req: Request) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    const tenantId = (req.user as JwtPayload & { sub?: string })?.tenantId;
    return this.timesheetsService.clockOut(tenantId, userId);
  }

  @Post('start-break')
  @UseGuards(JwtGuard)
  startBreak(@Req() req: { user: { sub: string } }) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    const tenantId = (req.user as JwtPayload & { sub?: string })?.tenantId;
    return this.timesheetsService.startBreak(tenantId, userId);
  }

  @Post('end-break')
  @UseGuards(JwtGuard)
  endBreak(@Req() req: { user: { sub: string } }) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    const tenantId = (req.user as JwtPayload & { sub?: string })?.tenantId;

    return this.timesheetsService.endBreak(tenantId, userId);
  }

  @Get('status')
  @UseGuards(JwtGuard)
  async getStatus(
    @Req() req: Request,
    @Query('periodStart') periodStart?: string,
    @Query('periodEnd') periodEnd?: string,
  ) {
    const user = req.user as JwtPayload & { sub?: string; tenantId?: string };
    const userId = user.sub;
    const tenantId = user.tenantId;

    const start = periodStart || new Date().toISOString();
    const end = periodEnd || new Date().toISOString();

    return this.timesheetsService.getStatus(tenantId, userId, start, end);
  }

  @Get('daily-summary')
  @UseGuards(JwtGuard)
  getDailySummary(@Req() req: Request) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    return this.timesheetsService.getDailySummary(userId);
  }

  @Get('entries')
  @UseGuards(JwtGuard)
  getEntries(
    @Req() req: Request,
    @Query('periodStart') periodStart?: string,
    @Query('periodEnd') periodEnd?: string,
  ) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    const tenantId = (req.user as JwtPayload & { tenantId?: string })?.tenantId;

    return this.timesheetsService.getEntries(
      tenantId,
      userId,
      periodStart ? new Date(periodStart) : undefined,
      periodEnd ? new Date(periodEnd) : undefined,
    );
  }

  @Post('submit-week')
  @UseGuards(JwtGuard)
  submitWeek(
    @Req() req: Request,
    @Body('periodStart') periodStart: string,
    @Body('periodEnd') periodEnd: string,
  ) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    const tenantId = (req.user as JwtPayload & { tenantId?: string })?.tenantId;
    return this.timesheetsService.submitWeek(
      userId,
      new Date(periodStart),
      new Date(periodEnd),
      tenantId,
    );
  }

  @Post('weekly-total')
  @UseGuards(JwtGuard)
  weeklyTotal(
    @Req() req: Request,
    @Body('periodStart') periodStart: string,
    @Body('periodEnd') periodEnd: string,
  ) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    return this.timesheetsService.getWeeklyTotal(
      userId,
      new Date(periodStart),
      new Date(periodEnd),
    );
  }

  @Post('weekly-total/all')
  @UseGuards(JwtGuard)
  weeklyTotalAll(
    @Req() req: Request,
    @Body('periodStart') periodStart: string,
    @Body('periodEnd') periodEnd: string,
  ) {
    const userId = (req.user as JwtPayload & { sub?: string })?.sub;
    return this.timesheetsService.getWeeklyTotalAll(
      userId,
      new Date(periodStart),
      new Date(periodEnd),
    );
  }

  @Get('submitted')
  @UseGuards(JwtGuard)
  getSubmitted(
    @Req() req: Request,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = (req.user as JwtPayload & { tenantId?: string })?.tenantId;
    return this.timesheetsService.getSubmittedTimesheets(tenantId, {
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
  deleteEntry(@Req() req: Request, @Param('entryId') entryId: string) {
    const tenantId = (req.user as JwtPayload & { tenantId?: string })?.sub;
    return this.timesheetsService.deleteEntry(tenantId, entryId);
  }

  @Get('export')
  @UseGuards(JwtGuard)
  async exportTimesheetCsv(
    @Req() req: Request,
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
    const userId = (req.user as JwtPayload & { tenantId?: string })?.sub;
    const tenantId = (req.user as JwtPayload & { tenantId?: string })?.sub;

    const buffer = await this.timesheetsService.exportTimesheetCsv(
      userId,
      startDate,
      endDate,
      tenantId,
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
