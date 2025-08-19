import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/roles.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = new this.roleModel(roleData);
    return await role.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().exec();
  }
}
