import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Incident, IncidentSchema } from './schemas/incident.schema';
import { IncidentController } from './incidents.controller';
import { IncidentService } from './incidents.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Incident.name, schema: IncidentSchema },
    ]),
  ],
  controllers: [IncidentController],
  providers: [IncidentService, FileUploadService],
  exports: [IncidentService],
})
export class IncidentsModule {}
