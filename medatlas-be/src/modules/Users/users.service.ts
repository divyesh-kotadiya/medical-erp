import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { Tenant } from '../Tenants/schemas/tenant.schema';
import { Role, UserRole } from '../Role/schemas/roles.schema';
import { LoginDto } from './dto/login.dto';
import { InvitesService } from '../Invites/invites.service';
import { randomBytes } from 'crypto';
import { HashService } from 'src/common/hash/hash.service';
import { EmailService } from 'src/common/email/email.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectModel(Role.name) private roleModel: Model<Role>,

    private invitesService: InvitesService,
    private emailService: EmailService,
    private hashService: HashService,
  ) { }

  async registerWithInvite(
    token: string,
    dto: { name: string; password: string },
  ) {
    if (!token) throw new BadRequestException('Invite token is required');

    const invite = await this.invitesService.findByToken(token);

    if (!invite) throw new BadRequestException('Invalid or expired invite');

    if (invite.accepted)
      throw new BadRequestException('Invite has already been accepted');

    const existingUser = await this.findByEmail(invite.email);

    if (existingUser)
      throw new BadRequestException('User with this email already exists');


    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new this.userModel({
      tenantId: invite.tenantId,
      email: invite.email,
      name: dto.name,
      password: hashedPassword,
    });

    await user.save();

    const createdRole = await this.roleModel.create({
      tenantId: invite.tenantId,
      role: invite.role,
      userId: user._id,
      name: `${user._id.toString()}:${invite.role}`,
    });

    user.roleId = new Types.ObjectId(createdRole._id);

    await user.save();

    await this.invitesService.markAsAccepted(token);

    const tenant = await this.tenantModel.findById(invite.tenantId).exec();

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    const userData: {
      id: any;
      user: string;
      email: string;
      role: UserRole;
      isTenantAdmin: boolean;
      disabled: any;
      token: string;
    } = {
      id: user.roleId,
      user: user.name,
      email: user.email,
      role: createdRole.role,
      isTenantAdmin: user.isTenantAdmin,
      disabled: user.tenantId,
      token: token,
    };

    return {
      message: 'Registration successful',
      tenant: {
        _id: tenant._id,
        name: tenant.name,
        metadata: tenant.metadata,
      },
      userData,
    };
  }

  async login(loginDto: LoginDto) {

    if (!loginDto.email || !loginDto.password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.disabled) {
      throw new UnauthorizedException('Account is disabled');
    }

    const isPasswordValid = await this.verifyPassword(
      user as UserDocument,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = await this.roleModel.findById(user.roleId).exec();
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const tenant = await this.tenantModel.findById(user.tenantId).exec();

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    const token = this.hashService.generateToken(user);

    if (!token) {
      throw new BadRequestException('Failed to generate token');
    }
    const userData: {
      id: any;
      user: string;
      email: string;
      role: UserRole;
      isTenantAdmin: boolean;
      disabled: any;
      token: string;
    } = {
      id: user.roleId,
      user: user.name,
      email: user.email,
      role: role.role,
      isTenantAdmin: user.isTenantAdmin,
      disabled: user.tenantId,
      token: token,
    };

    return {
      tenant: {
        _id: tenant._id,
        name: tenant.name,
        metadata: tenant.metadata,
      },
      userData,
    };
  }

  async generateResetToken(email: string): Promise<{ message: string }> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.userModel
      .findByIdAndUpdate(
        (user as UserDocument)._id,
        { resetPasswordToken: token, resetPasswordExpires: expiresAt },
        { new: true },
      )
      .exec();

    const baseUrl = process.env.FRONTEND_URL;

    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      userName: user.name,
      resetUrl,
    });

    return {
      message: 'Reset link sent to your email.',
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async verifyPassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async resetPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {

    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    const encodedToken = decodeURIComponent(token);
    if (!encodedToken) {
      throw new BadRequestException('Invalid token format');
    }

    const user = await this.userModel.findOne({
      resetPasswordToken: encodedToken,
      resetPasswordExpires: { $gt: new Date() },
      disabled: false,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashed = await this.hashService.hashPassword(newPassword);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current and new passwords are required');
    }
    const valid = await this.hashService.verifyPassword(
      currentPassword,
      user?.password,
    );

    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = await this.hashService.hashPassword(newPassword);

    user.password = hashed;

    await user.save();

    return { message: 'Password updated successfully' };
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
