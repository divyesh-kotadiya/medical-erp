import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invite, InviteDocument, InviteStatus } from './schemas/invite.schema';
import { Role, RoleDocument, UserRole } from '../Role/schemas/roles.schema';
import { Tenant } from '../Tenants/schemas/tenant.schema';
import { User, UserDocument } from '../Users/schemas/user.schema';
import {
  TenantMember,
  TenantMemberDocument,
} from '../Tenants/schemas/members.schema';
import { CreateInviteDto } from './dto/create-invite.dto';
import { randomBytes } from 'crypto';
import { EmailService } from 'src/common/email/email.service';
import { UserInviteListDto } from './dto/user-invite.dto';

@Injectable()
export class InvitesService {
  constructor(
    @InjectModel(Invite.name) private inviteModel: Model<InviteDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(TenantMember.name)
    private tenantMemberModel: Model<TenantMemberDocument>,
    private emailService: EmailService,
  ) {}

  async createInvite(
    createInviteDto: CreateInviteDto,
    adminUserId: string,
    tenantId: string,
  ) {
    const { email: rawEmail, role: rawRole } = createInviteDto;

    if (!rawEmail) {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }
    if (!tenantId) {
      throw new HttpException('tenantId is required', HttpStatus.BAD_REQUEST);
    }

    const email = rawEmail.trim().toLowerCase();
    const tenantObjectId = new Types.ObjectId(tenantId);

    const adminMembership = await this.tenantMemberModel
      .findOne({
        userId: new Types.ObjectId(adminUserId),
        tenantId: tenantObjectId,
        isTenantAdmin: true,
        disabled: false,
      })
      .exec();

    if (!adminMembership) {
      throw new BadRequestException('Only tenant admins can send invites');
    }

    const tenant = await this.tenantModel.findById(tenantObjectId).exec();
    if (!tenant) {
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
    }

    const now = new Date();
    const existingInvite = await this.inviteModel
      .findOne({
        tenantId: tenantObjectId,
        email,
      })
      .exec();

    if (
      existingInvite &&
      existingInvite.status === InviteStatus.PENDING &&
      !(existingInvite.expiresAt < now)
    ) {
      throw new HttpException(
        'Invite already exists for this email',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      const existingUserMembership = await this.tenantMemberModel
        .findOne({
          tenantId: tenantObjectId,
          userId: existingUser._id,
        })
        .exec();

      if (existingUserMembership) {
        throw new HttpException(
          'User already belongs to this tenant',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const adminUser = await this.userModel.findById(adminUserId).exec();
    if (
      adminUser &&
      adminUser.email &&
      adminUser.email.toLowerCase().trim() === email
    ) {
      throw new HttpException(
        'You cannot invite yourself',
        HttpStatus.BAD_REQUEST,
      );
    }

    let desiredRole: UserRole = UserRole.STAFF;
    if (rawRole && Object.values(UserRole).includes(rawRole as UserRole)) {
      desiredRole = rawRole as UserRole;
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
      let inviteDoc: InviteDocument;
      if (existingInvite) {
        existingInvite.token = token;
        existingInvite.expiresAt = expiresAt;
        existingInvite.role = desiredRole;
        existingInvite.status = InviteStatus.PENDING;
        await existingInvite.save();
        inviteDoc = existingInvite;
      } else {
        inviteDoc = new this.inviteModel({
          tenantId: tenantObjectId,
          role: desiredRole,
          email,
          token,
          expiresAt,
          status: InviteStatus.PENDING,
        });
        await inviteDoc.save();
      }

      const inviteUrl = `${process.env.FRONTEND_URL}/invite?token=${token}`;
      await this.emailService.sendInviteEmail({
        to: email,
        organizationName: `${tenant.name} Organization`,
        inviteUrl,
        adminName: adminUser?.name || 'Admin',
        expiresIn: '7 days',
      });

      return { message: `Invite sent successfully to ${email}` };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new HttpException(
          'Invite already exists (race)',
          HttpStatus.CONFLICT,
        );
      }
      console.error('createInvite error', err);
      throw new HttpException(
        'Failed to create invite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async acceptInvite(token: string, userId: string) {
    const invite = await this.inviteModel.findOne({ token }).exec();
    if (!invite) throw new NotFoundException('Invite not found');

    invite.status = InviteStatus.PENDING;
    invite.acceptedAt = new Date();
    await invite.save();

    const user = await this.userModel
      .findById(new Types.ObjectId(userId))
      .exec();
    if (!user) throw new NotFoundException('User not found');

    if (user.email.toLowerCase().trim() !== invite.email.toLowerCase().trim()) {
      throw new BadRequestException(
        'Logged-in user email does not match invite email',
      );
    }

    const existingMembership = await this.tenantMemberModel
      .findOne({
        tenantId: invite.tenantId,
        userId: user._id,
      })
      .exec();

    if (existingMembership) {
      invite.status = InviteStatus.ACCEPTED;
      invite.acceptedAt = new Date();
      await invite.save();
      throw new BadRequestException('User is already a member of this tenant');
    }

    let role = await this.roleModel
      .findOne({
        tenantId: invite.tenantId,
        role: invite.role,
      })
      .exec();

    if (!role) {
      try {
        role = await this.roleModel.create({
          tenantId: invite.tenantId,
          role: invite.role,
        });
      } catch (err: any) {
        if (err?.code === 11000) {
          role = await this.roleModel
            .findOne({
              tenantId: invite.tenantId,
              role: invite.role,
            })
            .exec();
        } else {
          throw err;
        }
      }
    }

    if (!role) {
      throw new HttpException(
        'Failed to resolve role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await this.tenantMemberModel.create({
        tenantId: invite.tenantId,
        userId: user._id,
        roleId: role._id,
        isTenantAdmin: invite.role === UserRole.ADMIN,
        invitedBy: invite._id,
        disabled: false,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        invite.status = InviteStatus.ACCEPTED;
        invite.acceptedAt = new Date();
        await invite.save();
        throw new BadRequestException('User is already a member (race)');
      }
      console.error('Failed to create TenantMember', err);
      throw new HttpException(
        'Failed to create membership',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    invite.status = InviteStatus.ACCEPTED;
    invite.acceptedAt = new Date();
    await invite.save();

    return { message: 'Invite accepted successfully' };
  }

  async getInvitesForUser(
    userId: string,
    { page = 1, limit = 10 }: UserInviteListDto = {},
  ) {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const query = { email: user.email.toLowerCase().trim() };
    const invites = await this.inviteModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('tenantId', 'name')
      .exec();

    const total = await this.inviteModel.countDocuments(query);

    return {
      data: invites || [],
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  }

  async getInvitesByTenant(
    tenantId: string,
    { page = 1, limit = 10 },
    adminUserId?: string,
  ) {
    const tenantObjectId = new Types.ObjectId(tenantId);

    if (adminUserId) {
      const membership = await this.tenantMemberModel
        .findOne({
          tenantId: tenantObjectId,
          userId: new Types.ObjectId(adminUserId),
          isTenantAdmin: true,
          disabled: false,
        })
        .exec();

      if (!membership) {
        throw new BadRequestException(
          'Only tenant admins can view invites for this tenant',
        );
      }
    }

    const query = { tenantId: tenantObjectId };

    const invites = await this.inviteModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('tenantId', 'name')
      .exec();

    const total = await this.inviteModel.countDocuments(query);

    return {
      data: invites,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    };
  }

  async rejectInvite(token: string, userId: string) {
    const invite = await this.inviteModel.findOne({ token }).exec();
    if (!invite) throw new NotFoundException('Invite not found');

    if (invite.status === InviteStatus.ACCEPTED)
      throw new BadRequestException('Invite already accepted');
    if (invite.status === InviteStatus.REJECTED)
      throw new BadRequestException('Invite already rejected');
    if (invite.expiresAt < new Date())
      throw new BadRequestException('Invite expired');

    const user = await this.userModel
      .findById(new Types.ObjectId(userId))
      .exec();
    if (!user) throw new NotFoundException('User not found');

    if (user.email.toLowerCase().trim() !== invite.email.toLowerCase().trim()) {
      throw new BadRequestException(
        'Logged-in user email does not match invite email',
      );
    }

    invite.status = InviteStatus.REJECTED;
    invite.rejectedAt = new Date();
    invite.rejectedBy = user._id;
    await invite.save();

    return { message: 'Invite rejected' };
  }

  async deleteInvite(id: string, adminUserId?: string): Promise<boolean> {
    const invite = await this.inviteModel.findById(id).exec();
    if (!invite) return false;

    if (adminUserId) {
      const membership = await this.tenantMemberModel
        .findOne({
          tenantId: invite.tenantId,
          userId: new Types.ObjectId(adminUserId),
          isTenantAdmin: true,
          disabled: false,
        })
        .exec();

      if (!membership) {
        throw new BadRequestException('Only tenant admins can delete invites');
      }
    }

    const result = await this.inviteModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
