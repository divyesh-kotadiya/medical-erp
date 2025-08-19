import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from './schemas/user.schema';
import { Tenant, TenantSchema } from '../Tenants/schemas/tenant.schema';
import { Role, RoleSchema } from '../Role/schemas/roles.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtGuard } from './jwt.guard';
import { InvitesModule } from '../Invites/invites.module';
import { EmailModule } from '../Email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    InvitesModule,
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtGuard],
  exports: [UsersService, JwtGuard],
})
export class UsersModule {}
