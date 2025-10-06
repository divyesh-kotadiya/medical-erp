import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { Role, RoleDocument, UserRole } from '../Role/schemas/roles.schema';
import { User, UserDocument } from '../Users/schemas/user.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { HashService } from 'src/common/hash/hash.service';
import { TenantMember, TenantMemberDocument } from './schemas/members.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(TenantMember.name)
    private tenantMemberModel: Model<TenantMemberDocument>,
    private readonly hashService: HashService,
  ) {}

  async createTenant(
    createTenantDto: CreateTenantDto,
    userId: string,
  ): Promise<Tenant> {
    const tenant = await this.tenantModel.create({
      name: createTenantDto.name,
      description: createTenantDto.description,
      type: createTenantDto.type,
      address: createTenantDto.address,
      contact: createTenantDto.contact,
      settings: createTenantDto.settings,
    });

    let adminRole = await this.roleModel.findOne({
      role: UserRole.ADMIN,
      tenantId: tenant._id,
    });

    if (!adminRole) {
      adminRole = await this.roleModel.create({
        role: UserRole.ADMIN,
        tenantId: tenant._id,
      });
    }

    await this.tenantMemberModel.create({
      tenantId: tenant._id,
      userId: new Types.ObjectId(userId),
      roleId: adminRole._id,
      isTenantAdmin: true,
      disabled: false,
    });

    return tenant;
  }

  async findUserTenants(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const memberships = await this.tenantMemberModel
      .find({ userId: new Types.ObjectId(userId), disabled: false })
      .populate('tenantId userId roleId isTenantAdmin')
      .exec();

    const results = memberships.map((m: any) => {
      const user = {
        _id: m.userId._id,
        email: m.userId.email,
      } as User;

      const token = this.hashService.generateAccessToken(
        user,
        m.tenantId._id.toString(),
      );

      return {
        tenant: m.tenantId,
        role: m.roleId,
        isTenantAdmin: m.isTenantAdmin,
        accessToken: token,
      };
    });

    return results;
  }

  async fetchTenantMemebers(tenantId: string) {
    if (!tenantId) throw new Error('Tenant not Found');

    const members = await this.tenantMemberModel.aggregate([
      {
        $match: {
          tenantId: new Types.ObjectId(tenantId),
          disabled: false,
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'User',
        },
      },

      { $unwind: '$User' },

      { $match: { 'User.disabled': false } },

      {
        $project: {
          User: {
            name: 1,
            email: 1,
            avatar: 1,
            _id: 1,
          },
          tenantId: 1,
          disabled: 1,
        },
      },
    ]);

    return members;
  }
}
