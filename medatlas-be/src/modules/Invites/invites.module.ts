import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitesController } from './invites.controller';
import { InvitesService } from './invites.service';
import { Invite, InviteSchema } from './schemas/invite.schema';
import { Role, RoleSchema } from '../Role/schemas/roles.schema';
import { Tenant, TenantSchema } from '../Tenants/schemas/tenant.schema';
import { User, UserSchema } from '../Users/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/common/email/email.module';
import { AuthModule } from 'src/common/auth/auth.module';
import {
  TenantMember,
  TenantMemberSchema,
} from '../Tenants/schemas/members.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invite.name, schema: InviteSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: TenantMember.name, schema: TenantMemberSchema },
    ]),
    EmailModule,
    JwtModule,
    AuthModule,
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
  exports: [InvitesService],
})
export class InvitesModule {}
