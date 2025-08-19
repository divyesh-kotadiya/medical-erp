import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { TenantsModule } from './modules/Tenants/tenants.module';
import { UsersModule } from './modules/Users/users.module';
import { ShiftsModule } from './modules/Shifts/shifts.module';
import { TimesheetsModule } from './modules/Timesheets/timesheets.module';
import { IncidentsModule } from './modules/Incidents/incidents.module';
import { DocumentsModule } from './modules/Documents/documents.module';
import { AppController } from './app.controller';
import { RolesModule } from './modules/Role/roles.module';
import { InvitesModule } from './modules/Invites/invites.module';
import { EmailModule } from './modules/Email/email.module';
import { ConfigModule, ConfigService } from './config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getMongodbConfig(),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getJwtConfig(),
    }),
    TenantsModule,
    RolesModule,
    UsersModule,
    InvitesModule,
    EmailModule,
    ShiftsModule,
    TimesheetsModule,
    IncidentsModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class AppModule {}
