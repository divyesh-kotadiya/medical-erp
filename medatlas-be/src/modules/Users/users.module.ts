import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Tenant, TenantSchema } from '../Tenants/schemas/tenant.schema';
import { Role, RoleSchema } from '../Role/schemas/roles.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { InvitesModule } from '../Invites/invites.module';
import { HashModule } from 'src/common/hash/hash.module';
import { EmailModule } from 'src/common/email/email.module';
import { AuthModule } from 'src/common/auth/auth.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    HashModule,
    InvitesModule,
    EmailModule,
    AuthModule,
    FileUploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
