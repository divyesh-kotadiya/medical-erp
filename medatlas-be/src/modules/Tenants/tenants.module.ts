import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { Role, RoleSchema } from '../Role/schemas/roles.schema';
import { User, UserSchema } from '../Users/schemas/user.schema';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { JwtModule } from '@nestjs/jwt';
import { HashModule } from 'src/common/hash/hash.module';
import { AuthModule } from 'src/common/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule,
    HashModule,
    AuthModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
