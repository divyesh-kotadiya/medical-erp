import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from './schemas/user.schema';
import { Tenant } from '../Tenants/schemas/tenant.schema';
import { Role, UserRole } from '../Role/schemas/roles.schema';
import { LoginDto } from './dto/login.dto';
import { InvitesService } from '../Invites/invites.service';
import { randomBytes } from 'crypto';
import { EmailService } from '../Email/email.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    private jwtService: JwtService,
    private invitesService: InvitesService,
    private emailService: EmailService,
  ) {}

  async registerWithInvite(
    token: string,
    dto: { name: string; phone: string; password: string },
  ) {
    console.log('Registering with invite token:', token);
    if (!token) {
      throw new BadRequestException('Invite token is required');
    }
    const invite = await this.invitesService.findByToken(token);

    if (!invite) {
      throw new BadRequestException('Invalid or expired invite');
    }

    const existingUser = await this.findByEmail(invite.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new this.userModel({
      tenantId: invite.tenantId,
      email: invite.email,
      name: dto.name,
      phone: dto.phone,
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

    return { message: 'Registration successful', userId: user._id };
  }

  async login(loginDto: LoginDto) {
    console.log(loginDto.email);
    const user = await this.findByEmail(loginDto.email);
    console.log(user);
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

    const token = this.generateToken(user);

    const userData: {
      tenantId: any;
      id: any;
      user: string;
      email: string;
      role: UserRole;
      isTenantAdmin: boolean;
      disabled: any;
      token: string;
    } = {
      tenantId: user.tenantId,
      id: user.roleId,
      user: user.name,
      email: user.email,
      role: role.role,
      isTenantAdmin: user.isTenantAdmin,
      disabled: user.tenantId,
      token: token,
    };

    return userData;
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
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

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
    if (!newPassword) {
      throw new BadRequestException('New password is required');
    }
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
      disabled: false,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
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

    const valid = await this.verifyPassword(
      user as UserDocument,
      currentPassword,
    );
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private generateToken(user: User) {
    const payload = {
      sub: user?._id?.toString(),
      email: user.email,
      tenantId: user.tenantId?.toString?.(),
      roleId: user.roleId?.toString?.(),
      isTenantAdmin: user.isTenantAdmin,
    };

    return this.jwtService.sign(payload);
  }
}
