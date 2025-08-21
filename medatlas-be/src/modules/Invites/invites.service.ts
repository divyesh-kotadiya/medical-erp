import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invite, InviteDocument } from './schemas/invite.schema';
import { Role, UserRole } from '../Role/schemas/roles.schema';
import { Tenant } from '../Tenants/schemas/tenant.schema';
import { User } from '../Users/schemas/user.schema';
import { CreateInviteDto } from './dto/create-invite.dto';
import { randomBytes } from 'crypto';
import { EmailService } from 'src/common/email/email.service';

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

    const exitstingUser = await this.userModel.findOne({
      email,
      tenantId: new Types.ObjectId(tenantId),
    });

    const admin = await this.userModel.findById(adminUserId).exec();

    if (email === admin?.email) {
      throw new HttpException(
        'You cannot invite yourself',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (existingInvite) {
      throw new HttpException(
        'Invite already exists for this email',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (exitstingUser) {
      throw new HttpException(
        'User already exists with this email',
        HttpStatus.BAD_REQUEST,
      );
    }

    const tenant = await this.tenantModel.findById(tenantId).exec();

    if (!tenant) {
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
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

    const inviteUrl = `${process.env.FRONTEND_URL}/invite?token=${token}`;
    await this.emailService.sendInviteEmail({
      to: email,
      organizationName: `${tenant?.name} Organization`,
      inviteUrl,
      adminName: admin?.name || 'Admin',
      expiresIn: '7 days',
    });

    return {
      message: `Invite send successfully User Email will be ${email}`,
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
