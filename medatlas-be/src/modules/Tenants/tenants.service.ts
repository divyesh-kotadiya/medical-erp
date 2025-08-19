import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { Role, RoleDocument } from '../Role/schemas/roles.schema';
import { User, UserDocument } from '../Users/schemas/user.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcryptjs';

interface MongoError extends Error {
  name: string;
  message: string;
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createTenantWithAdmin(createTenantDto: CreateTenantDto) {
    const existingTenant = await this.tenantModel
      .findOne({
        name: createTenantDto.name,
      })
      .exec();

    if (existingTenant) {
      throw new BadRequestException('Tenant name already exists');
    }

    const existingUser = await this.userModel
      .findOne({
        email: createTenantDto.adminEmail,
      })
      .exec();

    if (existingUser) {
      throw new BadRequestException('Admin email already exists');
    }

    const tenant = await this.tenantModel.create({
      name: createTenantDto.name,
      metadata: createTenantDto.metadata || {},
    });

    const adminRole = await this.roleModel.create({
      tenantId: tenant._id,
      role: 'ADMIN',
    });

    const currentAdminRole = await this.roleModel.find({ id: tenant._id });

    console.log('current Admin role is =>', currentAdminRole);
    const hashedPassword = await bcrypt.hash(createTenantDto.adminPassword, 10);

    console.log('admin data =>', {
      tenantId: tenant._id,
      roleId: adminRole._id,
      email: createTenantDto.adminEmail,
      name: createTenantDto.adminName,
      password: hashedPassword,
      isTenantAdmin: true,
      disabled: false,
    });
    const adminUser = await this.userModel.create({
      tenantId: tenant._id,
      roleId: adminRole._id,
      email: createTenantDto.adminEmail,
      name: createTenantDto.adminName,
      password: hashedPassword,
      isTenantAdmin: true,
      disabled: false,
    });

    await this.roleModel.findByIdAndUpdate(
      adminRole._id,
      {
        userId: adminUser._id,
        name: `${adminUser._id.toString()}:ADMIN`,
      },
      { new: true },
    );

    return {
      tenant: {
        _id: tenant._id,
        name: tenant.name,
        metadata: tenant.metadata,
      },
      adminUser: {
        _id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name,
        role: currentAdminRole,
      },
    };
  }

  async findById(id: string): Promise<Tenant | null> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid tenant ID provided');
    }

    try {
      const tenant = await this.tenantModel.findById(id).exec();
      if (!tenant) {
        return null;
      }
      return tenant;
    } catch (error: unknown) {
      const mongoError = error as MongoError;
      if (mongoError.name === 'CastError') {
        throw new BadRequestException('Invalid tenant ID format');
      }
      throw error;
    }
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant | null> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid tenant ID provided');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('No update data provided');
    }

    try {
      const existingTenant = await this.tenantModel.findById(id).exec();
      if (!existingTenant) {
        throw new BadRequestException('Tenant not found');
      }

      if (data.name && data.name !== existingTenant.name) {
        const duplicateTenant = await this.tenantModel
          .findOne({ name: data.name, _id: { $ne: id } })
          .exec();

        if (duplicateTenant) {
          throw new BadRequestException('Tenant name already exists');
        }
      }

      const updatedTenant = await this.tenantModel
        .findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .exec();

      return updatedTenant;
    } catch (error: unknown) {
      const mongoError = error as MongoError;
      if (mongoError.name === 'CastError') {
        throw new BadRequestException('Invalid tenant ID format');
      }
      if (mongoError.name === 'ValidationError') {
        throw new BadRequestException(
          `Validation error: ${mongoError.message}`,
        );
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.tenantModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
