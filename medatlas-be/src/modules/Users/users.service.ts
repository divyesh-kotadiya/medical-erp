import { ensureValidObjectId } from 'src/common/utils/mongo.util';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/otp-login.dto';
import { randomInt } from 'crypto';
import { HashService } from 'src/common/hash/hash.service';
import { EmailService } from 'src/common/email/email.service';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private hashService: HashService,
    private emailService: EmailService,
  ) { }

  async loginOtp(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userModel.findOne({ email });
    if (!user)
      throw new BadRequestException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });

    if (!user.password) {
      throw new UnauthorizedException('Password not set for this user');
    }

    const isPasswordValid = await this.hashService.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const otp = randomInt(100000, 999999).toString();
    const expiresMinutes = 1;
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    user.otpCode = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    await this.emailService.sendOtpEmail({
      to: user.email,
      userName: user.name,
      otp,
      expiresIn: `${expiresMinutes} minutes`,
    });

    return {
      message: `OTP sent to ${user.email}. It will expire in ${expiresMinutes} minutes.`,
      userId: user._id,
    };
  }

  async resendOtp(userId: string) {
    if (!userId) {
      throw new BadRequestException({
        message: 'User ID is required',
        code: 'USER_ID_REQUIRED',
      });
    }
    const user = await this.userModel?.findOne({ _id: userId });
    if (!user)
      throw new BadRequestException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });

    const otp = randomInt(100000, 999999).toString();
    const expiresMinutes = 0.5;
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    user.otpCode = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    await this.emailService.sendOtpEmail({
      to: user.email,
      userName: user.name,
      otp,
      expiresIn: `${expiresMinutes} minutes`,
    });
    return {
      message: `OTP resent to ${user.email}. It will expire in ${expiresMinutes} minutes.`,
    };
  }

  async verifyOtp(dto: VerifyOtpDto, res: Response) {
    const { userId, otp } = dto;

    const user = await this.userModel.findOne({ _id: userId });
    if (!user || user.disabled) throw new UnauthorizedException('Invalid user');

    if (!user.otpCode || !user.otpExpiresAt)
      throw new UnauthorizedException('OTP not generated');

    if (user.otpCode !== otp || user.otpExpiresAt.getTime() < Date.now())
      throw new UnauthorizedException('Invalid or expired OTP');

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const accessToken = this.hashService.generateAccessToken(user);

    this.logger.log(`User ${user.email} logged in successfully`);
    return {
      data: { id: user._id, name: user.name, email: user.email },
      accessToken,
    };
  }

  async register(dto: RegisterDto) {
    const { email, password, name } = dto;

    if (!email || !password) {
      throw new BadRequestException({
        message: 'Email and password are required',
        code: 'EMAIL_PASSWORD_REQUIRED',
      });
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException({
        message: 'User already exists',
        code: 'USER_ALREADY_EXISTS',
      });
    }

    const hashedPassword = await this.hashService.hashPassword(password);

    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
    });

    const otp = randomInt(100000, 999999).toString();
    const expiresMinutes = 1;
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    await user.save();
    await this.emailService.sendOtpEmail({
      to: user.email,
      userName: user.name,
      otp,
      expiresIn: `${expiresMinutes} minutes`,
    });

    return {
      message: `Registration successful. OTP sent to ${user.email}`,
      userId: user._id,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const otp = randomInt(100000, 999999).toString();
    const expiresMinutes = 0.5;
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    await user.save();

    await this.emailService.sendResetPasswordEmail({
      to: user.email,
      userName: user.name,
      otp,
      expiresIn: `${expiresMinutes} minutes`,
    });

    return {
      message: `Password reset OTP sent to ${user.email}. Expires in ${expiresMinutes} minutes.`,
      userId: user._id,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { userId, otp, newPassword } = dto;

    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('Invalid user');

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new UnauthorizedException('No OTP generated');
    }

    if (user.otpCode !== otp || user.otpExpiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const hashedPassword = await this.hashService.hashPassword(newPassword);
    user.password = hashedPassword;

    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    this.logger.log(`User ${user.email} reset password successfully`);

    const baseUrl = process.env.FRONTEND_URL;

    const resetUrl = `${baseUrl}/login`;

    await this.emailService.sendPasswordResetSuccessEmail(
      user.email,
      user.name,
      resetUrl,
    );

    return { message: 'Password reset successful' };
  }
}
