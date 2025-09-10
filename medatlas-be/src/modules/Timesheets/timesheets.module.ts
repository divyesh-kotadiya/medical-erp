import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Timesheet, TimesheetSchema } from './schemas/timesheet.schema';
import { TimeEntry, TimeEntrySchema } from './schemas/time-entry.schema';
import { TimesheetsService } from './timesheets.service';
import { TimesheetsController } from './timesheets.controller';
import { CsvModule } from 'src/common/csv/csv.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Timesheet.name, schema: TimesheetSchema },
      { name: TimeEntry.name, schema: TimeEntrySchema },
    ]),
    CsvModule,
  ],
  controllers: [TimesheetsController],
  providers: [TimesheetsService],
  exports: [TimesheetsService],
})
export class TimesheetsModule {}
