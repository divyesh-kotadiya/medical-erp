import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invite, InviteDocument } from './schemas/invite.schema';
import { Role, UserRole } from '../Role/schemas/roles.schema';
import { EmailService } from '../Email/email.service';
import { Tenant } from '../Tenants/schemas/tenant.schema';
import { User } from '../Users/schemas/user.schema';
import { CreateInviteDto } from './dto/create-invite.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitesService {
  constructor(
    @InjectModel(Invite.name) private inviteModel: Model<InviteDocument>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
  ) {}

  async createInvite(
    createInviteDto: CreateInviteDto,
    tenantId: string,
    adminUserId: string,
  ) {
    const { email, role } = createInviteDto;

    const existingInvite = await this.inviteModel.findOne({
      email,
      tenantId: new Types.ObjectId(tenantId),
    });

    if (existingInvite) {
      throw new BadRequestException('Invite already exists for this email');
    }

    const tenant = await this.tenantModel.findById(tenantId).exec();
    const admin = await this.userModel.findById(adminUserId).exec();

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tenantObjectId = new Types.ObjectId(tenantId);

    const desiredRole: UserRole = role ? (role as UserRole) : UserRole.STAFF;

    const invite = new this.inviteModel({
      tenantId: tenantObjectId,
      role: desiredRole,
      email,
      token,
      expiresAt,
      accepted: false,
    });

    await invite.save();

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?token=${token}`;
    await this.emailService.sendInviteEmail({
      to: email,
      organizationName: `${tenant?.name} Organization`,
      inviteUrl,
      adminName: admin?.name || 'Admin',
      expiresIn: '7 days',
    });

    return {
      invite,
      message: 'Invite created successfully',
      inviteUrl,
    };
  }

  async findByToken(token: string): Promise<InviteDocument> {
    const invite = await this.inviteModel.findOne({ token }).exec();

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.accepted) {
      throw new BadRequestException('Invite has already been accepted');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    return invite;
  }

  async markAsAccepted(token: string): Promise<void> {
    const invite = await this.inviteModel.findOne({ token }).exec();

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    invite.accepted = true;
    await invite.save();
  }

  async getInvitesByTenant(tenantId: string): Promise<Invite[]> {
    return this.inviteModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .exec();
  }

  async deleteInvite(id: string): Promise<boolean> {
    const result = await this.inviteModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
