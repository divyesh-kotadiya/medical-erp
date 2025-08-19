import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Timesheet, TimesheetSchema } from './schemas/timesheet.schema';
import { TimesheetsService } from './timesheets.service';
import { TimesheetsController } from './timesheets.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Timesheet.name, schema: TimesheetSchema },
    ]),
  ],
  controllers: [TimesheetsController],
  providers: [TimesheetsService],
  exports: [TimesheetsService],
})
export class TimesheetsModule {}
